import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";

export type TrackableEvent = "click" | "view" | "cart";

const fieldMap: Record<TrackableEvent, string> = {
    click: "clicks",
    view: "views",
    cart: "cartAdds",
};

/**
 * Fire-and-forget client-side event tracker.
 * Writes to Firestore `productStats/{productId}` atomically.
 * Never throws — errors are swallowed so the UI is never blocked.
 */
export function trackEvent(productId: string, event: TrackableEvent): void {
    if (!productId) return;

    const field = fieldMap[event];
    const ref = doc(db, "productStats", productId);

    // Use setDoc with merge so the document is auto-created on first event
    setDoc(ref, { [field]: increment(1) }, { merge: true }).catch(() => {
        // Silently ignore — analytics must never break the app
    });
}
