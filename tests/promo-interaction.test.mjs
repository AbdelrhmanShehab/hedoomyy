import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
async function harness() {
  let order = { items: [{ productId: 'shirt', variantId: 'small', qty: 1 }], couponCode: '' };
  let cursor = 0, effects = [], tree;
  const slots = [], requests = [];
  const react = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) { previous?.cleanup?.(); const state = { deps }; slots[index] = state; effects.push(() => { state.cleanup = callback(); }); }
    },
  };
  const mocks = { react, 'react/jsx-runtime': jsx, '@/context/CheckoutContext': { useCheckout: () => ({ order, setOrder: update => { order = update(order); }, quote: null, quoteError: '' }) }, '@/context/LanguageContext': { useLanguage: () => ({ lang: 'en' }) }, '@/lib/authenticatedFetch': { authenticatedFetch: (url, options) => new Promise(resolve => requests.push({ url, body: JSON.parse(options.body), resolve })) } };
  const source = ts.transpileModule(await readFile(new URL('../components/checkout/PromoCode.tsx', import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText;
  const module = new SourceTextModule(source);
  await module.link(async name => { const values = mocks[name]; assert.ok(values, name); return new SyntheticModule(Object.keys(values), function() { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }); });
  await module.evaluate();
  function render() { cursor = 0; tree = module.namespace.default(); const pending = effects; effects = []; pending.forEach(callback => callback()); return tree; }
  function all(node) { if (!node || typeof node !== 'object') return []; return [node, ...[node.props?.children].flat(Infinity).flatMap(child => all(child))]; }
  function text(node) { if (node == null || typeof node === 'boolean') return ''; if (typeof node !== 'object') return String(node); return [node.props?.children].flat(Infinity).map(text).join(' '); }
  render();
  return { render, text: () => text(tree), requests,
    type(value) { all(tree).find(node => node.type === 'input').props.onChange({ target: { value } }); render(); },
    click(label) { const button = all(tree).find(node => node.type === 'button' && text(node) === label); assert.ok(button, label); assert.ok(!button.props.disabled); button.props.onClick(); render(); },
    async reply(index, ok, data) { requests[index].resolve({ ok, json: async () => data }); await new Promise(resolve => setImmediate(resolve)); render(); },
    changeCart() { order = { ...order, items: [{ ...order.items[0], qty: 2 }] }; render(); },
  };
}
test('Apply sends cart-only validation and reports success, error, same-code retry and removal', async () => {
  const h = await harness();
  h.click('Apply'); assert.match(h.text(), /Enter a promo code/);
  h.type('LULU'); h.click('Apply');
  assert.match(h.text(), /Checking promo code/);
  assert.deepEqual(h.requests[0].body, { couponCode: 'LULU', items: [{ productId: 'shirt', variantId: 'small', qty: 1 }] });
  await h.reply(0, true, { code: 'LULU', discount: 50 });
  assert.match(h.text(), /Promo code LULU applied. You save EGP 50/);
  h.changeCart(); assert.match(h.text(), /Checking promo code/);
  await h.reply(1, false, { error: 'This discount code has expired.' });
  assert.match(h.text(), /has expired/); assert.doesNotMatch(h.text(), /applied/);
  h.click('Apply'); assert.equal(h.requests.length, 3);
  await h.reply(2, false, { error: 'Promo validation is temporarily unavailable because the store server is not configured.' });
  assert.match(h.text(), /server is not configured/);
  h.click('Remove'); assert.doesNotMatch(h.text(), /has expired|server is not configured|applied/);
});
test('removed codes ignore late validation responses', async () => {
  const h = await harness(); h.type('LULU'); h.click('Apply'); h.click('Remove');
  await h.reply(0, true, { discount: 50 }); assert.doesNotMatch(h.text(), /applied/);
});
