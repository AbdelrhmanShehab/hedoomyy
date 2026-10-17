export type TrackableEvent = "click" | "view" | "cart" | "share";
const pending = new Set<string>();
let memorySession = "";
function session() {
  if (!memorySession) memorySession = crypto.randomUUID();
  try {
    const existing = sessionStorage.getItem("tracking-session");
    if (existing) return existing;
    sessionStorage.setItem("tracking-session", memorySession);
  } catch {}
  return memorySession;
}
export function trackEvent(productId: string, event: TrackableEvent, userInfo?: { email?: string; name?: string }): void {
  if (!productId) return;
  const sessionId = session();
  const day = Math.floor(Date.now() / 86400000);
  const key = event + ":" + productId + ":" + (userInfo?.email || "") + ":" + day;
  const deduplicate = event === "view" || event === "click";
  if (deduplicate && pending.has(key)) return;
  // Stable view IDs survive refresh; each cart addition is its own event.
  const eventId = deduplicate ? event + "_" + day + "_" + (userInfo?.email ? "signed" : "guest") : crypto.randomUUID();
  pending.add(key);
  void (async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, event, userInfo, sessionId, eventId }), keepalive: true });
        if (response.ok) {
          return;
        }
        if (response.status < 500) return;
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    } catch { /* Tracking failures must not interrupt shopping. */ }
    finally { pending.delete(key); }
  })();
}
