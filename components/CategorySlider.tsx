"use client";

import { useRef } from "react";
import CategoryCard from "./home/CategoryCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
    image?: string;
};

type Props = {
    categories: Category[];
};

export default function CategorySlider({ categories }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector("a"); // All CategoryCards are <a> links

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
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-zinc-50 transition-colors"
            >
                <ChevronLeft size={20} className="text-zinc-600" />
            </button>

            {/* Slider */}
            <div
                ref={scrollRef}
                className="flex gap-8 md:gap-6 overflow-x-auto md:overflow-hidden scroll-smooth no-scrollbar px-4 md:px-10"
            >
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="min-w-[20%] sm:min-w-[18%] md:min-w-[calc(25%-18px)] lg:min-w-[calc(20%-20px)] transition-all duration-300"
                    >
                        <CategoryCard
                            title={`Shop ${cat.name}`}
                            image={cat.image || "/placeholder.jpg"}
                            href={`/products?category=${cat.slug}`}
                        />
                    </div>
                ))}
            </div>

            {/* Right Arrow (Desktop Only) */}
            <button
                onClick={() => scroll("right")}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-zinc-50 transition-colors"
            >
                <ChevronRight size={20} className="text-zinc-600" />
            </button>
        </div>
    );
}
