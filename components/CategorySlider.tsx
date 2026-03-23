"use client";

import { useRef } from "react";
import CategoryCard from "./home/CategoryCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
    const { t, isRTL } = useLanguage();

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector("a");

        if (!card) return;

        const cardWidth = card.clientWidth + 24;
        const scrollAmount = cardWidth * 4;

        const scrollValue = direction === "left" ? -scrollAmount : scrollAmount;
        
        container.scrollBy({
            left: isRTL ? -scrollValue : scrollValue,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            {/* Arrows (Desktop Only) */}
            <button
                onClick={() => scroll(isRTL ? "right" : "left")}
                className={`hidden md:flex absolute ${isRTL ? "-right-5" : "-left-5"} top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-zinc-50 transition-colors cursor-pointer`}
            >
                <ChevronLeft size={20} className="text-zinc-600" />
            </button>

            {/* Slider */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto md:overflow-hidden scroll-smooth no-scrollbar px-4 md:px-10"
                dir={isRTL ? "rtl" : "ltr"}
            >
                {categories.map((cat) => {
                    const translationKey = `category_${cat.slug.toLowerCase().replace(/-/g, "_")}` as any;
                    const translatedTitle = t(translationKey) !== translationKey ? t(translationKey) : cat.name;

                    return (
                        <div
                            key={cat.id}
                            className="min-w-[calc(50%-12px)] sm:min-w-[calc(33.33%-16px)] lg:min-w-[calc(25%-18px)] transition-all duration-300"
                        >
                            <CategoryCard
                                title={translatedTitle}
                                image={cat.image || "/placeholder.jpg"}
                                href={`/products?category=${cat.slug}`}
                            />
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => scroll(isRTL ? "left" : "right")}
                className={`hidden md:flex absolute ${isRTL ? "-left-5" : "-right-5"} top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-zinc-50 transition-colors cursor-pointer`}
            >
                <ChevronRight size={20} className="text-zinc-600" />
            </button>
        </div>
    );
}
