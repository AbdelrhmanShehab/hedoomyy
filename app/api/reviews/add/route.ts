import { db } from "@/lib/firestore-server-sdk";
import { addDoc, collection, doc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, userId, userName, rating, comment } = await req.json();

    if (!productId || !userId || !rating || !comment) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReview = {
      productId,
      userId,
      userName: userName || "User",
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
    };

    // 1. Add the review
    await addDoc(collection(db, "reviews"), newReview);

    // 2. Update product aggregate rating
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const data = productSnap.data();
      const currentCount = data.reviewCount || 0;
      const currentAvg = data.averageRating || 0;
      const newCount = currentCount + 1;
      const newAvg = (currentAvg * currentCount + rating) / newCount;

      await updateDoc(productRef, {
        averageRating: newAvg,
        reviewCount: increment(1),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("API /api/reviews/add error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
