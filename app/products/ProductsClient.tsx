"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
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

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions: { value: SortType; label: string }[] = useMemo(() => [
    { value: "", label: "Sort By" },
    { value: "new", label: "New Arrivals" },
    { value: "best", label: "Best Selling" },
    { value: "price-high", label: "Price: High → Low" },
    { value: "price-low", label: "Price: Low → High" },
  ], []);

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
      <div className="flex  md:flex-row md:items-center md:justify-center gap-6 mb-12">

        {/* CATEGORY DROPDOWN */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsSortOpen(false);
            }}
            className="flex items-center justify-between gap-3 border border-gray-200 bg-white px-5 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <span className="capitalize">
              {filterCategory
                ? categories.find(c => c.slug === filterCategory)?.name || filterCategory.replace(/-/g, " ")
                : "All Categories"}
            </span>
            <span className={`text-gray-400 text-[10px] transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setFilterCategory(null);
                  setIsCategoryOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${!filterCategory ? "bg-gray-50 font-medium text-black" : "text-gray-600"}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCategory(cat.slug);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-gray-50 capitalize ${filterCategory === cat.slug ? "bg-gray-50 font-medium text-black" : "text-gray-600"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SORT DROPDOWN */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
            }}
            className="flex items-center justify-between gap-3 border border-gray-200 bg-white px-5 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <span>{sortOptions.find(o => o.value === sort)?.label || "Sort By"}</span>
            <span className={`text-gray-400 text-[10px] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSort(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${sort === option.value ? "bg-gray-50 font-medium text-black" : "text-gray-600"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

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
