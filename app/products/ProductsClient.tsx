"use client";

import { Suspense, useEffect, useMemo, useState, useRef, memo, useCallback } from "react";
import { Product } from "../../data/product";
import ProductGrid from "../../components/ProductGrid";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ---------------- TYPES ---------------- */

type SortType = "" | "new" | "best" | "price-high" | "price-low";

type Category = {
  id: string;
  name: string;
  slug: string;
};

/* ---------------- MODULE-LEVEL CACHE (fetch once per session, NO Firebase SDK) ---------------- */

let _cachedProducts: Product[] | null = null;
let _cachedCategories: Category[] | null = null;
let _fetchPromise: Promise<{ products: Product[]; categories: Category[] }> | null = null;

async function fetchProductsOnce() {
  if (_cachedProducts && _cachedCategories) {
    return { products: _cachedProducts, categories: _cachedCategories };
  }
  if (_fetchPromise) return _fetchPromise;

  // ✅ Calls our own Next.js API route — uses Firestore REST API internally.
  // No Firebase SDK on the client = no channel/WebSocket connections.
  _fetchPromise = fetch("/api/products")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then(data => {
      _cachedProducts = Array.isArray(data.products) ? data.products : [];
      _cachedCategories = Array.isArray(data.categories) ? data.categories : [];
      return { products: _cachedProducts!, categories: _cachedCategories! };
    })
    .catch(err => {
      _fetchPromise = null; // allow retry on next mount
      console.error("Products fetch error:", err);
      return { products: [], categories: [] };
    });

  return _fetchPromise;
}

/* ---------------- PAGINATION CONSTANTS ---------------- */

const PAGE_SIZE = 8;

/* ---------------- PAGINATOR COMPONENT ---------------- */

const Paginator = memo(function Paginator({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        suppressHydrationWarning
        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          suppressHydrationWarning
          className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            p === page
              ? "bg-zinc-800 text-white border-zinc-800"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        suppressHydrationWarning
        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
});

/* ---------------- MAIN CONTENT ---------------- */

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const urlCategory = searchParams.get("category") || null;
  const urlSort = (searchParams.get("sort") || "") as SortType;
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  /* ---------- State ---------- */
  const [products, setProducts] = useState<Product[]>(_cachedProducts ?? []);
  const [categories, setCategories] = useState<Category[]>(_cachedCategories ?? []);
  const [loading, setLoading] = useState(!_cachedProducts);

  const [sort, setSort] = useState<SortType>(urlSort);
  const [filterCategory, setFilterCategory] = useState<string | null>(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [page, setPage] = useState(urlPage);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  /* ---------- One-time fetch (via API route, no Firebase SDK) ---------- */
  useEffect(() => {
    if (_cachedProducts) {
      setLoading(false);
      return;
    }
    fetchProductsOnce().then(({ products, categories }) => {
      setProducts(products);
      setCategories(categories);
      setLoading(false);
    });
  }, []);

  /* ---------- Scroll restoration ---------- */
  useEffect(() => {
    if (!loading && products.length > 0) {
      const saved = sessionStorage.getItem("products-scroll-position");
      if (saved) {
        setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: "instant" }), 80);
        sessionStorage.removeItem("products-scroll-position");
      }
    }
  }, [loading, products]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem("products-scroll-position", window.scrollY.toString());
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Click-outside for dropdowns ---------- */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setIsCategoryOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* ---------- Sync state from URL (back button / header search) ---------- */
  useEffect(() => {
    if (urlCategory !== filterCategory) setFilterCategory(urlCategory);
    if (urlSort !== sort) setSort(urlSort);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlPage !== page) setPage(urlPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSort, urlSearch, urlPage]);

  /* ---------- Debounced URL sync (prevents OOM loops) ---------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (sort) params.set("sort", sort);
      if (searchQuery) params.set("search", searchQuery);
      if (page > 1) params.set("page", String(page));

      const nextUrl = params.toString() ? `/products?${params}` : "/products";
      const currentUrl = window.location.pathname + window.location.search;
      if (nextUrl !== currentUrl) router.push(nextUrl, { scroll: false });
    }, 400);
    return () => clearTimeout(handler);
  }, [filterCategory, sort, searchQuery, page, router]);

  const resetPage = useCallback(() => setPage(1), []);

  /* ---------- Filter + Sort ---------- */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filterCategory) {
      result = result.filter(p => p.category === filterCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "new":
        result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
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
  }, [products, filterCategory, sort, searchQuery]);

  /* ---------- Pagination ---------- */
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredProducts, safePage]
  );

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "", label: "Sort By" },
    { value: "new", label: "New Arrivals" },
    { value: "best", label: "Best Selling" },
    { value: "price-high", label: "Price: High → Low" },
    { value: "price-low", label: "Price: Low → High" },
  ];

  const pageTitle = filterCategory ? filterCategory.replace(/-/g, " ") : "All Items";

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded-full animate-pulse mx-auto mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[3/4.2] bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      {/* TITLE */}
      <h1 className="text-center text-3xl tracking-[0.35em] font-light uppercase mb-10">
        {pageTitle}
      </h1>

      {/* SEARCH BAR */}
      <div className="relative max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder={t("search_placeholder") || "Search products..."}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
          suppressHydrationWarning
          className="w-full px-6 py-3 pl-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all bg-white shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">

        {/* CATEGORY DROPDOWN */}
        <div className="relative" ref={categoryRef}>
          <button
            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsSortOpen(false); }}
            suppressHydrationWarning
            className="flex items-center justify-between gap-3 border border-gray-200 bg-white px-5 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <span className="capitalize">
              {filterCategory
                ? categories.find(c => c.slug === filterCategory)?.name || filterCategory.replace(/-/g, " ")
                : "All Categories"}
            </span>
            <span className={`text-gray-400 text-[10px] transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20">
              <button
                onClick={() => { setFilterCategory(null); setIsCategoryOpen(false); resetPage(); }}
                suppressHydrationWarning
                className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${!filterCategory ? "bg-gray-50 font-medium text-black" : "text-gray-600"}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setFilterCategory(cat.slug); setIsCategoryOpen(false); resetPage(); }}
                  suppressHydrationWarning
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
            onClick={() => { setIsSortOpen(!isSortOpen); setIsCategoryOpen(false); }}
            suppressHydrationWarning
            className="flex items-center justify-between gap-3 border border-gray-200 bg-white px-5 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <span>{sortOptions.find(o => o.value === sort)?.label || "Sort By"}</span>
            <span className={`text-gray-400 text-[10px] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSort(option.value); setIsSortOpen(false); resetPage(); }}
                  suppressHydrationWarning
                  className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${sort === option.value ? "bg-gray-50 font-medium text-black" : "text-gray-600"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        <span className="text-sm text-gray-400">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* PRODUCTS */}
      {visibleProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {t("search_no_results") || "No products found."}
        </p>
      ) : (
        <>
          <ProductGrid products={visibleProducts} />

          <Paginator
            page={safePage}
            totalPages={totalPages}
            onPage={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          <p className="text-center text-xs text-gray-400 mt-4">
            Page {safePage} of {totalPages} &mdash; showing {visibleProducts.length} of {filteredProducts.length} products
          </p>
        </>
      )}
    </section>
  );
}

/* ---------------- PAGE SHELL ---------------- */

export default function ProductsClient() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <section className="px-6 py-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4.2] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </section>
        }
      >
        <ProductsContent />
      </Suspense>
      <Footer />
    </>
  );
}
