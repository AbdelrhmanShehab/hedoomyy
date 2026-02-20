import Image from "next/image";
import Link from "next/link";
import { Instagram, Music2 } from "lucide-react";
import hedoomybanner from "../public/footerhedoomyy.png"

export default function Footer() {
  return (
    <footer className="w-full bg-white text-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-10">
            <Image
              src={hedoomybanner}
              className=" h-28 w-34"
              alt="Picture of the author"
            />
            <p className="text-sm text-zinc-600">
              Designed for Her, Inspired by Her.
            </p>
          </div>
          {/* Shop Now */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Shop Now
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/products">All Items</Link></li>
              <li><Link href="/category/upper-wear">Upper-Wear</Link></li>
              <li><Link href="/category/jackets">Jackets</Link></li>
              <li><Link href="/category/full-set">Full-Set</Link></li>
            </ul>
          </div>

          {/* Know Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Know Us
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Help
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/policy">Policy</Link></li>
              <li><Link href="/track-order">Track Your Order</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-zinc-300" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-zinc-600">
            © Hedoomyy 2021
          </p>

          <div className="flex items-center gap-4">
            <Link href="https://instagram.com" target="_blank">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="https://tiktok.com" target="_blank">
              <Music2 className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
