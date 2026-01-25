"use client";

import ProductCard from "@/components/ProductCard";
import one from "../../public/1.png";
import { Product } from "../../data/product";
const products: Product[] = [
    {
        id: "1001",
        title: "Product 1",
        price: 500,
        image: "/1.png",
    },
]

export default function BestSeller() {
    return (
        <section className="w-full px-5 py-16">
            <h2 className="mb-6 text-2xl font-medium">Explore Best Seller</h2>

            <div className="flex gap-16 justify-center">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
