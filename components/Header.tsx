"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { User, ShoppingBag, Menu, X } from "lucide-react";
import useCategories from "../usecategories";
import callIcon from "../public/calIIcon.svg";
import instagramIcon from "../public/instagramIcon.svg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { categories } = useCategories();
  const { items, openCart } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-gray-400 text-white text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Image src={callIcon} alt="Call" />
              <span className="hidden sm:inline">+01141088386</span>
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
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <Link href="/products" className="hover:text-black transition-colors">All Items</Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="capitalize text-gray-700 hover:text-black transition-colors"
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
              <button
                onClick={openCart}
                className="p-1 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 cart-icon text-gray-700 hover:text-black" />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full pointer-events-none">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[116px] bg-black/40 z-30 md:hidden backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 md:hidden">
            <nav className="flex flex-col p-6 gap-5">
              <Link
                href="/"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                All Items
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="capitalize text-lg font-medium text-gray-700 hover:text-black border-b border-gray-50 pb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
