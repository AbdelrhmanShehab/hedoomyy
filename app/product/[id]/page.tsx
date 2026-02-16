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
import type { Product, ProductVariant } from "@/data/product";

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;

        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          setProduct(null);
          return;
        }

        setProduct({
          id: snap.id,
          ...snap.data(),
        } as Product);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return <p className="text-center mt-20">Loading…</p>;

  if (!product)
    return <p className="text-center mt-20">Product not found</p>;

  /* ---------------- VARIANTS ---------------- */

  const variants: ProductVariant[] = product.variants ?? [];

  const allColors = Array.from(
    new Set(variants.map(v => v.color))
  );

  const allSizes = Array.from(
    new Set(variants.map(v => v.size))
  );

  const selectedVariant =
    variants.find(
      v => v.color === color && v.size === size
    ) ?? null;

  const isVariantSelected = !!selectedVariant;

  const variantStock = selectedVariant?.stock ?? 0;

  const isOutOfStock =
    isVariantSelected &&
    (variantStock <= 0 ||
      product.status !== "active");

  const canAdd =
    isVariantSelected &&
    variantStock > 0 &&
    product.status === "active";

  /* ---------------- HANDLE ADD ---------------- */

  const handleAdd = () => {
    if (!selectedVariant) return;

    if (qty > variantStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ?? "/1.png",
      color,
      size,
      qty,
    });

    openCart();
  };

  const images = product.images ?? [];

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">

        {/* IMAGE SECTION */}
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
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden cursor-pointer border ${
                  selectedImage === i
                    ? "border-black"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* INFO SECTION */}
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
              {allColors.map(c => {
                const hasStockForColor = variants.some(
                  v =>
                    v.color === c &&
                    (v.stock ?? 0) > 0
                );

                return (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setSize("");
                    }}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      color === c
                        ? "bg-purple-300 text-white"
                        : "border-gray-300"
                    } ${
                      !hasStockForColor
                        ? "opacity-50"
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
              {allSizes.map(s => {
                const variantForSize = variants.find(
                  v =>
                    v.color === color &&
                    v.size === s
                );

                const stock =
                  variantForSize?.stock ?? 0;

                const hasStock = stock > 0;

                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      size === s
                        ? "bg-purple-300 text-white"
                        : "border-gray-300"
                    } ${
                      !hasStock
                        ? "opacity-50"
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
              max={variantStock}
            />

            <button
              disabled={!canAdd}
              onClick={handleAdd}
              className={`flex-1 rounded-full py-3 text-sm ${
                canAdd
                  ? "bg-purple-300 hover:bg-purple-400 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {!isVariantSelected
                ? "Select Options"
                : isOutOfStock
                ? "Out of Stock"
                : `Add to Bag`}
            </button>
          </div>

          {isVariantSelected && variantStock > 0 && (
            <p className="text-xs text-gray-400">
              {variantStock} left in stock
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
