"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/data/product";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data));
  }, []);

  const newArrivals = [...products]
    .sort((a, b) => {
      const aDate = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const bDate = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return bDate - aDate;
    })
    .slice(0, 5);

  if (newArrivals.length === 0) return null;

  const [bigProduct, ...smallProducts] = newArrivals;

  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-8 text-2xl font-medium">
        Explore New Arrivals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BIG PRODUCT */}
        <div className="md:col-span-2 relative group cursor-pointer">
          {bigProduct.images[0] && (
            <Image
              src={bigProduct.images[0]}
              alt={bigProduct.title}
              width={800}
              height={1000}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>

        {/* SMALL GRID */}
        <div className="grid grid-cols-2 gap-6">
          {smallProducts.map((product) => (
            <div
              key={product.id}
              className="relative group cursor-pointer"
            >
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.title ? `${product.title} image` : "Product image"}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}

              {/* Price Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition">
                  {product.price} EGP
                </span>
              </div>

              {/* Sold Badge */}
              {product.status === "inactive" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-semibold rounded-lg">
                  Sold
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
