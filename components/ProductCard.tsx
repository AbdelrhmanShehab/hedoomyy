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

  const imageSrc =
    typeof product.imageUrl === "string" && product.imageUrl.length > 0
      ? product.imageUrl
      : one;

  return (
    <div className="flex flex-col items-center">
      <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
        <Image
          src={imageSrc}
          alt="product image"
          fill
          className="object-cover"
        />
      </div>

      <p className="mt-4 text-sm text-gray-700">{product.name}</p>
      <p className="text-sm text-pink-400 font-medium">{product.price} EGP</p>

      <button
        onClick={() => {
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            quantity: 1,
          });
          openCart();
        }}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm"
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
