"use client";

import { useEffect, useState } from "react";
import ProductGrid from "../../components/ProductGrid";
import { Product } from "../../data/product";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      const q = query(
        collection(db, "products"),
        where("isBestSeller", "==", true),
        where("status", "==", "active"),
        limit(8)
      );

      const snap = await getDocs(q);

      const mapped: Product[] = snap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title ?? "",
          description: data.description ?? "",
          category: data.category ?? "",
          price: Number(data.price ?? 0),
          status: data.status ?? "inactive",
          isBestSeller: data.isBestSeller ?? false,
          images: Array.isArray(data.images) ? data.images : [],
          variants: Array.isArray(data.variants) ? data.variants : [],
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        };
      });

      setProducts(mapped);
      setLoading(false);
    };

    fetchBestSellers();
  }, []);

  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-6 text-2xl font-medium">
        Explore Best Seller
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
