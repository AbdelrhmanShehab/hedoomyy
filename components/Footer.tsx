"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Music2 } from "lucide-react";
import hedoomybanner from "../public/footerhedoomyy.png";
import useCategories from "../usecategories";
import tiktok from "../public/tiktok.svg";
export default function Footer() {
  const { categories } = useCategories();

  return (
    <footer className="w-full bg-white text-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-10">
            <Image
              src={hedoomybanner}
              className=" h-28 w-34"
              alt="Picture of the author"
            />
            <p className="text-base font-semibold text-zinc-600">
              Designed for Her, Inspired by Her.
            </p>
          </div>
          {/* Shop Now */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Shop Now
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/products">All Items</Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.slug}`}>
                    <span className="capitalize">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Know Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Know Us
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/policy">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Help
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/policy">Policy</Link>
              </li>
              <li>
                <Link href="/account">Track Your Order</Link>
              </li>
              <li>
                <Link href="/policy">FAQs</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-zinc-300" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-zinc-600">© Hedoomyy 2021</p>

          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/hedoomyy/" target="_blank">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.tiktok.com/@hedoomyy?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnJ6MOZl8F0cgrJZNUxe0oMtg5ex9HQ1yBzfOt1MpX5yvEOs_araEV3cm0m9I_aem_qQ7jxkVHYc2Tjeu0wMXlyA"
              target="_blank"
            >
              <Image src={tiktok} alt="tiktok" width={24} height={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
