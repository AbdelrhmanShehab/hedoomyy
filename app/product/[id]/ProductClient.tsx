"use client";

import { Product } from "@/data/product";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductSlider from "@/components/ProductSlider";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import HeartRating from "@/components/product/HeartRating";
import ReviewSection from "@/components/product/ReviewSection";
import { trackEvent } from "@/lib/trackEvent";
import { useLanguage } from "@/context/LanguageContext";
type Props = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductClient({ product, relatedProducts }: Props) {
  const { addItem, openCart } = useCart();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t, isRTL } = useLanguage();

  const isFavorited = isFavorite(product.id);

  const variants = product.variants ?? [];
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [currentShareCount, setCurrentShareCount] = useState(product.shareCount || 0);

  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const hasStock = (product.status === "active" && variants.some(v => (v.stock ?? 0) > 0));

  const isOutOfStock =
    !selectedVariant ||
    (selectedVariant.stock ?? 0) <= 0 ||
    product.status !== "active";

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id || `${selectedVariant.color}-${selectedVariant.size}`,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ?? "/1.png",
      color: selectedVariant.color,
      size: selectedVariant.size,
      qty: qty,
      stock: selectedVariant.stock,
    });
    trackEvent(product.id, "cart", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined);
    openCart();
  };

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    trackEvent(product.id, "share");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) return <div className="p-20 text-center">{t("product_not_found")}</div>;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <nav className="flex items-center gap-2 text-[10px] md:text-sm font-medium text-gray-400 uppercase tracking-widest overflow-x-auto whitespace-nowrap lg:no-scrollbar">
            <Link href="/" className="hover:text-black transition-colors">{t("header_home")}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
            <Link href="/products" className="hover:text-black transition-colors">{t("header_all_items")}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-zinc-900 truncate max-w-[150px] md:max-w-none translate-y-[1px]">
              {product.title}
            </span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">

            {/* Gallery Section */}
            <div className="lg:col-span-7 space-y-4 md:space-y-6">
              <div className="relative aspect-[4/5.2] md:aspect-[4/5] rounded-[32px] overflow-hidden bg-zinc-50 group border border-zinc-100/50">
                <Image
                  src={product.images?.[activeImg] ?? "/1.png"}
                  alt={product.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  unoptimized
                />
                {activeImg > 0 && (
                  <button
                    onClick={() => setActiveImg((prev) => prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white active:scale-95 z-10 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
                {activeImg < (product.images?.length ?? 1) - 1 && (
                  <button
                    onClick={() => setActiveImg((prev) => prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white active:scale-95 z-10 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.isBestSeller && (
                    <span className="bg-zinc-900/90 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-tighter">
                      {t("card_best_seller")}
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-tighter shadow-sm">
                      {t("card_sale")}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {product.images?.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-24 md:w-28 aspect-square rounded-[20px] overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${activeImg === i ? "border-zinc-800 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="sticky top-32 space-y-8 md:space-y-10">

                {/* Product Info Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <HeartRating rating={product.averageRating || 0} size={16} />
                    <span className="text-sm text-gray-400 font-medium">({product.reviewCount || 0} {t("product_reviews")})</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-[1.1]">
                    {product.title}
                  </h1>

                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl md:text-4xl font-bold text-zinc-900">
                      {product.price} EGP
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("product_old_price")}</span>
                        <span className="text-lg md:text-xl text-gray-400 line-through decoration-1">
                          {product.originalPrice} EGP
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Section */}
                <div className="space-y-8 p-1">
                  {/* Colors */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                      {t("product_choose_color")} <span className="text-zinc-900 ml-1">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => {
                        const variantHasStock = variants.some(v => v.color === color && (v.stock ?? 0) > 0);
                        return (
                          <button
                            key={color}
                            disabled={!variantHasStock}
                            onClick={() => {
                              setSelectedColor(color);
                              setSelectedSize("");
                            }}
                            className={`min-w-[60px] h-11 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${selectedColor === color
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200"
                              : "border-zinc-100 text-zinc-600 hover:border-zinc-300 active:scale-95"
                              } ${!variantHasStock ? "opacity-30 cursor-not-allowed border-dashed" : ""}`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes */}
                  {selectedColor && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                          {t("product_choose_size")}
                        </span>
                        {selectedSize && (
                          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
                            {t("product_size_fit")} {variants.find(v => v.color === selectedColor && v.size === selectedSize)?.fit || "N/A"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {sizes.map((size) => {
                          const variant = variants.find((v) => v.color === selectedColor && v.size === size);
                          const isAvailable = variant && (variant.stock ?? 0) > 0;
                          return (
                            <button
                              key={size}
                              disabled={!isAvailable}
                              onClick={() => setSelectedSize(size)}
                              className={`min-w-[70px] h-12 px-4 rounded-xl border-2 text-sm font-bold transition-all relative cursor-pointer ${selectedSize === size
                                ? "bg-[#DE9DE5] border-[#DE9DE5] text-white shadow-lg shadow-pink-100 scale-105"
                                : "border-zinc-100 text-zinc-600 hover:border-[#DE9DE5]/40 active:scale-95"
                                } ${!isAvailable ? "opacity-30 cursor-not-allowed border-dashed" : ""}`}
                            >
                              {size}
                              {selectedSize === size && (
                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-pink-100">
                                  <Check className="w-2.5 h-2.5 text-pink-400" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info Text */}
                  <div className="space-y-4 pt-4">
                    {selectedVariant?.stock !== undefined && selectedVariant.stock <= 5 && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                          {t("product_only_left", { n: selectedVariant.stock })}
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] md:text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-[0.1em]">
                      {t("product_shipping_info")}
                    </p>
                  </div>

                  {/* CTA Section */}
                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex gap-4 h-16">
                      <button
                        disabled={isOutOfStock}
                        onClick={handleAdd}
                        className={`flex-1 flex items-center justify-center gap-3 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-xl cursor-pointer ${!selectedVariant
                          ? "bg-zinc-100 text-zinc-400 shadow-none border border-zinc-200"
                          : isOutOfStock
                            ? "bg-gray-100 text-gray-400 shadow-none"
                            : "bg-zinc-900 text-white hover:bg-black shadow-zinc-200"
                          }`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {!selectedVariant
                          ? t("product_select_options")
                          : isOutOfStock
                            ? t("product_out_of_stock").toUpperCase()
                            : t("product_add_to_bag").toUpperCase()}
                      </button>

                      <button
                        onClick={() => {
                          if (!user) {
                            const currentPath = window.location.pathname;
                            window.location.href = `/login-required?redirect=${encodeURIComponent(currentPath)}`;
                            return;
                          }
                          toggleFavorite(product.id);
                        }}
                        className={`w-16 flex items-center justify-center rounded-2xl border-2 transition-all active:scale-95 cursor-pointer ${isFavorited
                          ? "bg-pink-50 border-pink-100 text-pink-500"
                          : "border-zinc-100 text-zinc-400 hover:border-zinc-300"
                          } `}
                      >
                        <Heart className={`w-6 h-6 ${isFavorited ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Share button */}
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 py-3 text-xs font-bold text-gray-400 hover:text-zinc-900 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">{t("product_link_copied")}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>{t("product_share")}</span>
                        </>
                      )}
                    </button>

                    {currentShareCount > 0 && (
                      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {currentShareCount} {currentShareCount === 1 ? t("product_person_shared") : t("product_people_shared")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-zinc-100" />

                {/* Details Toggles */}
                <div className="space-y-4">
                  <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">{t("product_description")}</span>
                      <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90 ${isRTL ? "rotate-180" : ""}`} />
                    </summary>
                    <div className="pt-4 text-sm text-zinc-500 leading-relaxed prose-sm prose font-medium">
                      {product.description || t("product_no_description")}
                    </div>
                  </details>

                  <div className="h-px w-full bg-zinc-50" />

                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">{t("product_promises")}</span>
                      <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform group-open:rotate-90 ${isRTL ? "rotate-180" : ""}`} />
                    </summary>
                    <div className="pt-4 p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                      <p className="text-xs text-zinc-600 leading-relaxed flex gap-3 text-medium">
                        <span className="text-xl">✨</span>
                        {t("product_promise_text")}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewSection productId={product.id} averageRating={product.averageRating} reviewCount={product.reviewCount} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 md:mt-32 space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">{t("product_also_miss")}</h2>
                <Link href="/products" className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:gap-3 transition-all">
                  {t("hero_shop_all")} <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </Link>
              </div>
              <ProductSlider products={relatedProducts} />
            </div>
          )}

          {/* Banner */}
          <div className="mt-20 md:mt-32 relative overflow-hidden rounded-[40px] px-8 py-16 md:px-16 md:py-24 text-center bg-gradient-to-br from-zinc-900 via-[#2a1f2f] to-[#3a2235]">

            {/* Soft Pink Glow */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,182,193,0.35),_transparent_60%)]" />

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">

              <h2 className="text-3xl md:text-5xl font-light text-white leading-tight tracking-wide">
                {t("product_tagline")}
              </h2>

              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-white/70 text-white px-8 py-3.5 md:px-10 md:py-4 rounded-full font-medium hover:bg-white hover:text-black transition-all duration-300"
              >
                {t("about_start_shopping")}
              </Link>

            </div>
          </div>
        </div>
      </main >
      <Footer />
    </div >
  );
}
