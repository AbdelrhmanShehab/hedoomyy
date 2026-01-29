"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "../../components/FilterBar";
import ProductGrid from "../../components/ProductGrid";
import Pagination from "../../components/Pagination";
import { Product } from "../../data/product";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [sort, activeCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const baseQuery =
        activeCategory === "all"
          ? collection(db, "products")
          : query(
              collection(db, "products"),
              where("category", "==", activeCategory)
            );

      const snap = await getDocs(baseQuery);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));

      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [activeCategory]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "low") list.sort((a, b) => a.price - b.price);

    return list;
  }, [products, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section className="px-4 sm:px-8 py-12">
      <h1 className="text-2xl font-semibold mb-6 capitalize">
        {activeCategory.replace("-", " ")}
      </h1>

      <FilterBar
        sort={sort}
        setSort={setSort}
        category={activeCategory}
        setCategory={() => {}}
        categories={[]} // handled in header now
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ProductGrid products={paginated} />
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </>
      )}
    </section>
  );
}
