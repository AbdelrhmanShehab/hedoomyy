"use client";

import Image from "next/image";
import { Product } from "../data/product";
import { useCart } from "../context/CartContext";
import one from "../public/1.png";
type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addItem, openCart } = useCart();

  return (
    <div className="flex flex-col items-center">
      <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
        <Image
          src={product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl : one}
          alt={product.name}
          fill
          className="object-cover"
        />

      </div>

      <p className="mt-4 text-sm text-gray-700">
        {product.name}
      </p>
      <p className="text-sm text-pink-400 font-medium">
        {product.price} EGP
      </p>

      <button
        onClick={() => {
          addItem({
            id: product.id,
            name: product.name,
            category: product.category,
            status: product.status,
            price: product.price,
            stock: 1,
            imageUrl: product.imageUrl,
          });
          openCart();
        }}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm hover:bg-pink-50 transition"
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
