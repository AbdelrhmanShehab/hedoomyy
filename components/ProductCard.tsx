"use client";

import Image from "next/image";

export type Product = {
  id: string | number;
  title: string;
  price: string;
  image: string;
};

type Props = {
  product: Product;
  onQuickAdd?: (product: Product) => void;
};

export default function ProductCard({ product, onQuickAdd }: Props) {
  return (
    <div className="flex flex-col items-center">
      {/* Image */}
      <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <p className="mt-4 text-sm text-gray-700">
        {product.title}
      </p>
      <p className="text-sm text-pink-400 font-medium">
        {product.price}
      </p>

      {/* Button */}
      <button
        onClick={() => onQuickAdd?.(product)}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm flex items-center gap-2 hover:bg-pink-50 transition"
      >
        🛒 Quick Add
      </button>
    </div>
  );
}
