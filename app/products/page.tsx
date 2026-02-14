"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Product } from "../../data/product";
import ProductGrid from "../../components/ProductGrid";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
/* ---------------- TYPES ---------------- */

type SortType = "" | "new" | "best" | "price-high" | "price-low";

type Category = {
  id: string;
  name: string;
  slug: string;
};

/* ---------------- PAGE ---------------- */

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortType>("");
  const [filterCategory, setFilterCategory] = useState<string | null>(
    urlCategory
  );

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      // Products
      const productsSnap = await getDocs(collection(db, "products"));
      const mappedProducts: Product[] = productsSnap.docs.map(doc => {
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
          variants: data.variants ?? [], // ✅ FIXED
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        };
      });



      // Categories
      const categoriesSnap = await getDocs(collection(db, "categories"));
      const mappedCategories: Category[] = categoriesSnap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));

      setProducts(mappedProducts);
      setCategories(mappedCategories);
      setLoading(false);
    };

    fetchData();
  }, []);

  /* ---------------- SYNC URL ---------------- */

  useEffect(() => {
    if (filterCategory) {
      router.push(`/products?category=${filterCategory}`);
    } else {
      router.push("/products");
    }
  }, [filterCategory, router]);

  /* ---------------- FILTER + SORT ---------------- */

  const visibleProducts = useMemo(() => {
    let result = [...products];

    if (filterCategory) {
      result = result.filter(
        p => p.category === filterCategory
      );
    }

    switch (sort) {
      case "new":
        result.sort(
          (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
        );
        break;

      case "best":
        result = result.filter(p => p.isBestSeller);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
    }

    return result;
  }, [products, filterCategory, sort]);

  /* ---------------- TITLE ---------------- */

  const title = filterCategory
    ? filterCategory.replace(/-/g, " ")
    : "All Items";

  /* ---------------- UI ---------------- */

  if (loading) {
    return <p className="text-center mt-20">Loading…</p>;
  }

  return (
    <>
      <Header />
      <section className="px-6 py-12 max-w-7xl mx-auto">
        {/* TITLE */}
        <h1 className="text-center text-3xl tracking-[0.35em] font-light uppercase mb-10">
          {title}
        </h1>

        {/* FILTER BAR */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {/* CATEGORY FILTER */}
          <select
            value={filterCategory ?? ""}
            onChange={e =>
              setFilterCategory(
                e.target.value || null
              )
            }
            className="border px-4 py-2 rounded-full text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* SORT */}
          <select
            value={sort}
            onChange={e =>
              setSort(e.target.value as SortType)
            }
            className="border px-4 py-2 rounded-full text-sm"
          >
            <option value="">Sort By</option>
            <option value="new">New Arrivals</option>
            <option value="best">Best Selling</option>
            <option value="price-high">
              Price: High → Low
            </option>
            <option value="price-low">
              Price: Low → High
            </option>
          </select>
        </div>

        {/* PRODUCTS */}
        {visibleProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}
      </section>
      <Footer />
    </>
  );
}
