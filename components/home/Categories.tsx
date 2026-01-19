"use client";

import CategoryCard from "./CategoryCard";

const categories = [
  {
    title: "Shop Full-set",
    image: "/categories/full-set.jpg",
    href: "/products?category=full-set",
  },
  {
    title: "Shop Bottoms",
    image: "/categories/bottoms.jpg",
    href: "/products?category=bottoms",
  },
  {
    title: "Shop Jackets",
    image: "/categories/jackets.jpg",
    href: "/products?category=jackets",
  },
  {
    title: "Shop Dresses",
    image: "/categories/dresses.jpg",
    href: "/products?category=dresses",
  },
  {
    title: "Shop Tops",
    image: "/categories/tops.jpg",
    href: "/products?category=tops",
  },
];

export default function Categories() {
  return (
    <section className=" pb-20">
      <h2 className="mb-8 text-xl font-medium text-zinc-900">
        Explore Categories
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            image={cat.image}
            href={cat.href}
          />
        ))}
      </div>
    </section>
  );
}
