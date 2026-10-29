import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import { createCheckout } from '../lib/checkoutService.js';
import { CheckoutError } from '../lib/checkoutValidation.js';
class NextResponse extends Response { static json(value, init) { return new NextResponse(JSON.stringify(value), init); } }
const buyer = { uid: 'buyer', email: 'buyer@example.com', email_verified: true };
const input = { items: [{ productId: 'shirt', variantId: 'small', qty: 1 }], contact: { email: buyer.email }, delivery: { firstName: 'Test', lastName: 'Buyer', phone: '01012345678', secondPhone: '01112345678', address: '10 Main Street', apartment: '2', city: 'Cairo' }, payment: { method: 'online' }, couponCode: 'SAVE' };
function database() {
  const values = new Map([['products/shirt', { title: 'Shirt', price: 200, variants: [{ id: 'small', stock: 10 }] }], ['cities/Cairo', { fee: 30 }]]);
  let sequence = 0;
  const snapshot = path => ({ exists: values.has(path), data: () => structuredClone(values.get(path)) });
  const db = { collection(name) { return {
    async get() { return { docs: [...values.keys()].filter(path => path.startsWith(name + '/')).map(path => ({ id: path.split('/')[1], ...snapshot(path) })) }; },
    doc(id = 'generated-' + ++sequence) { const path = name + '/' + id; return { id, path, async create(data) { if (values.has(path)) throw Object.assign(new Error('exists'), { code: 6 }); values.set(path, structuredClone(data)); } }; },
    where(field, operator, value) { return { async get() { return { docs: [...values.entries()].filter(([path, data]) => path.startsWith(name + '/') && data[field] === value).map(([path]) => ({ id: path.split('/')[1], ...snapshot(path) })) }; } }; }
  }; }, async runTransaction(callback) {
    const writes = [];
    const result = await callback({ get: async ref => { assert.equal(writes.length, 0); return snapshot(ref.path); }, set: (ref, data) => writes.push(() => values.set(ref.path, structuredClone(data))), update: (ref, data) => writes.push(() => values.set(ref.path, { ...values.get(ref.path), ...structuredClone(data) })) });
    writes.forEach(write => write()); return result;
  } }; return { db, values };
}
async function load(file, mocks) {
  const source = ts.transpileModule(await readFile(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = new SourceTextModule(source);
  await module.link(async name => { assert.ok(mocks[name], name); const exports = mocks[name]; return new SyntheticModule(Object.keys(exports), function() { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }); });
  await module.evaluate(); return module.namespace;
}
function request(body, token = 'staff', method = 'POST') { return new Request('http://localhost/api/test', { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Idempotency-Key': 'whole-flow-reference' }, ...(method === 'GET' ? {} : { body: JSON.stringify(body) }) }); }

test('dashboard creation -> storefront quote -> order -> retry -> exhausted promo -> disable', async () => {
  const h = database();
  const staff = await load(process.env.HEDOOMYY_DASHBOARD_ROUTE || '../../Dashboard-ecommerce/src/app/api/promocodes/route.js', { 'next/server': { NextResponse }, '../../../firebaseAdmin': { getAdminDb: () => h.db }, '../../../utils/authMiddleware': { verifyAuth: async req => req.headers.get('Authorization') === 'Bearer staff' ? { uid: 'admin' } : NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } });
  const payload = { code: 'SAVE', type: 'all', discountPercentage: 25, maxUses: 1, expiresAt: '2099-01-01T00:00:00Z' };
  assert.equal((await staff.POST(request(payload, 'buyer'))).status, 403);
  for (const invalid of [{ maxUses: 0 }, { maxUses: 1.5 }, { expiresAt: 'bad' }, { discountPercentage: 101 }, { code: '../bad' }]) assert.equal((await staff.POST(request({ ...payload, ...invalid }))).status, 400);
  assert.equal((await staff.POST(request(payload))).status, 201);
  assert.equal((await staff.POST(request(payload))).status, 409);
  const listed = await staff.GET(request(undefined, 'staff', 'GET'));
  assert.equal(listed.status, 200);
  const listing = await listed.json(); assert.equal(listing.codes[0].code, 'SAVE'); assert.equal(listing.products[0].name, 'Shirt');
  const mocks = { 'next/server': { NextResponse }, '@/lib/firebase-admin': { adminDb: () => h.db, requestIdentity: async req => { if (req.headers.get('Authorization') !== 'Bearer buyer') throw Object.assign(new Error('Sign in'), { status: 401 }); return buyer; } }, '@/lib/checkoutService': { createCheckout }, '@/lib/checkoutValidation': { CheckoutError }, '@/lib/email-service': { sendOrderConfirmationEmail: async () => {} }, '@/lib/firestore-server': { fetchUserOrders: async () => [], fetchOrderById: async () => null } };
  const promoApi = await load('../app/api/promocodes/validate/route.ts', mocks);
  const cartOnly = { couponCode: 'SAVE', items: input.items };
  const promoResponse = await promoApi.POST(request(cartOnly, 'buyer'));
  assert.equal(promoResponse.status, 200);
  assert.deepEqual(await promoResponse.json(), { code: 'SAVE', discount: 50 });
  assert.equal((await promoApi.POST(request({ ...cartOnly, couponCode: 'missing' }, 'buyer'))).status, 400);
  assert.equal((await promoApi.POST(request({ ...cartOnly, couponCode: '' }, 'buyer'))).status, 400);
  assert.equal(h.values.get('offers/SAVE').usedCount, 0);
  const unconfiguredApi = await load('../app/api/promocodes/validate/route.ts', { ...mocks, '@/lib/firebase-admin': { adminDb: () => { throw new Error('Firebase Admin is not configured'); }, requestIdentity: async () => buyer } });
  const unavailable = await unconfiguredApi.POST(request(cartOnly, 'buyer'));
  assert.equal(unavailable.status, 503); assert.match((await unavailable.json()).error, /server is not configured/);
  const quoteApi = await load('../app/api/checkout/quote/route.ts', mocks);
  assert.equal((await quoteApi.POST(request(input, 'anonymous'))).status, 401);
  const response = await quoteApi.POST(request(input, 'buyer'));
  assert.equal(response.status, 200);
  const quote = await response.json();
  assert.deepEqual(quote.totals, { subtotal: 200, shipping: 30, discount: 50, total: 180 });
  assert.equal(h.values.get('offers/SAVE').usedCount, 0);
  const orderApi = await load('../app/api/orders/route.ts', mocks);
  const body = { ...input, quotedTotal: quote.totals.total, quotedDeposit: quote.payment.depositAmount, totals: { discount: 200, total: 0 } };
  const placed = await orderApi.POST(request(body, 'buyer'));
  assert.equal(placed.status, 201);
  const order = await placed.json();
  assert.equal(h.values.get('orders/' + order.orderId).totals.total, 180);
  assert.equal(h.values.get('offers/SAVE').usedCount, 1);
  assert.equal((await orderApi.POST(request(body, 'buyer'))).status, 200);
  assert.equal(h.values.get('offers/SAVE').usedCount, 1);
  assert.equal((await quoteApi.POST(request(input, 'buyer'))).status, 400);
  assert.equal((await staff.PATCH(request({ code: 'SAVE', isActive: false }, 'staff', 'PATCH'))).status, 200);
  assert.equal(h.values.get('offers/SAVE').isActive, false);
  assert.equal((await staff.PATCH(request({ code: 'SAVE', maxUses: 2, expiresAt: null }, 'staff', 'PATCH'))).status, 200);
  assert.equal(h.values.get('offers/SAVE').usedCount, 1);
  assert.equal(h.values.get('offers/SAVE').maxUses, 2);
  assert.equal((await staff.PATCH(request({ code: 'SAVE', maxUses: 0 }, 'staff', 'PATCH'))).status, 400);
});
