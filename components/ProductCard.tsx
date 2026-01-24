"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
// import { Product } from "../data";
import { Product } from "../data/product";
type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="flex flex-col items-center cursor-pointer"
    >
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
      <p className="mt-4 text-sm text-gray-700">{product.title}</p>
      <p className="text-sm text-pink-400 font-medium">
        {product.price} EGP
      </p>

      {/* Quick Add */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent navigation
          addItem(product);
          openCart();
        }}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm hover:bg-pink-50 transition"
      >
        🛒 Quick Add
      </button>
    </div>
  );
}
