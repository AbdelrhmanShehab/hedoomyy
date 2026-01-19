"use client";

import Image from "next/image";
import { useState } from "react";
import QuantitySelector from "../../components/product/QuantitySelector";
import ColorSelector from "../../components/product/ColorSelector";
import SizeSelector from "../../components/product/SizeSelector";

export default function ProductPage() {
  const [color, setColor] = useState("Black");
  const [size, setSize] = useState("90 kg");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">
      {/* LEFT – IMAGE */}
      <div>
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src="/product.jpg" // put image in /public
            alt="Blouse and belted skirt"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-center text-purple-400 mt-4 text-sm">
          Real people. Real clothes.
        </p>

        {/* DESCRIPTION */}
        <div className="mt-10 space-y-6 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Description</h3>
            <p>
              56% Cotton, 23% TENCEL™ Lyocell, 20% Recycled Cotton, 1% Elastane.
              Wash once separately in cold water before wearing.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2">Promises</h3>
            <p>
              If it’s not exactly like the photo, simply refuse delivery at
              your door. No hassle, no questions.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT – INFO */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light">Blouse and belted skirt</h1>
          <p className="text-gray-500 mt-2">EGP 750</p>
        </div>

        {/* COLOR */}
        <ColorSelector
          value={color}
          onChange={setColor}
          options={["White", "Black", "Green"]}
        />

        {/* SIZE */}
        <SizeSelector
          value={size}
          onChange={setSize}
          options={["80 kg", "90 kg", "100 kg", "110 kg"]}
        />

        {/* DELIVERY NOTE */}
        <p className="text-xs text-gray-500 flex items-center gap-2">
          🚚 Orders usually arrive within 1–7 business days from confirming
          the order.
        </p>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <QuantitySelector />

          <button className="flex-1 bg-purple-300 hover:bg-purple-400 transition text-white rounded-full py-3 text-sm">
            Add to bag
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Loved it?{" "}
          <span className="text-purple-400 underline cursor-pointer">
            Share with your friends
          </span>
        </p>
      </div>
    </div>
  );
}
