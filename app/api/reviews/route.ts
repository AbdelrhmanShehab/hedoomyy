/**
 * GET /api/reviews?productId=xxx
 * Returns reviews for a product using the Firestore REST API.
 * No Firebase client SDK = no channel/WebSocket connections.
 */
import { fetchReviewsByProduct } from "@/lib/firestore-server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return Response.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    const reviews = await fetchReviewsByProduct(productId);
    // Sort newest first
    reviews.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return Response.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return Response.json([], { status: 500 });
  }
}
