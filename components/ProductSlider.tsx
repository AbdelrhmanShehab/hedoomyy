"use client";
import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  [key: string]: any;
}

interface ProductSliderProps {
  products: Product[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useLanguage();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group overflow-hidden">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] md:min-w-[320px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => scroll(isRTL ? "right" : "left")}
        aria-label={isRTL ? "التالي" : "Previous"}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scroll(isRTL ? "left" : "right")}
        aria-label={isRTL ? "السابق" : "Next"}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProductSlider;