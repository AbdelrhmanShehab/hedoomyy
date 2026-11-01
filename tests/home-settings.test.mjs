import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(await readFile(new URL('../lib/firestore-server.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;

async function harness(fetch, adminData) {
  let adminReads = 0;
  const warnings = [];
  const context = createContext({ fetch, AbortSignal, console: { warn: (...args) => warnings.push(args), error() {} } });
  const module = new SourceTextModule(source, { context, importModuleDynamically: async name => {
    assert.equal(name, './firebase-admin');
    const dependency = new SyntheticModule(['adminDb'], function () { this.setExport('adminDb', () => { adminReads++; return { collection: () => ({ doc: () => ({ get: async () => ({ exists: true, data: () => ({ sections: adminData }) }) }) }) }; }); }, { context });
    await dependency.link(() => {}); await dependency.evaluate(); return dependency;
  } });
  await module.link(() => {}); await module.evaluate();
  const result = await module.namespace.fetchHomeSections();
  return { result: JSON.parse(JSON.stringify(result)), adminReads, warnings };
}
test('missing settings defaults without requiring admin credentials or logging an error', async () => {
  const h = await harness(async () => new Response('{}', { status: 404 }));
  assert.deepEqual(h.result, {}); assert.equal(h.adminReads, 0); assert.equal(h.warnings.length, 0);
});
test('public settings preserve explicitly hidden sections with fresh reads', async () => {
  const h = await harness(async (url, options) => {
    assert.ok(url.endsWith('/settings/homepage')); assert.equal(options.cache, 'no-store');
    return Response.json({ fields: { sections: { mapValue: { fields: { wholeLook: { booleanValue: false }, banner: { booleanValue: true } } } } } });
  });
  assert.deepEqual(h.result, { wholeLook: false, banner: true }); assert.equal(h.adminReads, 0);
});
test('restricted settings retain the admin read path', async () => {
  const h = await harness(async () => new Response('{}', { status: 403 }), { wholeLook: false });
  assert.deepEqual(h.result, { wholeLook: false }); assert.equal(h.adminReads, 1);
});
test('network failures keep the homepage available with a diagnostic', async () => {
  const h = await harness(async () => { throw new TypeError('fetch failed'); });
  assert.deepEqual(h.result, {}); assert.equal(h.warnings.length, 1);
});
