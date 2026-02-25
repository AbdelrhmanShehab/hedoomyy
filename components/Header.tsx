"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag } from "lucide-react";
import useCategories from "../usecategories";
import callIcon from "../public/calIIcon.svg";
import instagramIcon from "../public/instagramIcon.svg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { categories } = useCategories();
  const { items } = useCart();
  const { user } = useAuth();

  const cartCount = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );
  return (
    <header className="w-full border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-gray-400 text-white text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Image src={callIcon} alt="Call" />
              <span>+01141088386</span>
            </span>

            <span className="flex items-center gap-2">
              <Image src={instagramIcon} alt="Instagram" />
              <span className="font-medium">Hedoomyy</span>
            </span>
          </div>

          <span className="hidden md:block">Enjoy your shopping :)</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/products">All Items</Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="capitalize text-gray-700 hover:text-black"
              >
                {cat.name}
              </Link>
            ))}

          </nav>

          <div className="flex items-center gap-5">
            <Link href="/account" className="flex items-center justify-center">
              {user ? (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-gray-700 font-bold text-sm uppercase">
                    {(user.displayName || user.email || "?")[0]}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
              )}
            </Link>
            <div className="relative">
              <Link href="/cart">
                <ShoppingBag className="w-5 h-5 cart-icon" />
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full pointer-events-none">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
