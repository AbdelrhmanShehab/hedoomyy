import { db } from "@/lib/firestore-server-sdk";
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, event, userInfo } = await req.json();

    if (!productId || !event) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fieldMap: Record<string, string> = {
      click: "clicks",
      view: "views",
      cart: "cartAdds",
      share: "shareCount",
    };

    const field = fieldMap[event];
    if (!field) return Response.json({ error: "Invalid event" }, { status: 400 });

    const statsRef = doc(db, "productStats", productId);

    // 1. Update Aggregate Stats
    await setDoc(statsRef, { [field]: increment(1) }, { merge: true });

    // 2. Update main product document for immediate display
    if (event === "share") {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { shareCount: increment(1) });
    }

    // 3. Log to Leads
    if (userInfo?.email && (event === "cart" || event === "view")) {
      const leadId = `${userInfo.email}_${productId}`;
      const leadRef = doc(db, "leads", leadId);

      await setDoc(leadRef, {
        email: userInfo.email,
        name: userInfo.name || "",
        productId,
        updatedAt: serverTimestamp(),
        status: "pending",
        lastActivity: event
      }, { merge: true });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/track error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
