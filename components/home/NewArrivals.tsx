"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/product";
import { useState } from "react";
import QuickAddModal from "../product/QuickAddModal";
import { ShoppingCart } from "lucide-react";

interface Props {
  products: Product[];
}

export default function NewArrivals({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) return null;

  const [bigProduct, ...smallProducts] = products;

  const getStock = (product: Product) => {
    return (
      product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0
    );
  };

  const renderProduct = (product: Product) => {
    const totalStock = getStock(product);
    const isSold = totalStock === 0 || product.status !== "active";
    const hasDiscount =
      product.originalPrice &&
      product.originalPrice > product.price;

    return (
      <div className="flex flex-col gap-2">
        {/* IMAGE CARD */}
        <div className="relative group overflow-hidden rounded-xl bg-zinc-100 aspect-[4/5]">
          <Link
            href={`/product/${product.id}`}
            className="block w-full h-full"
          >
            <Image
              src={product.images?.[0] ?? "/1.png"}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* OUT OF STOCK OVERLAY */}
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                Out of Stock
              </div>
            )}

            {/* MOBILE QUICK ADD */}
            {!isSold && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
                className="absolute bottom-3 right-3 md:hidden bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5 active:scale-95 transition-transform"
              >
                <ShoppingCart className="w-4 h-4 text-black" />
              </button>
            )}

            {/* DISCOUNT BADGE */}
            {hasDiscount && !isSold && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                -{Math.round(
                  ((product.originalPrice! - product.price) /
                    product.originalPrice!) *
                  100
                )}
                %
              </div>
            )}
          </Link>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col gap-0.5 px-0.5">
          <h3 className="text-sm text-zinc-600 truncate font-normal leading-tight">
            {product.title}
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-zinc-900">
              {product.price} EGP
            </span>

            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {product.originalPrice} EGP
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full px-5 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-medium">
          Explore New Arrivals
        </h2>
        <Link
          href="/products?sort=new"
          className="text-sm font-medium text-zinc-600 hover:text-black transition-colors underline underline-offset-4"
        >
          See More
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {/* BIG PRODUCT */}
        <div className="col-span-2 row-span-2">
          {renderProduct(bigProduct)}
        </div>

        {/* SMALL PRODUCTS */}
        {smallProducts.slice(0, 4).map((product) => (
          <div key={product.id}>
            {renderProduct(product)}
          </div>
        ))}
      </div>

      {/* QUICK ADD MODAL */}
      {selectedProduct && (
        <QuickAddModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}