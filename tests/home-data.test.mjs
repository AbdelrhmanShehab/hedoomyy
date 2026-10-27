import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/home-data.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { loadHomeData } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const category = { id: "tops", name: "Tops", slug: "tops" };
const product = { id: "top-1", title: "Top" };
const fail = async () => { throw new TypeError("fetch failed"); };

test("a failed collection does not discard other collections", async () => {
  const result = await loadHomeData({ categories: async () => [category], newArrivals: fail, bestSellers: async () => [product] });
  assert.deepEqual(result, { categories: [category], newArrivals: [], bestSellers: [product], unavailable: true });
});
test("a complete network outage produces a recoverable homepage result", async () => {
  const result = await loadHomeData({ categories: fail, newArrivals: fail, bestSellers: fail });
  assert.deepEqual(result, { categories: [], newArrivals: [], bestSellers: [], unavailable: true });
});
test("a subsequent successful request restores collections without a warning", async () => {
  await loadHomeData({ categories: fail, newArrivals: fail, bestSellers: fail });
  const result = await loadHomeData({ categories: async () => [category], newArrivals: async () => [product], bestSellers: async () => [] });
  assert.deepEqual(result, { categories: [category], newArrivals: [product], bestSellers: [], unavailable: false });
});
