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

  if (products.length === 0) return null;

  const [bigProduct, ...smallProducts] = products;

  const getStock = (product: Product) => {
    return product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
  };

  const renderProduct = (product: Product, isBig: boolean = false) => {
    const totalStock = getStock(product);
    const isSold = totalStock === 0 || product.status !== "active";

    return (
      <div key={product.id} className={`relative group overflow-hidden rounded-lg ${isBig ? "h-[400px] md:h-[650px]" : "h-full"}`}>
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] ?? "/1.png"}
            alt={product.title}
            fill
            priority={isBig}
            sizes={isBig ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* HOVER OVERLAY */}
          {!isSold && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
              <p className="text-2xl font-semibold mb-4">{product.price} EGP</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                Quick Add
              </button>
            </div>
          )}

          {/* SOLD OVERLAY */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                <span className="text-xl font-light tracking-widest uppercase text-center">
                  Sold
                </span>
              </div>
            </div>
          )}
        </Link>
      </div>
    );
  };

  return (
    <section className="w-full px-5 py-10">
      <h2 className="mb-6 text-2xl font-medium">
        Explore New Arrivals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BIG PRODUCT */}
        {renderProduct(bigProduct, true)}

        {/* SMALL PRODUCTS */}
        <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[650px]">
          {smallProducts.map(product => renderProduct(product))}
        </div>
      </div>

      {selectedProduct && (
        <QuickAddModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
