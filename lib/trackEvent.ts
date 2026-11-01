export type TrackableEvent = "click" | "view" | "cart" | "share";
const pending = new Set<string>();
let memorySession = "";
export function trackingSession() {
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
  const sessionId = trackingSession();
  const day = Math.floor(Date.now() / 86400000);
  const key = event + ":" + productId + ":" + day;
  const deduplicate = event === "view" || event === "click";
  if (deduplicate && pending.has(key)) return;
  // Stable view IDs survive refresh; each cart addition is its own event.
  const eventId = deduplicate ? event + "_" + day : crypto.randomUUID();
  pending.add(key);
  void (async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
        const response = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, event, userInfo, sessionId, eventId }), keepalive: true });
        if (response.ok) {
          return;
        }
        if (response.status < 500) return;
        } catch { /* Retry transport failures with the same event ID. */ }
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    } catch { /* Tracking failures must not interrupt shopping. */ }
    finally { pending.delete(key); }
  })();
}

let cartRevision = 0;
export function syncCartState(productId: string, quantity: number, userInfo?: { email?: string; name?: string }) {
  const revision = cartRevision = Math.max(Date.now(), cartRevision + 1);
  const body = JSON.stringify({ event: "cart_state", productId, quantity, userInfo, sessionId: trackingSession(), revision });
  void (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
        if (response.ok || response.status < 500) return;
      } catch { /* Retry using the same revision so old requests cannot revive an empty cart. */ }
      await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
    }
  })();
}
