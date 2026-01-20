"use client";

import { Category } from "../data/category";

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
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">

      <h1 className="text-2xl sm:text-3xl font-light tracking-wide">
        Upper-Wear
      </h1>

      <div className="flex flex-wrap gap-3">
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-full border text-sm"
        >
          <option value="new">New Arrivals</option>
          <option value="best">Best Selling</option>
          <option value="high">Price: High to Low</option>
          <option value="low">Price: Low to High</option>
        </select>

        {/* Dynamic Categories */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-full border text-sm"
        >
          <option value="all">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
