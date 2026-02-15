"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/data/product";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const q = query(
        collection(db, "products"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const snap = await getDocs(q);

      const mapped: Product[] = snap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title,
          description: data.description ?? "",
          category: data.category,
          price: data.price,
          status: data.status,
          isBestSeller: data.isBestSeller ?? false,
          images: data.images ?? [],
          variants: data.variants ?? [],
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        };
      });

      setProducts(mapped);
      setLoading(false);
    };

    fetchNewArrivals();
  }, []);

  if (loading || products.length === 0) return null;

  const [bigProduct, ...smallProducts] = products;

  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-8 text-2xl font-medium">
        Explore New Arrivals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* BIG PRODUCT */}
        <div className="md:col-span-2 relative group">
          <Image
            src={bigProduct.images?.[0] ?? "/1.png"}
            alt={bigProduct.title}
            width={800}
            height={1000}
            className="w-full h-full object-cover rounded-lg"
          />

          {bigProduct.variants?.every(v => v.stock === 0) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
              Sold Out
            </div>
          )}
        </div>

        {/* SMALL PRODUCTS */}
        <div className="grid grid-cols-2 gap-6">
          {smallProducts.map(product => {
            const totalStock =
              product.variants?.reduce(
                (sum, v) => sum + (v.stock || 0),
                0
              ) ?? 0;

            const isSold = totalStock === 0;

            return (
              <div key={product.id} className="relative group">
                <Image
                  src={product.images?.[0] ?? "/1.png"}
                  alt={product.title}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />

                {isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    Sold Out
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
