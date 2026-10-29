// This module is also copied to the storefront so browser and server use the same rules.
export class CheckoutError extends Error {
  constructor(message, status = 400, fields = {}) { super(message); this.status = status; this.fields = fields; }
}
export function validEmail(value) {
  return typeof value === 'string' && value.trim().length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(value.trim());
}
export function egyptPhone(value) {
  if (typeof value !== 'string') return '';
  let digits = value.replace(/[\s()+-]/g, '');
  if (digits.startsWith('0020')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('20')) digits = '0' + digits.slice(2);
  return /^01[0125]\d{8}$/.test(digits) ? digits : '';
}
const text = (value, max) => typeof value === 'string' && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : '';
export function checkoutErrors(body) {
  /** @type {Record<string, string>} */
  const errors = {};
  const delivery = body?.delivery || {};
  if (!validEmail(body?.contact?.email)) errors.email = 'Enter a valid email address.';
  for (const [key, label] of [['firstName', 'first name'], ['lastName', 'last name']]) {
    if (text(delivery[key], 80).length < 2) errors[key] = 'Enter your ' + label + ' (2 to 80 characters).';
  }
  if (!egyptPhone(delivery.phone)) errors.phone = 'Enter a valid Egyptian mobile number.';
  if (!egyptPhone(delivery.secondPhone)) errors.secondPhone = 'Enter a valid second mobile number.';
  if (text(delivery.address, 500).length < 5) errors.address = 'Enter the street and building address (5 to 500 characters).';
  if (!text(delivery.apartment, 80)) errors.apartment = 'Enter your apartment or floor (up to 80 characters).';
  if (!text(delivery.city, 120) || delivery.city.includes('/')) errors.city = 'Choose a delivery city.';
  const method = typeof body?.payment === 'string' ? body.payment : body?.payment?.method;
  if (!['cod', 'online'].includes(method)) errors.payment = 'Choose a payment method.';
  if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 100) errors.items = 'Choose between 1 and 100 items.';
  else if (body.items.some(item => !item || !validDocumentId(item.productId) || !validDocumentId(item.variantId) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 10000)) errors.items = 'Choose a valid product, size, colour and quantity for every item.';
  return errors;
}
export function validDocumentId(value) { return typeof value === 'string' && value.length > 0 && value.length <= 150 && !/[\/\u0000-\u001f]/.test(value) && !['.', '..', '__proto__', 'constructor', 'prototype'].includes(value); }
export function sanitizeCheckout(body, cartOnly = false) {
  const allErrors = checkoutErrors(body);
  const errors = cartOnly ? Object.fromEntries(Object.entries(allErrors).filter(([key]) => key === 'items')) : allErrors;
  if (Object.keys(errors).length) throw new CheckoutError('Please check your checkout details.', 400, errors);
  if (body.couponCode != null && (typeof body.couponCode !== 'string' || body.couponCode.trim() && !validDocumentId(body.couponCode.trim()))) throw new CheckoutError('Enter a valid discount code.');
  const method = cartOnly ? 'cod' : typeof body.payment === 'string' ? body.payment : body.payment.method;
  const photo = !cartOnly && typeof body.payment === 'object' ? body.payment.paymentPhotoUrl : null;
  if (photo != null && (typeof photo !== 'string' || photo.length > 2048 || !/^https:\/\//i.test(photo))) throw new CheckoutError('Choose a valid payment screenshot.');
  const delivery = Object.fromEntries(['firstName', 'lastName', 'address', 'apartment', 'city'].map(key => [key, text(body.delivery?.[key], 500)]));
  delivery.phone = egyptPhone(body.delivery?.phone); delivery.secondPhone = egyptPhone(body.delivery?.secondPhone);
  const items = body.items.map(item => ({ productId: item.productId, variantId: item.variantId, qty: item.qty })).sort((a, b) => (a.productId + '/' + a.variantId).localeCompare(b.productId + '/' + b.variantId));
  return { items, contact: { email: text(body.contact?.email, 254).toLowerCase(), phone: delivery.phone }, delivery,
    payment: { method, paymentPhotoUrl: photo || null }, couponCode: text(body.couponCode, 100), notes: text(body.notes || '', 1000) };
}
export function calculateDeposit(subtotal) {
  if (subtotal < 500) return Math.min(150, subtotal);
  if (subtotal < 1000) return 200;
  if (subtotal < 2000) return 250;
  if (subtotal < 4000) return 500;
  return Math.ceil(subtotal * 0.5);
}
