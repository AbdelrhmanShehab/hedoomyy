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
                suppressHydrationWarning
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
                {categories.map((cat, index) => {
                    // 🛡️ Data Guard: Handle missing/invalid objects
                    if (!cat || typeof cat !== "object") return null;

                    // 🛡️ Safety Guard: Strict string check for slug
                    const safeSlug = typeof cat.slug === "string" ? cat.slug.toLowerCase() : "unknown";
                    
                    // 🛡️ Safety Guard: Strict name check + translation fallback
                    const translationKey = `category_${safeSlug.replace(/-/g, "_")}` as any;
                    const translatedTitle = (typeof t(translationKey) === "string" && t(translationKey) !== translationKey)
                        ? t(translationKey) 
                        : (typeof cat.name === "string" ? cat.name : "Untitled");

                    return (
                        <div
                            key={cat.id || `cat-${index}`}
                            className="min-w-[calc(50%-12px)] sm:min-w-[calc(33.33%-16px)] lg:min-w-[calc(25%-18px)] transition-all duration-300"
                        >
                            <CategoryCard
                                title={translatedTitle}
                                image={typeof cat.image === "string" ? cat.image : "/placeholder.jpg"}
                                href={`/products?category=${safeSlug}`}
                            />
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => scroll(isRTL ? "left" : "right")}
                suppressHydrationWarning
                className={`hidden md:flex absolute ${isRTL ? "-left-5" : "-right-5"} top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-zinc-50 transition-colors cursor-pointer`}
            >
                <ChevronRight size={20} className="text-zinc-600" />
            </button>
        </div>
    );
}
