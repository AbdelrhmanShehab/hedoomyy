"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
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

/* ---------------- COMPONENT ---------------- */

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") || null;
  const urlSort = (searchParams.get("sort") || "") as SortType;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortType>(urlSort);
  const [filterCategory, setFilterCategory] = useState<string | null>(
    urlCategory
  );

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      // Products
      const productsSnap = await getDocs(
        query(
          collection(db, "products"),
          where("status", "==", "active")
        )
      );
      const mappedProducts: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title ?? "",
          description: data.description ?? "",
          category: data.category ?? "",
          price: Number(data.price ?? 0),
          status: data.status ?? "inactive",
          isBestSeller: data.isBestSeller ?? false,
          originalPrice: data.originalPrice,
          offerId: data.offerId,
          images: Array.isArray(data.images) ? data.images : [],
          variants: Array.isArray(data.variants) ? data.variants : [],
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
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : "/products");
  }, [filterCategory, sort, router]);

  /* ---------------- SYNC STATE FROM URL ---------------- */

  useEffect(() => {
    setFilterCategory(urlCategory);
    setSort(urlSort);
  }, [urlCategory, urlSort]);

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
          aria-label="Filter by category"
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
          aria-label="Sort products"
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
  );
}

export default function ProductsClient() {
  return (
    <>
      <Header />
      <Suspense fallback={<p className="text-center mt-20">Loading…</p>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </>
  );
}
