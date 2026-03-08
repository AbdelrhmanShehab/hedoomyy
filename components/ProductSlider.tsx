"use client";

import { useRef } from "react";
import { Product } from "../data/product";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    products: Product[];
};

export default function ProductSlider({ products }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector("div");

        if (!card) return;

        const cardWidth = card.clientWidth + 24; // 24 = gap-6
        const scrollAmount = cardWidth * 4; // move 4 cards

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            {/* Left Arrow (Desktop Only) */}
            <button
                onClick={() => scroll("left")}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Slider */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto md:overflow-hidden scroll-smooth no-scrollbar px-4 md:px-10"
            >
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="min-w-[calc(50%-12px)] sm:min-w-[calc(33.33%-16px)] lg:min-w-[calc(25%-18px)] transition-all duration-300"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Right Arrow (Desktop Only) */}
            <button
                onClick={() => scroll("right")}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}