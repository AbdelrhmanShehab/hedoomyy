"use client";

import ProductCard from "./ProductCard";
import { Product } from "../data/product";
type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  return (
    <div className="
      grid
      grid-cols-2
      sm:grid-cols-3
      lg:grid-cols-4
      gap-6
    ">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
