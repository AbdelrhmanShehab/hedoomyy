"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Review } from "@/data/review";
import HeartRating from "./HeartRating";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
};

export default function ReviewSection({ productId, averageRating = 0, reviewCount = 0 }: Props) {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      const sortedData = data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setReviews(sortedData);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !comment.trim()) return;

    setSubmitting(true);
    try {
      const newReview = {
        productId,
        userId: user.uid,
        userName: userData?.firstName ? `${userData.firstName} ${userData.lastName || ""}` : (user.displayName || "User"),
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "reviews"), newReview);

      const productRef = doc(db, "products", productId);
      
      const currentCount = reviewCount || 0;
      const currentAvg = averageRating || 0;
      const newCount = currentCount + 1;
      const newAvg = (currentAvg * currentCount + rating) / newCount;

      await updateDoc(productRef, {
        averageRating: newAvg,
        reviewCount: increment(1)
      });

      setRating(0);
      setComment("");
      alert("Review submitted! Thank you ❤️");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-gray-100 pt-16">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Left Side: Summary & Form */}
        <div className="md:w-1/3 space-y-8">
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">{t("reviews_title")}</h2>
            <div className="flex items-center gap-3">
              <HeartRating rating={averageRating} />
              <span className="text-sm text-gray-500 font-medium">
                {averageRating.toFixed(1)} out of 5 ({reviewCount} reviews)
              </span>
            </div>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="font-medium text-gray-900">{t("reviews_write")}</p>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Tap a heart to rate:</p>
                <HeartRating 
                  rating={rating} 
                  interactive 
                  onRatingChange={setRating} 
                  size={24}
                />
              </div>

              <div>
                <textarea
                  placeholder={t("reviews_your_review")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE9DE5]/20 min-h-[120px] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0 || !comment.trim()}
                className="w-full bg-[#DE9DE5] text-white py-3 rounded-full font-medium hover:bg-[#cf8ed5] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Submitting..." : t("reviews_submit")}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-600 mb-4">{t("reviews_login_to_review")}</p>
              <button
                onClick={() => {
                  const currentPath = window.location.pathname;
                  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&message=Please login to your account to add a review.`;
                }}
                className="inline-block text-[#DE9DE5] font-bold text-sm underline decoration-[#DE9DE5]/40 underline-offset-4 hover:decoration-[#DE9DE5] cursor-pointer"
              >
                Log in to Review →
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Review List */}
        <div className="md:w-2/3">
          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">{review.userName}</p>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <HeartRating rating={review.rating} size={14} />
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                <p>{t("reviews_no_reviews")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
