"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../data/product";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QuickAddModal from "./product/QuickAddModal";
import { Heart } from "lucide-react";
import HeartRating from "./product/HeartRating";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  // 🛡️ Data Guard: Prevent crash on invalid objects
  if (!product || typeof product !== "object" || !product.id) return null;

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isFavorited = isFavorite(product.id);

  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const totalStock =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + (v?.stock || 0), 0)
      : 0;

  const hasStock =
    product?.status === "active" && totalStock > 0;

  const imageSrc =
    product?.images?.[0] ?? "/1.png";

  const safeTitle = typeof product?.title === "string" ? product.title : "Untitled Product";
  const safePrice = typeof product?.price === "number" ? product.price : 0;
  const safeOldPrice = typeof product?.originalPrice === "number" ? product.originalPrice : null;

  return (
    <>
      <div className="group/card flex flex-col items-center transition hover:-translate-y-1 relative">

        {/* BADGES           <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2 z-10">
          {product?.isBestSeller && (
            <div className="bg-black text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full w-max font-medium">
              {t("card_best_seller")}
            </div>
          )}
          {safeOldPrice && safeOldPrice > safePrice && (
            <div className="bg-red-500 text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full w-max font-medium">
              {t("card_sale")}
            </div>
          )}
        </div>

        {/* FAVORITES TOGGLE */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!user) {
              const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
              router.push(`/login-required?redirect=${encodeURIComponent(currentPath)}`);
              return;
            }
            toggleFavorite(product.id);
          }}
          suppressHydrationWarning
          className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-full z-10 transition hover:bg-white shadow-sm cursor-pointer"
          aria-label={isFavorited ? t("card_remove_from_favorites") : t("card_add_to_favorites")}
        >
          <Heart
            className={`w-4 h-4 md:w-5 h-5 transition-colors ${isFavorited ? "text-pink-400 fill-pink-400" : "text-gray-400"}`}
          />
        </button>

        <Link
          href={`/product/${product.id}`}
          className="w-full flex flex-col items-center cursor-pointer"
          onClick={() => trackEvent(product.id, "click", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined)}
        >
          <div className="w-full aspect-[3/4.2] relative rounded-2xl overflow-hidden ">
            <Image
              src={imageSrc}
              alt={safeTitle}
              fill
              sizes="(max-width:768px) 50vw, 300px"
              className="object-cover transition group-hover/card:scale-105"
            />

            {!hasStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs md:text-base">
                {t("product_out_of_stock")}
              </div>
            )}
          </div>
          <div className="w-full" >
            <p className="mt-4 text-xs md:text-sm font-medium text-center truncate px-2">
              {safeTitle}
            </p>

            <div className="flex flex-col items-center justify-center gap-0.5 md:gap-1 mt-1">
              {(safeOldPrice && safeOldPrice > safePrice) ? (
                <>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase">{t("card_old")}</span>
                    <p className="text-[10px] md:text-xs text-gray-400 line-through font-medium">
                      {safeOldPrice} EGP
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase">{t("card_new")}</span>
                    <p className="text-[12px] md:text-sm font-bold text-red-500">
                      {safePrice} EGP
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[12px] md:text-sm font-bold text-pink-400">
                  {safePrice} EGP
                </p>
              )}
            </div>

            {(product?.reviewCount && product.reviewCount > 0) ? (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <HeartRating rating={product.averageRating || 0} size={10} />
                <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount})</span>
              </div>
            ) : null}
          </div>
        </Link>

        <button
          disabled={!hasStock}
          onClick={() => setOpen(true)}
          suppressHydrationWarning
          className={`mt-3 cursor-pointer px-4 md:px-6 py-2.5 md:py-4 rounded-full text-[12px] md:text-sm
            ${hasStock
              ? "border text-[#DE9DE5] font-medium border-[#DE9DE5] border-2 hover:bg-[#DE9DE5] hover:text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {t("product_quick_add")}
        </button>
      </div>

      {open && (
        <QuickAddModal
          product={product}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
