import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/styling-cutout.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { removeStudioBackground } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const image = shade => new Uint8ClampedArray(Array.from({ length: 25 }, () => [shade, shade, shade, 255]).flat());
const paint = (data, x, y, shade) => data.set([shade, shade, shade, 255], (y * 5 + x) * 4);

test("removes white and light gray studio backgrounds and finds garment bounds", () => {
  for (const shade of [255, 241, 220]) {
    const data = image(shade);
    paint(data, 2, 1, 30); paint(data, 2, 2, 30); paint(data, 2, 3, 30);
    assert.deepEqual(removeStudioBackground(data, 5, 5), { left: 2, top: 1, width: 1, height: 3 });
    assert.equal(data[3], 0);
    assert.equal(data[(2 * 5 + 2) * 4 + 3], 255);
  }
});
test("preserves white details enclosed inside a garment", () => {
  const data = image(245);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) paint(data, x, y, 20);
  paint(data, 2, 2, 255);
  removeStudioBackground(data, 5, 5);
  assert.equal(data[(2 * 5 + 2) * 4 + 3], 255);
});
test("returns null for an inseparable blank image so the caller keeps its fallback", () => {
  assert.equal(removeStudioBackground(image(255), 5, 5), null);
});
