import { createHash, randomUUID } from "node:crypto";

type Value = { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean; timestampValue?: string; arrayValue?: { values?: Value[] } };
type Document = { fields?: Record<string, Value>; updateTime?: string };
const project = "hedoomyy";
const base = "https://firestore.googleapis.com/v1/projects/" + project + "/databases/(default)/documents";
const resource = "projects/" + project + "/databases/(default)/documents/";
const number = (value?: Value) => Number(value?.integerValue ?? value?.doubleValue ?? 0);
const text = (value?: Value) => value?.stringValue || "";
const date = (value?: Value) => value?.timestampValue ? Date.parse(value.timestampValue) : number(value);
const str = (value: string): Value => ({ stringValue: value });
const int = (value: number): Value => ({ integerValue: String(value) });
const stamp = (value: number): Value => ({ timestampValue: new Date(value).toISOString() });

export class TrackingError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
async function read(path: string): Promise<Document | null> {
  const response = await fetch(base + "/" + path, { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new TrackingError(503, "Tracking is temporarily unavailable");
  return response.json();
}
export async function recordStoreTracking(input: Record<string, unknown>) {
  const productId = input.productId;
  const event = input.event;
  if (typeof productId !== "string" || !productId || productId.length > 150 || productId.includes("/") || typeof event !== "string" || !["click", "view", "cart", "share"].includes(event)) throw new TrackingError(400, "Invalid tracking event");
  const sessionId = typeof input.sessionId === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(input.sessionId) ? input.sessionId : randomUUID();
  const eventId = typeof input.eventId === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(input.eventId) ? input.eventId : randomUUID();
  const user = input.userInfo && typeof input.userInfo === "object" ? input.userInfo as Record<string, unknown> : {};
  const email = typeof user.email === "string" && user.email.length <= 254 && /^[^\s@/,;<>]+@[^\s@/,;<>]+\.[^\s@/,;<>]+$/.test(user.email) ? user.email.trim().toLowerCase() : "";
  const name = typeof user.name === "string" ? user.name.slice(0, 150) : "";
  const field = ({ click: "clicks", view: "views", cart: "cartAdds", share: "shareCount" } as Record<string, string>)[event];
  const now = Date.now();
  const product = await read("products/" + encodeURIComponent(productId));
  if (!product) throw new TrackingError(404, "Product not found");

  for (let attempt = 0; attempt < 5; attempt++) {
    const settings = await read("settings/tracking");
    const period = date(settings?.fields?.productStatsResetAt);
    const cartPeriod = date(settings?.fields?.cartsResetAt);
    // New periods use new documents: archived source counters are never overwritten.
    const statsId = productId + (period ? "__" + period : "");
    const statsPath = "productStats/" + encodeURIComponent(statsId);
    const previous = await read(statsPath);
    const receipt = createHash("sha256").update(productId + ":" + event + ":" + sessionId + ":" + eventId + ":" + period).digest("hex");
    const receipts = previous?.fields?._recentEvents?.arrayValue?.values?.map(value => text(value)) || [];
    if (receipts.includes(receipt)) return { duplicate: true };
    const statsFields: Record<string, Value> = {
      productId: str(productId), periodStartMs: int(period), isArchived: { booleanValue: false }, updatedAt: stamp(now),
      _recentEvents: { arrayValue: { values: [...receipts, receipt].slice(-250).map(str) } },
    };
    const writes: object[] = [{
      update: { name: resource + "productStats/" + statsId, fields: statsFields },
      updateMask: { fieldPaths: Object.keys(statsFields) },
      currentDocument: previous?.updateTime ? { updateTime: previous.updateTime } : { exists: false },
      updateTransforms: [{ fieldPath: field, increment: int(1) }],
    }];
    if (event === "share") writes.push({ transform: { document: resource + "products/" + productId, fieldTransforms: [{ fieldPath: "shareCount", increment: int(1) }] } });
    if ((email && ["view", "click", "cart"].includes(event)) || event === "cart") {
      const identity = email || "anonymous_" + sessionId;
      const leadId = identity + "_" + productId + (cartPeriod ? "__" + cartPeriod : "");
      const lead = await read("leads/" + encodeURIComponent(leadId));
      const old = lead?.fields || {};
      const lastCart = date(old.lastCartAt || old.updatedAt);
      const open = !old.isArchived?.booleanValue && !["converted", "expired", "dismissed", "completed"].includes(text(old.status));
      const keepCart = open && text(old.lastActivity) === "cart" && lastCart >= Math.max(now - 86400000, cartPeriod);
      const fields: Record<string, Value> = {
        email: str(email), name: str(name || text(old.name)), sessionId: str(sessionId), productId: str(productId),
        isArchived: { booleanValue: false }, updatedAt: stamp(now),
        lastActivity: str(event === "cart" || keepCart ? "cart" : "view"),
        status: str(event !== "cart" && open && text(old.status) === "offered" ? "offered" : "pending"),
      };
      if (event === "cart") fields.lastCartAt = stamp(now);
      writes.push({
        update: { name: resource + "leads/" + leadId, fields }, updateMask: { fieldPaths: Object.keys(fields) },
        currentDocument: lead?.updateTime ? { updateTime: lead.updateTime } : { exists: false },
      });
    }
    const response = await fetch(base + ":commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ writes }) });
    if (response.ok) return { duplicate: false };
    const result = await response.json().catch(() => ({}));
    if ([409, 412].includes(response.status) || ["ABORTED", "FAILED_PRECONDITION", "ALREADY_EXISTS"].includes(result.error?.status)) continue;
    throw new TrackingError(503, "Could not save tracking event");
  }
  throw new TrackingError(503, "Tracking is busy; please retry");
}
