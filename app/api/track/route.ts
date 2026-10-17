import { incrementField } from "@/lib/firestore-server";
import { recordStoreTracking, TrackingError } from "@/lib/tracking-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });
    // Keep the existing developer-stat event separate from product analytics.
    if (body.event === "stat") {
      if (typeof body.productId !== "string" || !body.productId || body.productId.length > 150 || body.productId.includes("/")) return Response.json({ error: "Invalid ID" }, { status: 400 });
      await incrementField("stats", body.productId, "count", 1);
      return Response.json({ success: true });
    }
    const result = await recordStoreTracking(body);
    return Response.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid JSON" }, { status: 400 });
    if (error instanceof TrackingError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Tracking request failed");
    return Response.json({ error: "Could not save tracking event" }, { status: 500 });
  }
}
