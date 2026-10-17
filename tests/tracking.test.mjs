import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import { createHash, randomUUID } from "node:crypto";
import ts from "typescript";

const source = await readFile(new URL("../lib/tracking-server.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const stamp = n => ({ timestampValue: new Date(n).toISOString() });
const str = value => ({ stringValue: value });
const integer = value => ({ integerValue: String(value) });

async function harness(seed = {}) {
  const documents = new Map(Object.entries({ "products/p": { fields: { title: str("Product") }, updateTime: "version-0" }, ...seed }));
  let sequence = 0;
  let requests = 0;
  const fetch = async (url, init = {}) => {
    requests++;
    const suffix = decodeURIComponent(String(url).split("/documents")[1]);
    if (suffix !== ":commit") {
      const doc = documents.get(suffix.slice(1));
      return Response.json(doc || {}, { status: doc ? 200 : 404 });
    }
    const body = JSON.parse(init.body);
    for (const write of body.writes) {
      if (!write.update) continue;
      const path = write.update.name.split("/documents/")[1];
      const old = documents.get(path);
      const pre = write.currentDocument;
      if (pre?.exists === false && old || pre?.updateTime && pre.updateTime !== old?.updateTime) return Response.json({ error: { status: "FAILED_PRECONDITION" } }, { status: 409 });
    }
    for (const write of body.writes) {
      const path = (write.update?.name || write.transform?.document).split("/documents/")[1];
      const old = documents.get(path);
      const fields = { ...(old?.fields || {}), ...(write.update?.fields || {}) };
      for (const transform of write.updateTransforms || write.transform?.fieldTransforms || []) {
        const before = Number(fields[transform.fieldPath]?.integerValue || fields[transform.fieldPath]?.doubleValue || 0);
        fields[transform.fieldPath] = integer(before + Number(transform.increment.integerValue || transform.increment.doubleValue || 0));
      }
      documents.set(path, { fields, updateTime: "version-" + ++sequence });
    }
    return Response.json({});
  };
  const context = createContext({ fetch, Date, Response, console });
  const module = new SourceTextModule(js, { context });
  await module.link(async name => {
    assert.equal(name, "node:crypto");
    return new SyntheticModule(["createHash", "randomUUID"], function() { this.setExport("createHash", createHash); this.setExport("randomUUID", randomUUID); }, { context });
  });
  await module.evaluate();
  return { track: module.namespace.recordStoreTracking, documents, requests: () => requests };
}
const payload = (event, eventId = "event-1", extra = {}) => ({ productId: "p", event, eventId, sessionId: "browser-1", userInfo: { email: "buyer@example.com", name: "Buyer" }, ...extra });

test("retries and refreshes with the same event ID count one view", async () => {
  const h = await harness();
  await h.track(payload("view"));
  const result = await h.track(payload("view"));
  assert.equal(result.duplicate, true);
  assert.equal(h.documents.get("productStats/p").fields.views.integerValue, "1");
});
test("a product view does not turn a recent cart into mere interest", async () => {
  const h = await harness();
  await h.track(payload("cart", "cart-1"));
  await h.track(payload("view", "view-1"));
  const lead = h.documents.get("leads/buyer@example.com_p").fields;
  assert.equal(lead.lastActivity.stringValue, "cart");
  assert.ok(lead.lastCartAt.timestampValue);
});
test("a new reporting period preserves archived source records", async () => {
  const period = Date.now() - 100;
  const old = { fields: { views: integer(999), isArchived: { booleanValue: true } }, updateTime: "old" };
  const h = await harness({ "settings/tracking": { fields: { productStatsResetAt: stamp(period), cartsResetAt: stamp(period) } }, "productStats/p": old });
  await h.track(payload("view"));
  assert.deepEqual(h.documents.get("productStats/p"), old);
  const current = h.documents.get("productStats/p__" + period).fields;
  assert.equal(current.views.integerValue, "1");
  assert.equal(current.periodStartMs.integerValue, String(period));
  assert.ok(h.documents.has("leads/buyer@example.com_p__" + period));
});
test("anonymous carts get a session identity without invented email addresses", async () => {
  const h = await harness();
  await h.track(payload("cart", "anonymous-cart", { userInfo: undefined }));
  const row = h.documents.get("leads/anonymous_browser-1_p").fields;
  assert.equal(row.email.stringValue, "");
  assert.equal(row.sessionId.stringValue, "browser-1");
});
test("invalid product IDs and event names are rejected before database requests", async () => {
  const h = await harness();
  await assert.rejects(h.track(payload("purchase")), error => error.status === 400);
  await assert.rejects(h.track(payload("view", "e", { productId: "../orders" })), error => error.status === 400);
  assert.equal(h.requests(), 0);
});
test("old cart activity expires instead of surviving later page views", async () => {
  const h = await harness({ "leads/buyer@example.com_p": { fields: { lastActivity: str("cart"), status: str("pending"), lastCartAt: stamp(Date.now() - 90000000) }, updateTime: "old-lead" } });
  await h.track(payload("view"));
  assert.equal(h.documents.get("leads/buyer@example.com_p").fields.lastActivity.stringValue, "view");
});
