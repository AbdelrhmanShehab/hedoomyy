"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { Product } from "@/data/product";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";

export default function FavoritesClient() {
  const { favorites } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: favorites }),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <h1 className="text-[32px] font-medium text-[#262626] mb-8">{t("favorites_title")}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400">{t("favorites_loading")}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-pink-400 stroke-pink-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-zinc-800">{t("favorites_empty_title")}</h2>
              <p className="text-zinc-500 max-w-md mx-auto">
                {t("favorites_empty_desc")}
              </p>
            </div>

            <Link href="/products" className="inline-flex items-center gap-2 bg-[#DE9DE5] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer">
              <ShoppingBag className="w-5 h-5" /> {t("about_start_shopping")}
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
