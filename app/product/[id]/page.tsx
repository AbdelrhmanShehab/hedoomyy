"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "@/components/product/QuantitySelector";
import Image from "next/image";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = snap.data();
        setProduct({ id: snap.id, ...data });
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  const availableColors: string[] = useMemo(() => {
    if (!product) return [];

    return Array.from(
      new Set(
        product.variants.map((v: any) => v.color)
      )
    ) as string[];
  }, [product]);

  const availableSizes: string[] = useMemo(() => {
    if (!product) return [];

    return Array.from(
      new Set(
        product.variants.map((v: any) => v.size)
      )
    ) as string[];
  }, [product]);


  const validVariant = useMemo(() => {
    if (!product || !color || !size) return null;

    return product.variants.find(
      (v: any) => v.color === color && v.size === size
    );
  }, [product, color, size]);

  const canAdd =
    validVariant &&
    validVariant.stock > 0 &&
    product.status === "active";

  if (loading) return <p className="text-center mt-20">Loading…</p>;
  if (!product)
    return <p className="text-center mt-20">Product not found</p>;

  const images = product.images ?? [];

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">
        {/* IMAGE SLIDER */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={images[selectedImage] ?? "/1.png"}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex gap-3">
            {images.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden cursor-pointer border ${selectedImage === i
                  ? "border-black"
                  : "border-gray-200"
                  }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-light">
              {product.title}
            </h1>

            <p className="text-gray-500 mt-2">
              EGP {product.price}
            </p>

            <p className="text-sm text-gray-600 mt-4">
              {product.description}
            </p>
          </div>

          {/* COLORS */}
          <div>
            <p className="text-sm mb-2">Choose Color:</p>
            <div className="flex gap-3 flex-wrap">
              {availableColors.map((c) => {
                const hasStock = product.variants.some(
                  (v: any) => v.color === c && v.stock > 0
                );

                return (
                  <button
                    key={c}
                    disabled={!hasStock}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 rounded-lg border text-sm ${color === c
                      ? "bg-purple-300 text-white"
                      : "border-gray-300"
                      } ${!hasStock
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                      }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIZES */}
          <div>
            <p className="text-sm mb-2">Choose Size:</p>
            <div className="flex gap-3 flex-wrap">
              {availableSizes.map((s) => {
                const hasStock = product.variants.some(
                  (v: any) =>
                    v.size === s &&
                    (!color || v.color === color) &&
                    v.stock > 0
                );

                return (
                  <button
                    key={s}
                    disabled={!hasStock}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm ${size === s
                      ? "bg-purple-300 text-white"
                      : "border-gray-300"
                      } ${!hasStock
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                      }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADD TO CART */}
          <div className="flex items-center gap-6">
            <QuantitySelector
              value={qty}
              onChange={setQty}
            />

            <button
              disabled={!canAdd}
              onClick={() => {
                if (!validVariant) return;

                addItem({
                  productId: product.id,
                  variantId: validVariant.id,
                  title: product.title,
                  price: product.price,
                  image: images[0],
                  color,
                  size,
                  qty,
                });

                openCart();
              }}
              className={`flex-1 rounded-full py-3 text-sm ${canAdd
                ? "bg-purple-300 hover:bg-purple-400 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              {canAdd ? "Add to Bag" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
