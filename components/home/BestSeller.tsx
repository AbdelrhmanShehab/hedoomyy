"use client";

import { useEffect, useState } from "react";
import ProductsGrid from "../../components/ProductGrid";
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
        where("status", "==", "best"),
        limit(8)
      );

      const snap = await getDocs(q);

      const data: Product[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      setProducts(data);
      setLoading(false);
    };

    fetchBestSellers();
  }, []);

  return (
    <section className="w-full px-5 py-16">
      <h2 className="mb-6 text-2xl font-medium">Explore Best Seller</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ProductsGrid products={products} />
      )}
    </section>
  );
}
