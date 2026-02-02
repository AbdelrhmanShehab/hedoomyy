"use client";

import { useEffect, useState } from "react";
import ProductsGrid from "../../components/ProductGrid";
import { Product } from "../../data/product";

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // example API endpoint
        fetch("/api/products")
            .then((res) => res.json())
            .then((data: Product[]) => setProducts(data));
    }, []);

    const newArrivals = [...products]
        .sort(
            (a, b) =>
                b.createdAt.toMillis() - a.createdAt.toMillis()
        )
        .slice(0, 8);


    return (
        <section className="w-full px-5 py-16">
            <h2 className="mb-6 text-2xl font-medium">
                Explore New Arrivals
            </h2>

            <ProductsGrid products={newArrivals} />
        </section>
    );
}
