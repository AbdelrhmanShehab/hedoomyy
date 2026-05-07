import { incrementField, upsertDocument } from "@/lib/firestore-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, event, userInfo } = await req.json();

    if (!productId || !event) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle generic stats (e.g. developer clicks)
    if (event === "stat") {
      await incrementField("stats", productId, "count", 1);
      return Response.json({ success: true });
    }

    const fieldMap: Record<string, string> = {
      click: "clicks",
      view: "views",
      cart: "cartAdds",
      share: "shareCount",
    };

    const field = fieldMap[event];
    if (!field) return Response.json({ error: "Invalid event" }, { status: 400 });

    // 1. Update Aggregate Stats
    await incrementField("productStats", productId, field, 1);

    // 2. Update main product document for immediate display
    if (event === "share") {
      await incrementField("products", productId, "shareCount", 1);
    }

    // 3. Log to Leads
    if (userInfo?.email && (event === "cart" || event === "view")) {
      const leadId = `${userInfo.email}_${productId}`;
      
      await upsertDocument("leads", leadId, {
        email: userInfo.email,
        name: userInfo.name || "",
        productId,
        updatedAt: new Date(),
        status: "pending",
        lastActivity: event
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/track error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
