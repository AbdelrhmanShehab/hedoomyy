export type TrackableEvent = "click" | "view" | "cart" | "share";

/**
 * Sends a tracking event to the server-side API.
 * No Firestore SDK used on the client.
 */
export function trackEvent(
    productId: string,
    event: TrackableEvent,
    userInfo?: { email?: string; name?: string }
): void {
    if (!productId) return;

    // Fire and forget via fetch to our own API
    fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, event, userInfo }),
    }).catch(() => {
        // Silently fail to not affect user experience
    });
}
