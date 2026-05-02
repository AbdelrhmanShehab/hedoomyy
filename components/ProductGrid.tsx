"use client";

import { memo } from "react";
import { Product } from "../data/product";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
};

const ProductGrid = memo(function ProductGrid({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No products found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
});

export default ProductGrid;
