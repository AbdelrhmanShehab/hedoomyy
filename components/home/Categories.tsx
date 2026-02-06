"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CategoryCard from "./CategoryCard";
import { Category } from "../../data/category";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));

      setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className="pb-20">
      <h2 className="mb-8 text-xl font-medium text-zinc-900">
        Explore Categories
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            title={`Shop ${cat.name}`}
            image={cat.image || "/placeholder.jpg"}
            href={`/products?category=${cat.slug}`}
          />
        ))}
      </div>
    </section>
  );
}
