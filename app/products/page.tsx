import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse all women's clothing at Hedoomyy — dresses, tops, and more. Filter by category and sort by price or new arrivals. Fast delivery across Egypt.",
  alternates: {
    canonical: "https://hedoomyy.com/products",
  },
  openGraph: {
    url: "https://hedoomyy.com/products",
    title: "Shop All Products | Hedoomyy",
    description:
      "Browse all women's clothing at Hedoomyy — dresses, tops, and more. Fast delivery across Egypt.",
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
