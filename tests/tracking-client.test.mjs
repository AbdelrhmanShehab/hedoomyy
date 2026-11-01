import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, SourceTextModule } from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(await readFile(new URL('../lib/trackEvent.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
async function harness(failFirst = false) {
  const requests = []; let sequence = 0;
  const session = new Map();
  const context = createContext({ Date, crypto: { randomUUID: () => 'id-' + ++sequence }, sessionStorage: { getItem: key => session.get(key), setItem: (key, value) => session.set(key, value) }, setTimeout: fn => fn(), fetch: async (url, options) => { requests.push(JSON.parse(options.body)); if (failFirst && requests.length === 1) throw new TypeError('Network unavailable'); return { ok: true, status: 200 }; } });
  const module = new SourceTextModule(source, { context }); await module.link(() => {}); await module.evaluate();
  return { api: module.namespace, requests, flush: () => new Promise(resolve => setImmediate(resolve)) };
}
test('signing in does not create a second view or click identity for the same session/day', async () => {
  const h = await harness();
  h.api.trackEvent('p', 'view'); await h.flush();
  h.api.trackEvent('p', 'view', { email: 'buyer@example.com' }); await h.flush();
  assert.equal(h.requests[0].sessionId, h.requests[1].sessionId);
  assert.equal(h.requests[0].eventId, h.requests[1].eventId);
});
test('transport retries reuse the event ID and real additions get distinct event IDs', async () => {
  const h = await harness(true);
  h.api.trackEvent('p', 'cart'); await h.flush();
  assert.equal(h.requests.length, 2); assert.equal(h.requests[0].eventId, h.requests[1].eventId);
  h.api.trackEvent('p', 'cart'); await h.flush();
  assert.notEqual(h.requests[1].eventId, h.requests[2].eventId);
});
test('cart snapshots are versioned separately and never sent as cart-add events', async () => {
  const h = await harness(); h.api.syncCartState('p', 2); h.api.syncCartState('p', 0); await h.flush();
  assert.ok(h.requests.every(r => r.event === 'cart_state'));
  assert.ok(h.requests[1].revision > h.requests[0].revision);
  assert.equal(h.requests[1].quantity, 0);
});
