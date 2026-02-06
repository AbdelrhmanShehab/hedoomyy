"use client";

import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag } from "lucide-react";
import useCategories from "../usecategories";
import callIcon from "../public/calIIcon.svg";
import instagramIcon from "../public/instagramIcon.svg";

export default function Header() {
  const { categories } = useCategories();

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
            <Link href="/account">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart">
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
