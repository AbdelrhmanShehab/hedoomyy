"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuantitySelector from "@/components/product/QuantitySelector";
import ColorSelector from "@/components/product/ColorSelector";
import SizeSelector from "@/components/product/SizeSelector";
import one from "@/public/1.png";

export default function ProductPage() {
  const { id } = useParams(); // 👈 dynamic id
  const [color, setColor] = useState("Black");
  const [size, setSize] = useState("90 kg");

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">
        {/* LEFT */}
        <div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={one}
              alt="Product"
              fill
              className="object-cover"
            />
          </div>

          <p className="text-center text-purple-400 mt-4 text-sm">
            Real people. Real clothes.
          </p>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-light">
              Blouse and belted skirt
            </h1>
            <p className="text-gray-500 mt-2">EGP 750</p>
            <p className="text-xs text-gray-400 mt-1">
              Product ID: {id}
            </p>
          </div>

          <ColorSelector
            value={color}
            onChange={setColor}
            options={["White", "Black", "Green"]}
          />

          <SizeSelector
            value={size}
            onChange={setSize}
            options={["80 kg", "90 kg", "100 kg", "110 kg"]}
          />

          <div className="flex items-center gap-6">
            <QuantitySelector />

            <button className="flex-1 bg-purple-300 hover:bg-purple-400 transition text-white rounded-full py-3 text-sm">
              Add to bag
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
