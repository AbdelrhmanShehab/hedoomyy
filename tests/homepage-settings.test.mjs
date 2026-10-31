import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { homeSections, sectionVisibility } from '../lib/home-sections.js';
async function load(file, mocks) {
  const source = ts.transpileModule(await readFile(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = new SourceTextModule(source);
  await module.link(async name => { const values = mocks[name]; assert.ok(values, name); return new SyntheticModule(Object.keys(values), function() { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }); });
  await module.evaluate(); return module.namespace;
}
class NextResponse extends Response { static json(value, init) { return new NextResponse(JSON.stringify(value), init); } }
const request = (method, body, role = 'admin') => new Request('http://localhost/api/homepage', { method, headers: { Authorization: role, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
test('homepage settings default to visible and accept only explicit false as hidden', () => {
  assert.ok(Object.values(sectionVisibility()).every(Boolean));
  assert.equal(sectionVisibility({ hero: false, banner: 'false' }).hero, false);
  assert.equal(sectionVisibility({ hero: false, banner: 'false' }).banner, true);
});
test('only admin can update visibility; toggles preserve other sections and website settings', async () => {
  const state = { sections: { hero: false }, unrelated: 'preserved' };
  const api = await load('../../Dashboard-ecommerce/src/app/api/homepage/route.js', {
    'next/server': { NextResponse }, '../../../utils/home-sections': { homeSections, sectionVisibility },
    '../../../utils/authMiddleware': { verifyAuth: async req => req.headers.get('Authorization') === 'admin' ? { uid: 'admin' } : NextResponse.json({ error: 'Forbidden' }, { status: 403 }) },
    '../../../firebaseAdmin': { getAdminDb: () => ({ collection: name => { assert.equal(name, 'settings'); return { doc: id => { assert.equal(id, 'homepage'); return { get: async () => ({ data: () => state }), set: async (value, options) => { assert.equal(options.merge, true); Object.assign(state.sections, value.sections); } }; } }; } }) },
  });
  assert.equal((await api.GET(request('GET', null, 'worker'))).status, 403);
  assert.equal((await api.PATCH(request('PATCH', { section: 'banner', visible: false }, 'worker'))).status, 403);
  for (const body of [{ section: 'unknown', visible: false }, { section: 'hero', visible: 'false' }, { section: '__proto__', visible: true }]) assert.equal((await api.PATCH(request('PATCH', body))).status, 400);
  assert.equal((await api.PATCH(request('PATCH', { section: 'banner', visible: false }))).status, 200);
  assert.equal(state.sections.hero, false); assert.equal(state.sections.banner, false); assert.equal(state.unrelated, 'preserved');
  assert.equal((await api.PATCH(request('PATCH', { section: 'banner', visible: true }))).status, 200);
  const response = await (await api.GET(request('GET'))).json(); assert.equal(response.sections.banner, true); assert.equal(response.sections.hero, false);
});
test('homepage rendering hides each disabled section while keeping header and footer', async () => {
  const section = name => () => React.createElement('span', { 'data-section': name }, name);
  let visibility = {};
  const mocks = { 'react/jsx-runtime': jsx, 'next/image': { default: section('banner') }, 'next/script': { default: () => null }, '../public/hedoomyybanner.png': { default: {} }, '@/lib/home-sections': { sectionVisibility }, '@/lib/home-data': { loadHomeData: async () => ({ categories: [], newArrivals: [], bestSellers: [], unavailable: false }) }, '@/lib/firestore-server': { fetchHomeSections: async () => visibility, fetchCategories() {}, fetchNewArrivals() {}, fetchBestSellers() {} }, '@/components/ErrorBoundary': { default: ({ children }) => children } };
  for (const [path, id] of [['Header','header'],['Footer','footer'],['home/Hero','hero'],['home/Categories','categories'],['home/WholeLook','wholeLook'],['home/NewArrivals','newArrivals'],['home/BestSeller','bestSellers'],['home/Feedback','feedback'],['InstagramFeed','instagram'],['home/CatalogRetry','retry']]) mocks['@/components/' + path] = { default: section(id) };
  const module = await load('../app/page.tsx', mocks);
  for (const { id } of homeSections) {
    visibility = { [id]: false };
    const html = renderToStaticMarkup(await module.default());
    assert.ok(!html.includes('data-section="' + id + '"'), id);
    assert.match(html, /data-section="header"/); assert.match(html, /data-section="footer"/);
  }
});
test('order discount clearly shows savings and promo code, with no badge on full-price orders', async () => {
  const module = await load('../../Dashboard-ecommerce/src/components/OrderDiscount.js', { 'react/jsx-runtime': jsx });
  assert.equal(renderToStaticMarkup(React.createElement(module.default, { order: { totals: { discount: 0 } } })), '');
  for (const compact of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(module.default, { compact, order: { totals: { discount: 60 }, coupon: { code: 'SAVE20' } } }));
    assert.match(html, /Promo SAVE20/); assert.match(html, /60 EGP/);
  }
  const html = renderToStaticMarkup(React.createElement(module.default, { order: { totals: { discount: 25 } } })); assert.match(html, /Discount/);
});
