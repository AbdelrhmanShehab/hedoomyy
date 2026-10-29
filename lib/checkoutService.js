import { createHash } from 'node:crypto';
import { CheckoutError, sanitizeCheckout, calculateDeposit } from './checkoutValidation.js';
const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
function trustedAmount(value, label) {
  const n = typeof value === 'number' || typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > 1000000000) throw new CheckoutError(label + ' is not configured correctly. Please contact the store.', 409);
  return money(n);
}
/** @param {any} db @param {any} raw @param {string} key @param {{uid?: string, email?: string, email_verified?: boolean} | null} identity */
export async function createCheckout(db, raw, key, identity = null, now = new Date(), preview = false) {
  if (typeof key !== 'string' || !/^[a-zA-Z0-9-]{16,100}$/.test(key)) throw new CheckoutError('Refresh checkout and try again. A checkout reference is required.');
  const input = sanitizeCheckout(raw);
  const fingerprint = createHash('sha256').update(JSON.stringify({ ...input, payment: { method: input.payment.method }, uid: identity?.uid || null })).digest('hex');
  const receiptRef = db.collection('checkout_requests').doc(createHash('sha256').update(key).digest('hex'));
  const orderRef = db.collection('orders').doc();
  return db.runTransaction(async transaction => {
    const receipt = await transaction.get(receiptRef);
    if (receipt.exists) {
      if (receipt.data().fingerprint !== fingerprint) throw new CheckoutError('This checkout reference was used for different details. Start a new checkout.', 409);
      return { orderId: receipt.data().orderId, duplicate: true, order: null };
    }
    const products = new Map();
    for (const item of input.items) if (!products.has(item.productId)) {
      const ref = db.collection('products').doc(item.productId), snap = await transaction.get(ref);
      if (!snap.exists || snap.data().isArchived || snap.data().isActive === false) throw new CheckoutError('A product is no longer available.', 409);
      products.set(item.productId, { ref, data: structuredClone(snap.data()) });
    }
    const citySnap = await transaction.get(db.collection('cities').doc(input.delivery.city));
    if (!citySnap.exists || citySnap.data().isActive === false) throw new CheckoutError('Choose an available delivery city.', 400, { city: 'Choose an available delivery city.' });
    const shipping = trustedAmount(citySnap.data().fee, 'Delivery fee');
    let offer = null, offerRef = null;
    if (input.couponCode) {
      offerRef = db.collection('offers').doc(input.couponCode);
      let snap = await transaction.get(offerRef);
      if (!snap.exists && input.couponCode !== input.couponCode.toUpperCase()) {
        offerRef = db.collection('offers').doc(input.couponCode.toUpperCase());
        snap = await transaction.get(offerRef);
        if (snap.exists && snap.data().kind === 'promo') input.couponCode = input.couponCode.toUpperCase();
        else throw new CheckoutError('Discount code is not valid.');
      }
      if (!snap.exists) throw new CheckoutError('Discount code is not valid.');
      offer = snap.data();
      if (!offer.isPersonal && offer.kind !== 'promo') throw new CheckoutError('This offer is already included in product prices.');
      const used = offer.usedCount ?? 0;
      if (!Number.isSafeInteger(used) || used < 0 || offer.maxUses != null && (!Number.isSafeInteger(offer.maxUses) || offer.maxUses < 1)) throw new CheckoutError('Discount usage is not configured correctly.', 409);
      if (offer.maxUses != null && used >= offer.maxUses) throw new CheckoutError('This discount code has reached its usage limit.');
      const expiry = offer.expiresAt?.toMillis?.() ?? (offer.expiresAt ? Date.parse(offer.expiresAt) : null);
      if (offer.isActive !== true || expiry !== null && (!Number.isFinite(expiry) || expiry <= now.getTime())) throw new CheckoutError('Discount code is not active.');
      if (offer.isPersonal && (!identity?.email_verified || !identity?.email || identity.email.toLowerCase() !== String(offer.personalEmail).toLowerCase())) throw new CheckoutError('This code is not available for your account.');
    }
    const items = [], grouped = new Map();
    for (const line of input.items) {
      const group = line.productId + '/' + line.variantId;
      grouped.set(group, { ...line, qty: line.qty + (grouped.get(group)?.qty || 0) });
    }
    let subtotal = 0;
    for (const line of grouped.values()) {
      const product = products.get(line.productId).data;
      const variants = Array.isArray(product.variants) ? product.variants : [];
      if (variants.some(variant => !Number.isInteger(variant.stock) || variant.stock < 0)) throw new CheckoutError('Product stock needs to be checked. Please contact the store.', 409);
      const matches = variants.filter(variant => variant.id === line.variantId);
      if (matches.length !== 1) throw new CheckoutError('Choose an available size and colour.', 409);
      const variant = matches[0];
      if (!Number.isInteger(variant.stock) || variant.stock < line.qty || line.qty > 10000) throw new CheckoutError('There is not enough stock for this order.', 409);
      const price = trustedAmount(variant.price ?? product.price, 'Product price');
      const storedCost = variant.cost ?? product.cost;
      const cost = storedCost == null ? null : trustedAmount(storedCost, 'Product cost');
      variant.stock -= line.qty;
      const color = variant.color || '', size = variant.size || '', title = product.title || 'Product';
      items.push({ ...line, quantity: line.qty, title, productName: title, price, cost, returnedQty: 0, color, size, variant: variant.name || [color, size].filter(Boolean).join(' / '), sku: variant.sku || product.sku || '', category: product.category || '', image: variant.image || product.images?.[0] || '', productImage: variant.image || product.images?.[0] || '' });
      subtotal += price * line.qty;
    }
    subtotal = money(subtotal);
    let discount = 0;
    if (offer) {
      const eligible = items.filter(item => offer.type === 'all' || offer.type === 'product' && item.productId === offer.targetId || offer.type === 'category' && item.category === offer.targetId);
      const eligibleTotal = eligible.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (!eligibleTotal) throw new CheckoutError('This code does not apply to the selected items.');
      if (offer.fixedAmount != null) discount = Math.min(eligibleTotal, trustedAmount(offer.fixedAmount, 'Discount'));
      else {
        const percentage = trustedAmount(offer.discountPercentage, 'Discount');
        if (percentage > 100) throw new CheckoutError('Discount code is not configured correctly.', 409);
        discount = money(eligibleTotal * percentage / 100);
      }
    }
    const total = money(subtotal - discount + shipping);
    const payment = { ...input.payment, paid: false, fullyPaid: false, verified: false, depositType: input.payment.method === 'cod' ? 'deposit' : 'full', depositAmount: input.payment.method === 'cod' ? calculateDeposit(subtotal - discount) : total };
    const order = { id: orderRef.id, userId: identity?.uid || null, isManual: false, source: 'storefront', status: 'pending', isArchived: false, items,
      totals: { subtotal, shipping, discount, total }, originalTotals: { subtotal, shipping, discount, total }, payment, contact: input.contact, delivery: input.delivery,
      customer: { name: [input.delivery.firstName, input.delivery.lastName].join(' '), email: input.contact.email, phone: input.delivery.phone, city: input.delivery.city, address: input.delivery.address }, notes: input.notes, createdAt: now, updatedAt: now, financialVersion: 2 };
    if (offer) order.coupon = { code: input.couponCode, discountAmount: discount };
    if (preview) return { totals: order.totals, payment: { depositAmount: payment.depositAmount }, couponCode: input.couponCode };
    if (raw.quotedTotal !== undefined && (raw.quotedTotal !== total || raw.quotedDeposit !== payment.depositAmount)) throw new CheckoutError('Checkout amounts changed. Review the updated payment amount before confirming.', 409);
    if (offerRef) transaction.update(offerRef, { usedCount: (offer.usedCount ?? 0) + 1, lastUsedAt: now });
    for (const { ref, data } of products.values()) transaction.update(ref, { variants: data.variants, totalStock: data.variants.reduce((sum, variant) => sum + variant.stock, 0) });
    transaction.set(orderRef, order);
    transaction.set(receiptRef, { fingerprint, orderId: orderRef.id, createdAt: now });
    return { orderId: orderRef.id, duplicate: false, order };
  });
}
