"use client";
import Link from "next/link";
import ProductSlider from "../../components/ProductSlider";
import { Product } from "../../data/product";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  products: Product[];
}

export default function BestSeller({ products }: Props) {
  // 🛡️ Data Guard: Prevent crash if products is not an array
  if (!Array.isArray(products) || products.length === 0) return null;

  const { t } = useLanguage();
  const displayedProducts = products.slice(0, 7);

  return (
    <section className="w-full px-5 py-16">
      <div className="flex items-baseline justify-between mb-3 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-zinc-900">
          {t("best_seller_title")}
        </h2>
        <Link
          href="/products?sort=best"
          className="text-sm font-medium text-zinc-600 hover:text-black transition-colors underline underline-offset-4"
        >
          {t("best_seller_see_more")}
        </Link>
      </div>
      <ProductSlider products={displayedProducts} />
    </section>
  );
}
