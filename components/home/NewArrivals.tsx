"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/product";
import { useState } from "react";
import QuickAddModal from "../product/QuickAddModal";
import { ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  products: Product[];
}

export default function NewArrivals({ products }: Props) {
  // 🛡️ Data Guard: Prevent crash if products is not an array
  if (!Array.isArray(products) || products.length === 0) return null;

  const [bigProduct, ...smallProducts] = products;
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Additional check if bigProduct is valid
  if (!bigProduct || typeof bigProduct !== "object") return null;

  const getStock = (product: Product) => {
    return (
      product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0
    );
  };

  const renderProduct = (product: Product, isBig?: boolean) => {
    // 🛡️ Data Guard: Prevent crash if product is invalid
    if (!product || typeof product !== "object" || !product.id) return null;

    const totalStock = getStock(product);
    const isSold = totalStock === 0 || product.status !== "active";

    const hasDiscount =
      (product.originalPrice &&
      product.originalPrice > product.price) || false;

    const safeTitle = typeof product.title === "string" ? product.title : "Untitled";
    const safePrice = typeof product.price === "number" ? product.price : 0;
    const imageSrc = product.images?.[0] ?? "/1.png";

    return (
      <div className={`flex flex-col gap-2 ${isBig ? "h-full" : ""}`}>

        {/* IMAGE CARD */}
        <div
          className={`relative group overflow-hidden rounded-xl bg-zinc-100 
          ${isBig
              ? "aspect-[4/5] md:flex-1 md:min-h-0 md:aspect-auto"
              : "aspect-[5/5]"}`}
        >
          <Link
            href={`/product/${product.id}`}
            className="block w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={safeTitle}
              fill
              sizes={
                isBig
                  ? "(max-width: 768px) 100vw, 50vw"
                  : "(max-width: 768px) 50vw, 25vw"
              }
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* QUICK ADD (DESKTOP) */}
            {!isSold && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="bg-white text-black px-6 py-2.5 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-zinc-100"
                >
                  {t("product_quick_add")}
                </button>
              </div>
            )}

            {/* OUT OF STOCK */}
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                {t("product_out_of_stock")}
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
                -
                {Math.round(
                  (((product.originalPrice || 0) - (product.price || 0)) /
                    (product.originalPrice || 1)) *
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
            {safeTitle}
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-zinc-900">
              {safePrice} EGP
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

      {/* HEADER */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-medium">
          {t("new_arrivals_title")}
        </h2>

        <Link
          href="/products?sort=new"
          className="text-sm font-medium text-zinc-600 hover:text-black transition-colors underline underline-offset-4"
        >
          {t("new_arrivals_see_more")}
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

        {/* BIG PRODUCT */}
        <div className="col-span-2 md:row-span-2">
          {renderProduct(bigProduct, true)}
        </div>

        {/* SMALL PRODUCTS */}
        {smallProducts.slice(0, 4).map((product) => (
          <div key={product?.id || Math.random().toString()}>
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