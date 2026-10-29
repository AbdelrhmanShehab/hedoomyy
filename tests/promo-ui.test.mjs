import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
const order = { items: [{ productId: 'shirt', variantId: 'small', title: 'Shirt', price: 999, qty: 1 }], contact: { email: 'buyer@example.com' }, delivery: { city: 'Cairo' }, payment: 'online', couponCode: 'SAVE' };
const quote = { totals: { subtotal: 200, discount: 50, shipping: 30, total: 180 }, payment: { depositAmount: 180 } };
async function component(file, checkout, lang = 'en') {
  const source = ts.transpileModule(await readFile(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mocks = { react: React, 'react/jsx-runtime': jsx, 'next/image': { default: props => React.createElement('img', { src: props.src, alt: props.alt }) }, 'next/navigation': { useRouter: () => ({ push() {} }) }, '@/lib/authenticatedFetch': { authenticatedFetch: () => { throw new Error('No fetch during render'); } } };
  const module = new SourceTextModule(source);
  await module.link(async name => {
    let values = mocks[name];
    if (name.includes('CheckoutContext')) values = { useCheckout: () => ({ order, shippingFee: 30, setOrder() {}, ...checkout }) };
    if (name.includes('LanguageContext')) values = { useLanguage: () => ({ lang, t: key => key }) };
    if (name.includes('AuthContext')) values = { useAuth: () => ({ user: { uid: 'buyer' }, loading: false }) };
    if (name.includes('CartContext')) values = { useCart: () => ({ clearCart() {} }) };
    assert.ok(values, name);
    return new SyntheticModule(Object.keys(values), function() { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
  }); await module.evaluate(); return renderToStaticMarkup(React.createElement(module.namespace.default));
}
test('summary renders server subtotal, discount and final total instead of stale cart price', async () => {
  const html = await component('../components/checkout/OrderSummary.tsx', { quote });
  assert.match(html, /EGP 200/); assert.match(html, /EGP 180/); assert.match(html, /SAVE/); assert.match(html, /EGP 50/);
});
test('payment screen hides transfer instructions until quote validates, and displays server payment amount', async () => {
  for (const state of [{ quote: null, quoteLoading: true }, { quote: null, quoteError: 'Code expired' }]) {
    const html = await component('../app/checkout/payment-upload/page.tsx', state);
    assert.doesNotMatch(html, /Amount to transfer|01023202564/);
    assert.match(html, /Back to checkout/);
  }
  const html = await component('../app/checkout/payment-upload/page.tsx', { quote, quoteLoading: false, quoteError: '' });
  assert.match(html, /EGP 180/); assert.match(html, /Promo SAVE/);
});
test('promo form renders apply and remove controls in both storefront languages', async () => {
  const english = await component('../components/checkout/PromoCode.tsx', {});
  assert.match(english, /Promo code/); assert.match(english, /Checking/); assert.match(english, /Remove/);
  const arabic = await component('../components/checkout/PromoCode.tsx', {}, 'ar');
  assert.doesNotMatch(arabic, />Apply</); assert.match(arabic, /value="SAVE"/);
});

test('fully discounted orders can confirm without a zero-value transfer screenshot', async () => {
  const free = { totals: { subtotal: 200, discount: 200, shipping: 0, total: 0 }, payment: { depositAmount: 0 } };
  const html = await component('../app/checkout/payment-upload/page.tsx', { quote: free, quoteLoading: false, quoteError: '' });
  assert.match(html, /No payment is due now/); assert.match(html, /Confirm order/);
  assert.doesNotMatch(html, /Transaction screenshot|01023202564/);
});
