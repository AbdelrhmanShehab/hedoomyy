"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { doc, getDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "@/components/product/QuantitySelector";
import Image from "next/image";
import type { Product, ProductVariant } from "@/data/product";
import { ChevronLeft, ChevronRight, Heart, Truck, ShoppingBag } from "lucide-react";
import ProductSlider from "@/components/ProductSlider";
import { Benne } from "next/font/google";
import { useFavorites } from "@/context/FavoritesContext";

const benne = Benne({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const { toggleFavorite, isFavorite } = useFavorites();
  const isWishlisted = isFavorite(id);

  /* ---------------- FETCH PRODUCT & RELATED ---------------- */

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!id) return;

        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          setProduct(null);
          return;
        }

        const productData = {
          id: snap.id,
          ...snap.data(),
        } as Product;

        setProduct(productData);

        // Fetch related products (just first 8 for now)
        const q = query(collection(db, "products"), limit(8));
        const relSnap = await getDocs(q);
        const relDocs = relSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Product))
          .filter(p => p.id !== id);
        setRelatedProducts(relDocs);

      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl font-light text-gray-400">Loading…</p>
        </div>
        <Footer />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl font-light text-gray-400">Product not found</p>
        </div>
        <Footer />
      </div>
    );

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

  /* ---------------- ACTIONS ---------------- */

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

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % (product.images?.length || 1));
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
  }

  const images = product.images ?? ["/1.png"];

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-16 mb-24">

          {/* IMAGE SECTION */}
          <div className="space-y-6">
            <div className="relative group aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
              <Image
                src={images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />

              {/* SLIDER ARROWS */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            <p className={`${benne.className} text-center text-[#DE9DE5] text-4xl font-bold tracking-wide italic`}>
              Real people. Real clothes.
            </p>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-[32px] font-medium text-[#262626] leading-tight max-w-[80%]">
                {product.title}
              </h1>
              <button
                onClick={() => toggleFavorite(id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isWishlisted ? "bg-[#DE9DE5]/10 text-[#DE9DE5]" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
              >
                <Heart size={24} className={isWishlisted ? "fill-[#DE9DE5]" : ""} />
              </button>
            </div>

            <p className="text-2xl font-normal text-gray-800 mb-10">
              EGP {product.price}
            </p>

            <div className="space-y-10">
              {/* COLORS */}
              <div>
                <p className="text-lg font-normal text-gray-600 mb-4">Choose Color:</p>
                <div className="flex gap-3 flex-wrap">
                  {allColors.map(c => {
                    const hasStockForColor = variants.some(v => v.color === c && (v.stock ?? 0) > 0);
                    const isActive = color === c;
                    return (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setSize(""); }}
                        className={`min-w-[80px] h-12 rounded-xl border flex items-center justify-center px-4 transition-all
                          ${isActive ? "bg-[#DE9DE5] border-[#DE9DE5] text-white shadow-md" : "border-gray-300 text-gray-700 hover:border-[#DE9DE5]"}
                          ${!hasStockForColor ? "opacity-40 cursor-not-allowed" : ""}
                        `}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIZES */}
              <div>
                <p className="text-lg font-normal text-gray-600 mb-1">Choose Size</p>
                <p className="text-sm font-light text-gray-400 mb-4">fit up to:</p>
                <div className="flex gap-3 flex-wrap">
                  {allSizes.map(s => {
                    const variantForSize = variants.find(v => v.color === color && v.size === s);
                    const hasStock = (variantForSize?.stock ?? 0) > 0;
                    const isActive = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`min-w-[80px] h-12 rounded-xl border flex items-center justify-center px-4 transition-all
                          ${isActive ? "bg-[#DE9DE5] border-[#DE9DE5] text-white shadow-md" : "border-gray-300 text-gray-700 hover:border-[#DE9DE5]"}
                          ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}
                        `}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SHIPPING INFO */}
              <div className="flex items-start gap-4 text-gray-500 py-4">
                <Truck className="w-6 h-6 shrink-0 mt-1" />
                <p className="text-sm leading-relaxed max-w-sm">
                  Orders usually arrive within 1 to 7 business days from confirming the order.
                </p>
              </div>

              {/* ADD TO CART SECTION */}
              <div className="flex items-center gap-4 pt-4">
                <QuantitySelector value={qty} onChange={setQty} max={variantStock} />

                <button
                  disabled={!canAdd}
                  onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center gap-3 h-[58px] rounded-full text-lg font-medium transition-all
                    ${canAdd ? "bg-[#DE9DE5] hover:bg-[#cf8ed5] text-white shadow-lg active:scale-[0.98]" : "bg-gray-200 text-gray-400"}
                  `}
                >
                  <ShoppingBag size={22} />
                  <span>
                    {!isVariantSelected ? "Select Options" : isOutOfStock ? "Out of Stock" : "Add to bag"}
                  </span>
                </button>
              </div>

              {/* SHARE */}
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Loved it?{" "}
                  <button className="text-[#DE9DE5] underline decoration-[#DE9DE5]/40 underline-offset-4 hover:decoration-[#DE9DE5] transition-all">
                    Share with your friends
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED INFO SECTION */}
        <div className="grid md:grid-cols-1 gap-12 mb-24 max-w-4xl">
          <section>
            <h2 className="text-xl font-medium text-[#262626] mb-4">Description</h2>
            <div className="text-gray-600 font-light leading-relaxed whitespace-pre-line text-sm">
              {product.description || "No description available."}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#262626] mb-4">Promises</h2>
            <p className="text-gray-600 font-light leading-relaxed text-sm">
              If it&apos;s not exactly like the photo, simply refuse delivery at your door. No hassle, no questions.
            </p>
          </section>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-normal text-[#262626] mb-12">Also don&apos;t miss these!</h2>
            <ProductSlider products={relatedProducts} />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
