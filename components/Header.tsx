"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useEffect, useState, memo } from "react";
import useCategories from "../usecategories";
import callIcon from "../public/calIIcon.svg";
import instagramIcon from "../public/instagramIcon.svg";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/context/LanguageContext";

interface Order {
  id: string;
}

export default function Header() {
  const { categories } = useCategories();
  const { items, openCart } = useCart();
  const { user, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();

  const cartCount = items.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-gray-400 text-white text-sm font-bold">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">

          {/* Left Side */}
          <div className="flex items-center gap-6">
            <a href="tel:+01141088386" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Image src={callIcon} alt="Call" width={16} height={16} />
              <span className="hidden sm:inline">+01141088386</span>
            </a>
            <Link href="https://www.instagram.com/hedoomyy/" target="_blank" className="cursor-pointer">
              <span className="flex items-center gap-2 ">
                <Image src={instagramIcon} alt="Instagram" width={16} height={16} />
                <span className="font-bold">Hedoomyy</span>
              </span>
            </Link>
          </div>

          {/* Center Text */}
          <span className="hidden md:block text-s ">
            {t("header_enjoy")}
          </span>

          {/* Right Side */}
          <div className="flex items-center gap-3 text-s">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
              <a href="/policy" className="hover:underline cursor-pointer">{t("header_faqs")}</a>
              <span className="text-white/60">|</span>
              <a href="/policy" className="hover:underline cursor-pointer">{t("header_return")}</a>
              <span className="text-white/60">|</span>
              <a href="/policy" className="hover:underline cursor-pointer">{t("header_delivery")}</a>
              <span className="text-white/60">|</span>
              <a href="/about" className="hover:underline cursor-pointer">{t("header_about")}</a>
            </div>
            {/* Mobile Link */}
            <div className="md:hidden">
              <Link href="/policy" className="hover:underline font-bold cursor-pointer">{t("header_our_policy")}</Link>
            </div>

            {/* Language Toggle */}
            <span className="text-white/60 hidden md:inline">|</span>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="font-bold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-white text-sm"
              aria-label="Switch language"
            >
              {t("header_lang_toggle")}
            </button>
          </div>

        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-700 cursor-pointer"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-black transition-colors cursor-pointer">{t("header_home")}</Link>
            <Link href="/products" className="hover:text-black transition-colors cursor-pointer">{t("header_all_items")}</Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="capitalize text-gray-700 hover:text-black transition-colors cursor-pointer"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                if (user) {
                  window.location.href = "/account";
                } else {
                  window.location.href = "/login?redirect=/account";
                }
              }}
              className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-gray-700 font-bold text-sm uppercase">
                    {(user.displayName || user.email || "?")[0]}
                  </span>
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
              )}
            </button>


            <button
              onClick={() => {
                window.location.href = user ? "/favorites" : "/login?redirect=/favorites";
              }}
              className="relative p-1 hover:bg-gray-100 rounded-full transition-all cursor-pointer bg-transparent border-none"
            >
              <Heart className="w-5 h-5 text-gray-700 hover:text-pink-400 transition-colors" />
            </button>

            <div className="relative">
              <button
                onClick={openCart}
                className="p-1 hover:bg-gray-100 rounded-full transition-all active:scale-95 cursor-pointer"
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

            {/* Mobile Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="md:hidden text-sm font-bold text-gray-700 cursor-pointer bg-transparent border-none"
              aria-label="Switch language"
            >
              {t("header_lang_toggle")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[116px] bg-black/40 z-30 md:hidden backdrop-blur-[2px] cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 md:hidden">
            <nav className="flex flex-col p-6 gap-5">
              <Link
                href="/"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header_home")}
              </Link>

              <Link
                href="/products"
                className="text-lg font-medium text-gray-900 border-b border-gray-50 pb-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header_all_items")}
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="capitalize text-lg font-medium text-gray-700 hover:text-black border-b border-gray-50 pb-2 cursor-pointer"
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