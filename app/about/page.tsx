import Link from "next/link";
import { Heart } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Hedoomyy — an online clothing store based in Cairo, Egypt. Our mission is to provide quality fashion at affordable prices with a smooth shopping experience.",
  alternates: {
    canonical: "https://hedoomyy.com/about",
  },
  openGraph: {
    url: "https://hedoomyy.com/about",
    title: "About Us | Hedoomyy",
    description:
      "Learn about Hedoomyy — an online clothing store based in Cairo, Egypt. Our mission is to provide quality fashion at affordable prices.",
  },
};

export default function AboutPage() {
  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">

        {/* LEFT SIDE */}
        <div>
          <Link href="/" className="text-sm text-gray-500">
            Back to home &gt;
          </Link>

          <h1 className="text-5xl font-light mt-6">
            <span className="bg-gradient-to-r font-medium from-purple-300 to-pink-300 bg-clip-text text-transparent">
              About Us
            </span>
          </h1>

          <p className="text-gray-500 mt-6 text-sm max-w-md">
            A small brand with a simple mission — creating quality pieces
            that look good, feel good, and stay affordable.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-10 text-sm">

          <div className="border-b pb-6">
            <h3 className="text-purple-300 font-bold mb-2">
              Our Story
            </h3>

            <p className="text-gray-700">
              Hedoomyy is an online clothing store based in Cairo.
              We started with a simple idea: provide high-quality pieces
              without the unnecessary high prices that usually come with fashion brands.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-purple-300 font-bold mb-2">
              Our Mission
            </h3>

            <p className="text-gray-700">
              Our mission is to give customers a smooth and enjoyable online
              shopping experience while delivering clothing that balances
              comfort, style, and durability.
            </p>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-purple-300 font-bold mb-2">
              What Makes Us Different
            </h3>

            <p className="text-gray-700">
              Every piece is made with attention to detail and passion.
              We focus on good materials, clean designs, and fair pricing
              so everyone can enjoy quality clothing without overpaying.
            </p>
          </div>

          <div>
            <h3 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
              Made With Love
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            </h3>

            <p className="text-gray-700">
              All of our pieces are created with love and care.
              We hope every item you receive becomes something
              you truly enjoy wearing.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/products"
            className="inline-block mt-6 text-purple-300 font-bold hover:underline"
          >
            Start Shopping →
          </Link>

        </div>
      </div>

      <Footer />
    </div>
  );
}