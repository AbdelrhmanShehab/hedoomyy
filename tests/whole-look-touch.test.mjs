import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";

const compile = source => ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const helpers = await import("data:text/javascript;base64," + Buffer.from(compile(await readFile(new URL("../lib/styling-products.ts", import.meta.url), "utf8"))).toString("base64"));
const products = ["top", "bottom"].map(part => ({ id: part, title: part, category: part, stylingSlot: part, status: "active", price: 100, images: [], colorMockups: [{ color: "Black", image: `${part}.png` }], variants: [{ id: `${part}-s`, color: "Black", size: "S", stock: 3 }] }));

async function harness() {
  let cursor = 0, effects = [], tree;
  const slots = [], captures = new Set();
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ||= { current: initial }; },
    useMemo(fn) { cursor++; return fn(); },
    useEffect(fn, deps) { const i = cursor++, prev = slots[i]; if (!prev || deps.some((v, index) => v !== prev.deps[index])) { prev?.cleanup?.(); const state = { deps }; slots[i] = state; effects.push(() => { state.cleanup = fn(); }); } },
  };
  const icons = Object.fromEntries(["ArrowRight", "Check", "ChevronLeft", "ChevronRight", "RotateCcw", "ShoppingBag", "Shuffle", "SlidersHorizontal", "Sparkles"].map(name => [name, () => null]));
  const mocks = { react, "react/jsx-runtime": jsx, "lucide-react": icons, "@/context/CartContext": { useCart: () => ({ items: [], addItem() {} }) }, "@/context/LanguageContext": { useLanguage: () => ({ lang: "en" }) }, "./WholeLook.module.css": { default: new Proxy({}, { get: (_, key) => key }) }, "@/lib/styling-products": helpers };
  const context = createContext({ console, AbortController, requestAnimationFrame: fn => fn(), fetch: async () => ({ ok: true, json: async () => ({ products, categories: [] }) }) });
  const module = new SourceTextModule(compile(await readFile(new URL("../components/home/WholeLook.tsx", import.meta.url), "utf8")), { context });
  await module.link(async name => { const values = mocks[name]; assert.ok(values, name); return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context }); });
  await module.evaluate();
  function render() { cursor = 0; tree = module.namespace.default(); const pending = effects; effects = []; pending.forEach(fn => fn()); }
  function nodes(node) { if (!node || typeof node !== "object") return []; return [node, ...[node.props?.children].flat(Infinity).flatMap(child => nodes(child))]; }
  function text(node) { if (node == null || typeof node === "boolean") return ""; if (typeof node !== "object") return String(node); return [node.props?.children].flat(Infinity).map(text).join(""); }
  function garment(part) { return nodes(tree).find(node => node.type?.name === "Garment" && node.props.part === part); }
  const element = {
    setPointerCapture(id) { captures.add(id); }, hasPointerCapture(id) { return captures.has(id); }, releasePointerCapture(id) { captures.delete(id); },
    querySelector(selector) { const p = selector.includes('"top"') ? "top" : "bottom"; return { getBoundingClientRect: () => ({ left: 0, top: 0, width: 174 * garment(p).props.placement.zoom, height: 180 * garment(p).props.placement.zoom }) }; },
  };
  render(); await new Promise(resolve => setImmediate(resolve)); render();
  return {
    captures,
    placement: part => ({ ...garment(part).props.placement }),
    selected: () => nodes(tree).find(node => node.props?.role === "tab" && node.props["aria-selected"]).props.id,
    errors: () => nodes(tree).filter(node => node.props?.role === "alert").map(text).join(""),
    chooseSize(value) { nodes(tree).find(node => node.props?.id === "look-variant").props.onChange({ target: { value } }); render(); },
    click(label) { const button = nodes(tree).find(node => node.type === "button" && text(node) === label); assert.ok(button, label); button.props.onClick(); render(); },
    pointer(name, id, x, y, targetPart = "bottom") { const node = nodes(tree).find(node => node.props?.onPointerDown); node.props[name]({ pointerId: id, pointerType: "touch", clientX: x, clientY: y, currentTarget: element, target: { closest: () => targetPart ? ({ dataset: { lookPart: targetPart } }) : null } }); render(); },
  };
}

test("background gestures leave clothes unchanged and allow scrolling", async () => {
  const h = await harness();
  h.pointer("onPointerDown", 1, 100, 100, null);
  h.pointer("onPointerMove", 1, 150, 200, null);
  assert.equal(h.captures.size, 0);
  assert.deepEqual(h.placement("top"), { x: 0, y: 0, zoom: 1 });
});
test("direct contact selects the garment and crossing another piece does not switch it", async () => {
  const h = await harness();
  h.pointer("onPointerDown", 1, 100, 100, "top");
  h.pointer("onPointerMove", 1, 130, 120, "bottom");
  assert.ok(h.placement("top").x > 0);
  assert.equal(h.selected(), "look-tab-top");
  assert.deepEqual(h.placement("bottom"), { x: 0, y: 0, zoom: 1 });
  h.pointer("onPointerUp", 1, 130, 120);
  h.pointer("onPointerDown", 2, 100, 200, "bottom");
  assert.equal(h.selected(), "look-tab-bottom");
  h.pointer("onPointerMove", 2, 120, 220);
  assert.ok(h.placement("bottom").x > 0);
});
test("second finger over another garment pinches the original piece and release stays continuous", async () => {
  const h = await harness();
  h.pointer("onPointerDown", 1, 100, 100, "bottom");
  h.pointer("onPointerDown", 2, 200, 100, "top");
  h.pointer("onPointerMove", 2, 250, 100);
  assert.equal(h.placement("bottom").zoom, 1.5);
  assert.equal(h.placement("top").zoom, 1);
  const before = h.placement("bottom");
  h.pointer("onPointerUp", 2, 250, 100); h.pointer("onPointerMove", 1, 100, 100);
  assert.deepEqual(h.placement("bottom"), before);
  h.pointer("onPointerUp", 1, 100, 100); h.pointer("onPointerMove", 1, 300, 100);
  assert.deepEqual(h.placement("bottom"), before);
});
test("cart validation identifies both missing sizes and updates as each is chosen", async () => {
  const h = await harness(); h.click("Add the whole look");
  assert.match(h.errors(), /Top/); assert.match(h.errors(), /Bottom/);
  assert.equal(h.selected(), "look-tab-top");
  h.chooseSize("top-s");
  assert.doesNotMatch(h.errors(), /Top/); assert.match(h.errors(), /Bottom/);
  h.click("Add the whole look"); assert.equal(h.selected(), "look-tab-bottom");
  h.chooseSize("bottom-s"); assert.equal(h.errors(), "");
});
