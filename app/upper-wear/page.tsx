"use client";
import { useEffect, useMemo, useState } from "react";
import one from "../../public/1.png";
import FilterBar from "../../components/FilterBar";
import ProductGrid from "../../components/ProductGrid";
import Pagination from "../../components/Pagination";
import { Product } from "../../data/product";
const PRODUCTS: Product[] = Array.from({ length: 20 }).map((_, i) => ({
    id: i + "1",
    title: "Blouse and belted skirt",
    price: 250,
    image: "../../public/1.png",
    category: "upper",
}));

const CATEGORIES = [
    { id: "upper", name: "Upper Wear" },
        { id: "lower", name: "Lower Wear" },
    ];
const ITEMS_PER_PAGE = 8;


export default function UpperWearPage() {
    const [sort, setSort] = useState("new");
    const [category, setCategory] = useState("all");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [sort, category]);



    const filtered = useMemo(() => {
        let list = [...PRODUCTS];

        if (category !== "all") {
            list = list.filter((p) => p.category === category);
        }

        if (sort === "high") list.sort((a, b) => b.price - a.price);
        if (sort === "low") list.sort((a, b) => a.price - b.price);

        return list;
    }, [sort, category]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const paginated = filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <section className="px-4 sm:px-8 py-12">
            <FilterBar
                sort={sort}
                setSort={setSort}
                category={category}
                setCategory={setCategory}
                categories={CATEGORIES}
            />

            <ProductGrid products={paginated} />

            <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />
        </section>
    );
}
