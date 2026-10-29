import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckout } from '../lib/checkoutService.js';
import { checkoutErrors, sanitizeCheckout } from '../lib/checkoutValidation.js';

const input = () => ({ items: [{ productId: 'shirt', variantId: 'small', qty: 2 }], delivery: { firstName: 'Test', lastName: 'Buyer', phone: '01012345678', secondPhone: '01112345678', address: '10 Main Street', apartment: '2', city: 'Cairo' }, contact: { email: 'buyer@example.com' }, payment: { method: 'cod' } });
function database() {
  const states = new Map([
    ['products/shirt', { title: 'Shirt', price: 100, cost: 60, variants: [{ id: 'small', stock: 10, price: 100, cost: 0 }, { id: 'large', stock: 20 }] }],
    ['cities/Cairo', { fee: 30 }],
  ]);
  let sequence = 0, commits = 0, queue = Promise.resolve();
  const db = {
    collection(name) { return { doc(id = 'generated-' + ++sequence) { return { id, path: name + '/' + id }; } }; },
    runTransaction(callback) {
      const operation = queue.then(async () => {
        const writes = [];
        const result = await callback({
          async get(ref) { assert.equal(writes.length, 0, 'All reads precede writes'); const value = states.get(ref.path); return { exists: states.has(ref.path), data: () => structuredClone(value) }; },
          set(ref, value) { writes.push(() => states.set(ref.path, structuredClone(value))); },
          update(ref, value) { writes.push(() => { const data = structuredClone(states.get(ref.path)); for (const [key, val] of Object.entries(value)) { const keys = key.split('.'); let target = data; while (keys.length > 1) { const k = keys.shift(); target[k] ||= {}; target = target[k]; } target[keys[0]] = structuredClone(val); } states.set(ref.path, data); }); },
        });
        writes.forEach(write => write()); commits++; return result;
      });
      queue = operation.catch(() => {}); return operation;
    },
  };
  return { db, states, get commits() { return commits; } };
}
test('checkout rejects missing/malformed contact and delivery fields, quantities and variant IDs', () => {
  for (const email of ['', ' ', 'person@', 'person@example', 'x\n@example.com']) {
    const body = input(); body.contact.email = email; assert.ok(checkoutErrors(body).email); assert.throws(() => sanitizeCheckout(body));
  }
  for (const qty of [0, -1, 1.5, '2', Infinity, 10001]) { const body = input(); body.items[0].qty = qty; assert.ok(checkoutErrors(body).items); }
  const body = input(); body.delivery.firstName = ' '; body.delivery.phone = '01912345678'; body.items[0].variantId = '../bad';
  assert.ok(checkoutErrors(body).firstName); assert.ok(checkoutErrors(body).phone); assert.ok(checkoutErrors(body).items);
});
test('server ignores forged price, shipping, discounts, status, payment flags and identity', async () => {
  const { db, states } = database(); const body = input();
  Object.assign(body, { status: 'delivered', userId: 'victim', isManual: true, totals: { shipping: 0, discount: 200, total: 0 } });
  Object.assign(body.items[0], { price: 1, cost: -100, returnedQty: 2 }); Object.assign(body.payment, { paid: true, fullyPaid: true, depositAmount: 999 });
  const result = await createCheckout(db, body, 'checkout-reference-123', { uid: 'buyer', email: 'buyer@example.com', email_verified: true });
  const saved = states.get('orders/' + result.orderId);
  assert.equal(saved.status, 'pending'); assert.equal(saved.userId, 'buyer'); assert.equal(saved.isManual, false);
  assert.deepEqual(saved.totals, { subtotal: 200, discount: 0, shipping: 30, total: 230 });
  assert.equal(saved.payment.paid, false); assert.equal(saved.payment.fullyPaid, false); assert.equal(saved.items[0].cost, 0);
  assert.equal(states.get('products/shirt').variants[0].stock, 8);
});
test('checkout atomically aggregates multiple variants and repeated variant lines', async () => {
  const { db, states } = database(); const body = input(); body.items.push({ productId: 'shirt', variantId: 'large', qty: 3 }, { productId: 'shirt', variantId: 'small', qty: 1 });
  await createCheckout(db, body, 'multi-variant-reference');
  assert.deepEqual(states.get('products/shirt').variants.map(v => v.stock), [7, 17]);
  assert.equal(states.get('products/shirt').totalStock, 24);
});
test('missing cities, invalid variants and insufficient aggregated stock leave no writes', async () => {
  for (const mutate of [body => { body.delivery.city = 'Unknown'; }, body => { body.items[0].variantId = 'missing'; }, body => { body.items.push({ productId: 'shirt', variantId: 'small', qty: 10 }); }]) {
    const h = database(), body = input(); mutate(body);
    await assert.rejects(createCheckout(h.db, body, 'invalid-reference-123'));
    assert.equal(h.commits, 0); assert.equal(h.states.size, 2); assert.equal(h.states.get('products/shirt').variants[0].stock, 10);
  }
});
test('checkout retries, including concurrent requests, return one order without another deduction', async () => {
  const { db, states } = database();
  const results = await Promise.all([createCheckout(db, input(), 'idempotent-reference'), createCheckout(db, input(), 'idempotent-reference')]);
  assert.equal(results[0].orderId, results[1].orderId); assert.equal(results[1].duplicate, true);
  assert.equal([...states.keys()].filter(key => key.startsWith('orders/')).length, 1);
  assert.equal(states.get('products/shirt').variants[0].stock, 8);
  const changed = input(); changed.items[0].qty = 3;
  await assert.rejects(createCheckout(db, changed, 'idempotent-reference'), { status: 409 });
});
test('discounts require an active server offer and personal offers require verified identity', async () => {
  const { db, states } = database(), body = input(); body.couponCode = 'SAVE';
  states.set('offers/SAVE', { isActive: false, type: 'all', discountPercentage: 50 });
  await assert.rejects(createCheckout(db, body, 'disabled-offer-reference'));
  states.set('offers/SAVE', { isActive: true, type: 'all', discountPercentage: 10, isPersonal: true, personalEmail: 'buyer@example.com' });
  await assert.rejects(createCheckout(db, body, 'personal-offer-reference'));
  const result = await createCheckout(db, body, 'valid-offer-reference', { uid: 'buyer', email: 'buyer@example.com', email_verified: true });
  assert.equal(result.order.totals.discount, 20); assert.equal(result.order.totals.total, 210);
});

