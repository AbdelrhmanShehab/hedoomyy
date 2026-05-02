"use client";
import { useEffect, useState } from "react";
import { Category } from "./data/category";

// Module-level cache — fetched only once per browser session via API route
let _cachedCategories: Category[] | null = null;
let _fetchPromise: Promise<Category[]> | null = null;

async function fetchCategoriesOnce(): Promise<Category[]> {
  if (_cachedCategories) return _cachedCategories;
  if (_fetchPromise) return _fetchPromise;

  // ✅ Uses /api/products which calls Firestore REST API internally.
  // No Firebase SDK on the client = no channel connections.
  _fetchPromise = fetch("/api/products")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then(data => {
      _cachedCategories = Array.isArray(data.categories) ? data.categories : [];
      return _cachedCategories!;
    })
    .catch(err => {
      _fetchPromise = null; // allow retry
      console.error("Error fetching categories:", err);
      return [];
    });

  return _fetchPromise;
}

export default function useCategories() {
  const [categories, setCategories] = useState<Category[]>(_cachedCategories ?? []);
  const [loading, setLoading] = useState(!_cachedCategories);

  useEffect(() => {
    if (_cachedCategories) {
      setLoading(false);
      return;
    }
    fetchCategoriesOnce()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
