import { addReview } from "@/lib/firestore-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userId, rating, comment } = body;

    if (!productId || !userId || !rating || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use the REST API helper to add review and update product rating aggregate
    await addReview({
      ...body,
      userName: body.userName || "User",
      comment: comment.trim(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/reviews/add error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
