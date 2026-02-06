"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "../data/product";
import { useCart } from "../context/CartContext";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addItem, openCart } = useCart();

  const imageSrc =
    typeof product.imageUrl === "string" && product.imageUrl.length > 0
      ? product.imageUrl
      : "/1.png";

  return (
    <div className="group flex flex-col items-center transition-transform duration-300 hover:-translate-y-1">
      {/* 🔗 NAVIGATION */}
      <Link
        href={`/product/${product.id}`}
        className="w-full flex flex-col items-center"
      >
        {/* IMAGE */}
        <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* INFO */}
        <p className="mt-4 text-sm text-gray-700 group-hover:text-black transition">
          {product.name}
        </p>
        <p className="text-sm text-pink-400 font-medium">
          {product.price} EGP
        </p>
      </Link>

      {/* ADD TO CART */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 🔥 prevent navigation
          addItem({
            id: product.id,
            title: product.name,
            price: product.price,
            qty: 1,
            image: imageSrc,
            variant: product.category,
          });
          openCart();
        }}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm transition hover:bg-pink-50"
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
