"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuantitySelector from "@/components/product/QuantitySelector";
import ColorSelector from "@/components/product/ColorSelector";
import SizeSelector from "@/components/product/SizeSelector";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [color, setColor] = useState("Black");
  const [size, setSize] = useState("90 kg");

  // 🔥 FETCH PRODUCT BY ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-20">Loading…</p>;
  }

  if (!product) {
    return (
      <p className="text-center mt-20 text-red-500">
        Product not found
      </p>
    );
  }

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">
        {/* LEFT */}
        <div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={product.image || "/1.png"}
              alt={product.title}
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
              {product.title}
            </h1>

            <p className="text-gray-500 mt-2">
              EGP {product.price}
            </p>

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
