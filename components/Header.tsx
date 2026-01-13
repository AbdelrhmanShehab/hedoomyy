"use client";

import Link from "next/link";
import { User, ShoppingBag } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "All Items", href: "/products" },
  { name: "Upper-Wear", href: "/products?category=upper-wear" },
  { name: "Jackets", href: "/products?category=jackets" },
  { name: "Full Sets", href: "/products?category=full-sets" },
  { name: "About Us", href: "/about" },
  { name: "Our Policy", href: "/policy" },
];

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-gray-300 text-gray-800 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Left */}
          <span className="flex items-center gap-2">
            📞 <span>+01141088386</span>
          </span>

          {/* Center */}
          <span className="font-medium">Hedoomyy</span>

          {/* Right */}
          <div className="flex items-center gap-4">
            <span className="hidden md:block">Enjoy your shopping :)</span>
            <Link href="/faqs" className="hover:underline">
              FAQs
            </Link>
            <Link href="/policy#return" className="hover:underline">
              Return & Exchange
            </Link>
            <Link href="/policy#delivery" className="hover:underline">
              Delivery
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          {/* Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-black text-gray-700 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <Link href="/account" aria-label="Account">
              <User className="w-5 h-5 text-gray-700 hover:text-black transition" />
            </Link>
            <Link href="/cart" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 text-gray-700 hover:text-black transition" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
