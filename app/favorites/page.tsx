"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-pink-400 fill-pink-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-800">Your Favorites</h1>
            <p className="text-zinc-500 max-w-md mx-auto">
              Save the items you love to find them easily later. Start browsing our collection and click the heart icon!
            </p>
          </div>

          <Link href="/products" className="inline-flex items-center gap-2 bg-[#E6A6E9] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
            <ShoppingBag className="w-5 h-5" /> Start Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}