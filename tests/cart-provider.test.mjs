import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';
import * as jsx from 'react/jsx-runtime';
import ts from 'typescript';
const compile = source => ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const cartHelpers = await import('data:text/javascript;base64,' + Buffer.from(compile(await readFile(new URL('../lib/cart-items.ts', import.meta.url), 'utf8'))).toString('base64'));
const item = { productId: 'p', variantId: 'red-s', title: 'Top', price: 100, image: 'p.png', color: 'Red', size: 'S', qty: 1, stock: 3 };
async function harness(saved = []) {
  let cursor = 0, effects = [], tree;
  const slots = [], events = [], states = [], writes = [];
  const user = { email: 'buyer@example.com', displayName: 'Buyer' };
  const react = {
    createContext: () => ({ Provider: 'Provider' }), useContext() {},
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ||= { current: initial }; },
    useEffect(fn, deps) { const i = cursor++, previous = slots[i]; if (!previous || deps.some((v, j) => v !== previous.deps[j])) { previous?.cleanup?.(); const state = { deps }; slots[i] = state; effects.push(() => { state.cleanup = fn(); }); } },
  };
  const mocks = { react, 'react/jsx-runtime': jsx, '@/lib/cart-items': cartHelpers, '@/lib/trackEvent': { trackEvent: (...args) => events.push(args), syncCartState: (...args) => states.push(args) }, '@/context/AuthContext': { useAuth: () => ({ user }) } };
  const context = createContext({ localStorage: { getItem: () => JSON.stringify(saved), setItem: (key, value) => writes.push(JSON.parse(value)) } });
  const module = new SourceTextModule(compile(await readFile(new URL('../context/CartContext.tsx', import.meta.url), 'utf8')), { context });
  await module.link(async name => { const values = mocks[name]; return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context }); });
  await module.evaluate();
  function render() { cursor = 0; tree = module.namespace.CartProvider({ children: null }); const pending = effects; effects = []; pending.forEach(fn => fn()); }
  render(); render();
  return { events, states, writes, value: () => tree.props.value, render };
}
test('saved carts are hydrated before storage writes and cart snapshots', async () => {
  const h = await harness([item]); assert.equal(h.writes[0].length, 1); assert.equal(h.states[0][1], 1); assert.equal(h.events.length, 0);
});
test('successful adds count once and stock-capped adds do not count', async () => {
  const h = await harness();
  h.value().addItem({ ...item, qty: 3 }); h.render();
  h.value().addItem(item); h.render();
  assert.equal(h.events.length, 1); assert.equal(h.events[0][2].email, 'buyer@example.com'); assert.equal(h.value().items[0].qty, 3);
});
test('multiple additions before a render preserve both pieces', async () => {
  const h = await harness(); h.value().addItem(item); h.value().addItem({ ...item, productId: 'q' }); h.render();
  assert.equal(h.value().items.length, 2); assert.equal(h.events.length, 2);
});
test('removing one variant preserves the product cart and clearing sends quantity zero', async () => {
  const h = await harness([item, { ...item, variantId: 'blue-m', qty: 2 }]);
  h.value().removeItem('p', 'red-s'); h.render(); assert.equal(h.states.at(-1)[1], 2);
  h.value().clearCart(); h.render(); assert.equal(h.states.at(-1)[1], 0); assert.equal(h.events.length, 0);
});
