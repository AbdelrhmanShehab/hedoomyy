"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { Category } from "./data/category";
export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        console.log("Fetching categories...");

        const snap = await getDocs(collection(db, "categories"));

        if (!snap || snap.empty) {
          setCategories([]);
          return;
        }

        setCategories(
          snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[]
        );
      } catch (error) {
        console.error("Error fetching categories:", error);

        // 🔥 retry once after delay
        setTimeout(fetch, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { categories, loading };
}
