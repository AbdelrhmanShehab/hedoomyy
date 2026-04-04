import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export type TrackableEvent = "click" | "view" | "cart" | "share";

const fieldMap: Record<TrackableEvent, string> = {
    click: "clicks",
    view: "views",
    cart: "cartAdds",
    share: "shareCount",
};

/**
 * userInfo: { email?: string; name?: string }
 */
export function trackEvent(
    productId: string,
    event: TrackableEvent,
    userInfo?: { email?: string; name?: string }
): void {
    if (!productId) return;

    const field = fieldMap[event];
    const statsRef = doc(db, "productStats", productId);

    // 1. Update Aggregate Stats (Atomic increment)
    setDoc(statsRef, { [field]: increment(1) }, { merge: true }).catch(() => { });

    // 1.1 Also update main product document for immediate display
    if (event === "share") {
        const productRef = doc(db, "products", productId);
        updateDoc(productRef, { shareCount: increment(1) }).catch(() => { });
    }

    // 2. Log to Leads collection for user journey / Retargeting
    if (userInfo?.email && (event === "cart" || event === "view")) {
        const leadId = `${userInfo.email}_${productId}`;
        const leadRef = doc(db, "leads", leadId);

        setDoc(leadRef, {
            email: userInfo.email,
            name: userInfo.name || "",
            productId,
            updatedAt: serverTimestamp(),
            status: "pending", // Status will be updated to "converted" on purchase
            lastActivity: event // "view" or "cart"
        }, { merge: true }).catch(() => { });
    }
}
