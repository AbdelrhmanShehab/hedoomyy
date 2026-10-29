// Read-only integration checks against the authorized storefront checkout/account APIs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import path from 'node:path';
import * as crypto from 'node:crypto';
import { CheckoutError, checkoutErrors, egyptPhone, validDocumentId } from '../lib/checkoutValidation.js';
class NextResponse extends Response { static json(value, options) { return new NextResponse(JSON.stringify(value), options); } }
async function route(name) {
  let writes = 0;
  const values = new Map([['users/buyer', { firstName: 'Old', role: 'worker', status: 'active' }], ['cities/Cairo', { fee: 30 }], ['orders/private', { userId: 'other', items: [] }]]);
  const exports = {
    'next/server': { NextResponse },
    '@/lib/checkoutValidation': { CheckoutError, checkoutErrors, egyptPhone, validDocumentId },
    '@/lib/checkoutService': { createCheckout: async () => { throw new Error('Should not create'); } },
    '@/lib/firebase-admin': {
      requestIdentity: async request => { if (request.headers.get('Authorization') !== 'Bearer signed-in') throw Object.assign(new Error('Please sign in again.'), { status: 401 }); return { uid: 'buyer', email: 'buyer@example.com', email_verified: true }; },
      adminDb: () => ({ collection: collection => ({ doc: id => ({ get: async () => ({ exists: values.has(collection + '/' + id), data: () => values.get(collection + '/' + id) }), set: async (body, options) => { writes++; values.set(collection + '/' + id, { ...(options?.merge ? values.get(collection + '/' + id) : {}), ...body }); } }) }) }),
      adminStorage: () => { throw new Error('Must not upload invalid input'); },
    },
    'node:crypto': crypto,
  };
  const file = new URL('../app/api/' + name + '/route.ts', import.meta.url);
  const source = ts.transpileModule(await readFile(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = new SourceTextModule(source);
  await module.link(async name => { assert.ok(exports[name], name); const values = exports[name]; return new SyntheticModule(Object.keys(values), function() { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }); });
  await module.evaluate();
  return { api: module.namespace, values, writes: () => writes };
}
const request = (method, body, signedIn = true, query = '') => {
  const value = new Request('http://localhost/api/test' + query, { method, headers: { ...(signedIn ? { Authorization: 'Bearer signed-in' } : {}), 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  value.nextUrl = new URL(value.url); return value;
};
test('storefront checkout, profile and payment-proof APIs reject anonymous requests', async () => {
  for (const name of ['orders', 'user-data', 'upload']) {
    const h = await route(name);
    const response = await h.api.POST(request('POST', {}, false));
    assert.equal(response.status, 401); assert.equal(h.writes(), 0);
  }
});
test('profile validation rejects blank names, missing email, malformed phones and addresses', async () => {
  const h = await route('user-data');
  const response = await h.api.POST(request('POST', { uid: 'buyer', firstName: ' ', lastName: ' ', phone: 'wrong', address: '' }));
  assert.equal(response.status, 400); const body = await response.json(); assert.ok(body.fields.firstName); assert.ok(body.fields.phone); assert.ok(body.fields.address); assert.equal(h.writes(), 0);
});
test('profile writes require ownership and preserve role/status despite injected fields', async () => {
  const h = await route('user-data');
  const body = { uid: 'buyer', firstName: 'Good', lastName: 'Buyer', phone: '01012345678', secondPhone: '01112345678', address: '10 Main Street', apartment: '2', city: 'Cairo', role: 'admin', status: 'inactive', email: 'attacker@example.com' };
  assert.equal((await h.api.POST(request('POST', { ...body, uid: 'other' }))).status, 403);
  assert.equal((await h.api.POST(request('POST', body))).status, 200);
  assert.equal(h.values.get('users/buyer').role, 'worker'); assert.equal(h.values.get('users/buyer').status, 'active'); assert.equal(h.values.get('users/buyer').email, 'buyer@example.com');
  assert.equal((await h.api.GET(request('GET', undefined, true, '?uid=other'))).status, 403);
  const own = await (await h.api.GET(request('GET', undefined, true, '?uid=buyer'))).json(); assert.equal(own.role, undefined);
});
test('customer order lookups cannot read another customer order', async () => {
  const h = await route('orders');
  assert.equal((await h.api.GET(request('GET', undefined, true, '?id=private'))).status, 404);
  assert.equal((await h.api.GET(request('GET', undefined, true, '?uid=other'))).status, 403);
});
test('payment-proof upload rejects empty, oversized and disguised files', async () => {
  const h = await route('upload');
  for (const file of [new File([], 'proof.png', { type: 'image/png' }), new File(['<script>bad</script>'], 'proof.png', { type: 'image/png' }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'proof.png', { type: 'image/png' })]) {
    const body = new FormData(); body.append('file', file);
    const request = new Request('http://localhost/api/upload', { method: 'POST', headers: { Authorization: 'Bearer signed-in' }, body });
    assert.equal((await h.api.POST(request)).status, 400);
  }
});
