"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Product } from "../../data/product";
import ProductGrid from "../../components/ProductGrid";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));

      const mapped = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.title,
          imageUrl: data.image ?? null,
          price: data.price,
          category: data.category,
          isBestSeller: data.isBestSeller ?? false,
          createdAt: data.createdAt ?? null,
          status: data.status,
          stock: data.stock,
        } satisfies Product;
      });

      setProducts(mapped);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-20">Loading…</p>;

  return (
    <section className="px-6 py-12">
      <h1 className="text-2xl font-semibold mb-8">Products</h1>
      <ProductGrid products={products} />
    </section>
  );
}