const promo = overrides => ({ kind: 'promo', isActive: true, type: 'all', discountPercentage: 25, usedCount: 0, ...overrides });
test('preview calculates discounted payment without consuming stock, usage or creating orders', async () => {
  const h = database(), body = input(); body.couponCode = 'save';
  h.states.set('offers/SAVE', promo({ maxUses: 1 }));
  const quote = await createCheckout(h.db, body, 'preview-reference-123', null, new Date(), true);
  assert.deepEqual(quote.totals, { subtotal: 200, discount: 50, shipping: 30, total: 180 });
  assert.equal(quote.payment.depositAmount, 150);
  assert.equal(h.states.get('offers/SAVE').usedCount, 0);
  assert.equal(h.states.get('products/shirt').variants[0].stock, 10);
  assert.equal(h.states.size, 3);
});
test('one-use promo admits only one concurrent order and retries do not redeem twice', async () => {
  const h = database(), body = input(); body.couponCode = 'SAVE';
  h.states.set('offers/SAVE', promo({ maxUses: 1 }));
  const results = await Promise.allSettled([createCheckout(h.db, body, 'first-promo-reference'), createCheckout(h.db, body, 'second-promo-reference')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.match(results.find(r => r.status === 'rejected').reason.message, /usage limit/);
  const retried = await createCheckout(h.db, body, 'first-promo-reference');
  assert.equal(retried.duplicate, true);
  assert.equal(h.states.get('offers/SAVE').usedCount, 1);
  assert.equal(h.states.get('products/shirt').variants[0].stock, 8);
});
test('limited promo stops at limit and expiry is checked again after preview', async () => {
  const h = database(), body = input(); body.couponCode = 'SAVE';
  h.states.set('offers/SAVE', promo({ maxUses: 2, expiresAt: '2030-01-01T00:00:00Z' }));
  const before = new Date('2029-12-31T23:59:00Z');
  await createCheckout(h.db, body, 'preview-before-expiry', null, before, true);
  await assert.rejects(createCheckout(h.db, body, 'expired-code-reference', null, new Date('2030-01-01T00:00:00Z')), /expired/);
  assert.equal(h.states.get('offers/SAVE').usedCount, 0);
  await createCheckout(h.db, body, 'limited-first-order', null, before);
  await createCheckout(h.db, body, 'limited-second-order', null, before);
  await assert.rejects(createCheckout(h.db, body, 'limited-third-order', null, before), /usage limit/);
  assert.equal(h.states.get('offers/SAVE').usedCount, 2);
});
test('invalid configuration, ineligible products, disabled codes and stale quotes never consume uses', async () => {
  for (const config of [{ maxUses: 0 }, { usedCount: -1 }, { maxUses: '1' }, { expiresAt: 'bad' }, { isActive: false }, { type: 'product', targetId: 'other' }, { kind: undefined }]) {
    const h = database(), body = input(); body.couponCode = 'SAVE';
    h.states.set('offers/SAVE', promo(config));
    await assert.rejects(createCheckout(h.db, body, 'invalid-promo-order'));
    assert.equal(h.commits, 0);
  }
  const h = database(), body = input(); body.couponCode = 'SAVE'; body.quotedTotal = 1; body.quotedDeposit = 1;
  h.states.set('offers/SAVE', promo({ maxUses: 1 }));
  await assert.rejects(createCheckout(h.db, body, 'changed-quote-order'), /amounts changed/);
  assert.equal(h.states.get('offers/SAVE').usedCount, 0);
});
test('discount targets only eligible lines and unlimited codes still record usage', async () => {
  const h = database(), body = input(); body.couponCode = 'SAVE';
  h.states.set('offers/SAVE', promo({ type: 'product', targetId: 'shirt', fixedAmount: 999 }));
  const result = await createCheckout(h.db, body, 'fixed-discount-order');
  assert.equal(result.order.totals.discount, 200);
  assert.equal(result.order.totals.total, 30);
  assert.equal(result.order.payment.depositAmount, 0);
  assert.equal(h.states.get('offers/SAVE').usedCount, 1);
});

test('promo validation works before contact, address, city or payment are filled', async () => {
  const h = database(); h.states.set('offers/LULU', promo({ maxUses: 1 }));
  const body = { items: input().items, couponCode: 'LULU' };
  const result = await createCheckout(h.db, body, 'cart-promo-reference', null, new Date(), true, true);
  assert.equal(result.totals.discount, 50);
  assert.equal(result.couponCode, 'LULU');
  assert.equal(h.states.get('offers/LULU').usedCount, 0);
  assert.equal(h.states.get('products/shirt').variants[0].stock, 10);
  await assert.rejects(createCheckout(h.db, body, 'cart-promo-reference', null, new Date(), false, true), /cannot place an order/);
  await assert.rejects(createCheckout(h.db, { couponCode: 'LULU', items: [] }, 'cart-promo-reference', null, new Date(), true, true));
});
