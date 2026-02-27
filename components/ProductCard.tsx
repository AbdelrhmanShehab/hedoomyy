"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../data/product";
import { useState } from "react";
import QuickAddModal from "./product/QuickAddModal";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const [open, setOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const isFavorited = isFavorite(product.id);

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  const totalStock =
    variants.length > 0
      ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : 0;

  const hasStock =
    product.status === "active" && totalStock > 0;

  const imageSrc =
    product.images?.[0] ?? "/1.png";

  return (
    <>
      <div className="group flex flex-col items-center transition hover:-translate-y-1 relative">

        {/* BEST SELLER BADGE */}
        {product.isBestSeller && (
          <div className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full z-10">
            BEST SELLER
          </div>
        )}

        {/* FAVORITES TOGGLE */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full z-10 transition hover:bg-white shadow-sm"
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorited ? "text-pink-400 fill-pink-400" : "text-gray-400"}`}
          />
        </button>

        <Link
          href={`/product/${product.id}`}
          className="w-full flex flex-col items-center"
        >
          <div className="w-[270px] h-[390px] relative rounded-2xl overflow-hidden">
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              sizes="(max-width:768px) 100vw, 260px"
              className="object-cover transition group-hover:scale-105"
            />

            {!hasStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                Out of Stock
              </div>
            )}
          </div>
          <div className="" >
            <p className="mt-4 text-sm text-center">
              {product.title}
            </p>

            <p className="text-sm text-pink-400">
              {product.price} EGP
            </p>
          </div>
        </Link>

        <button
          disabled={!hasStock}
          onClick={() => setOpen(true)}
          className={`mt-3 px-6 py-2 rounded-full text-sm
            ${hasStock
              ? "border border-black hover:bg-black hover:text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Add to Cart
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
