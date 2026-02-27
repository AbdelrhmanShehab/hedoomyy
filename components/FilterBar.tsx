"use client";

import { useState, useRef, useEffect } from "react";
import { Category } from "../data/category";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

type Props = {
  sort: string;
  setSort: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: Category[];
};

export default function FilterBar({
  sort,
  setSort,
  category,
  setCategory,
  categories,
}: Props) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { label: "New Arrivals", value: "new" },
    { label: "Best Selling", value: "best" },
    { label: "Price from high to low", value: "high" },
    { label: "Price from low to high", value: "low" },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sort)?.label || "Sort By";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <h1 className="text-2xl sm:text-3xl font-light tracking-wide">
        Upper-Wear
      </h1>

      <div className="flex items-center gap-6">
        {/* Custom Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-lg font-normal text-gray-800 focus:outline-none"
          >
            <span>{currentSortLabel}</span>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          {isSortOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
              <div className="flex flex-col">
                {sortOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSort(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`px-6 py-4 text-center text-lg font-normal transition-colors hover:bg-gray-50
                      ${index !== sortOptions.length - 1 ? "border-b border-gray-100" : ""}
                      ${sort === option.value ? "text-black font-medium" : "text-gray-700"}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Filter Button */}
        <button
          className="flex items-center gap-3 bg-[#E5E5E5] px-6 py-3 rounded-full text-lg font-normal text-gray-800 transition-opacity hover:opacity-90 active:scale-95"
          onClick={() => {/* Category filter logic - could open a drawer or modal if needed */ }}
        >
          <span>Filter By Category</span>
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
