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
      const snap = await getDocs(collection(db, "categories"));
      setCategories(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
      );
      setLoading(false);
    };

    fetch();
  }, []);

  return { categories, loading };
}
