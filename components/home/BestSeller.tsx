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

      const mapped = snap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.title,
          imageUrl: data.image ?? null,
          price: data.price,
          category: data.category,
          isBestSeller: data.isBestSeller ?? false,
          createdAt: data.createdAt?.toDate?.() ?? null,
          status: data.status,
          stock: data.stock,
        } satisfies Product;
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
