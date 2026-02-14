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
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "/1.png";

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.status !== "active") return;
    if (!product.variants?.length) return;

    const firstVariant = product.variants[0];
    if (firstVariant.stock <= 0) return;

    addItem({
      productId: product.id,
      variantId: firstVariant.id,
      title: product.title,
      price: product.price,
      image: imageSrc,
      color: firstVariant.color,
      size: firstVariant.size,
      qty: 1,
    });

    openCart();
  };
  console.log(product);

  return (
    <div className="group flex flex-col items-center transition-transform duration-300 hover:-translate-y-1">
      <Link
        href={`/product/${product.id}`}
        className="w-full flex flex-col items-center"
      >
        <div className="w-[260px] h-[380px] relative rounded-2xl overflow-hidden">
          <Image
            src={imageSrc}
            alt={
              product.title
                ? `${product.title} product image`
                : "Product image"
            }
            fill
            sizes="(max-width: 768px) 100vw, 260px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {product.status === "inactive" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-medium">
              Sold Out
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-700 text-center">
          {product.title}
        </p>

        <p className="text-sm text-pink-400 font-medium">
          {product.price} EGP
        </p>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={product.status !== "active"}
        className="mt-3 px-6 py-2 rounded-full border border-pink-300 text-pink-400 text-sm transition hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🛒 Add to Cart
      </button>
    </div>
  );
}
