"use client";

import { Product } from "@/data/product";
import { useState, useMemo } from "react";
import Image from "next/image";
import { X, ShoppingBag } from "lucide-react";
import HeartRating from "./HeartRating";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  product: Product;
  onClose: () => void;
};

export default function QuickAddModal({
  product,
  onClose,
}: Props) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const variants = product.variants ?? [];

  /* SAFE COLOR LIST */
  const colors: string[] = useMemo(() => {
    return Array.from(
      new Set(variants.map(v => v.color))
    );
  }, [variants]);

  /* SAFE SIZE LIST */
  const sizes: string[] = useMemo(() => {
    return Array.from(
      new Set(variants.map(v => v.size))
    );
  }, [variants]);

  const [selectedColor, setSelectedColor] =
    useState<string>("");
  const [selectedSize, setSelectedSize] =
    useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const selectedVariant = variants.find(
    v =>
      v.color === selectedColor &&
      v.size === selectedSize
  );

  const isOutOfStock =
    !selectedVariant ||
    (selectedVariant.stock ?? 0) <= 0 ||
    product.status !== "active";

  const handleAdd = () => {
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId:
        selectedVariant.id ||
        `${selectedVariant.color}-${selectedVariant.size}`,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ?? "/1.png",
      color: selectedVariant.color,
      size: selectedVariant.size,
      qty: qty,
      stock: selectedVariant.stock,
    });

    trackEvent(product.id, "cart", user ? {
      email: user.email || undefined,
      name: user.displayName || undefined
    } : undefined);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-1">
              {product.title}
            </h2>

            {product.reviewCount && product.reviewCount > 0 ? (
              <div className="flex items-center gap-2 mb-4">
                <HeartRating rating={product.averageRating || 0} size={12} />
                <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount})</span>
              </div>
            ) : null}
          </div>
          <div className="text-right">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 line-through">{t("card_old")} {product.originalPrice} EGP</span>
                <span className="text-sm font-bold text-red-500">{t("card_new")} {product.price} EGP</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-pink-400">{product.price} EGP</span>
            )}
          </div>
        </div>

        {/* COLORS */}
        <div className="mb-4">
          <p className="text-sm mb-2">{t("modal_color")}</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => {
              const hasStock = variants.some(
                v =>
                  v.color === color &&
                  (v.stock ?? 0) > 0
              );

              return (
                <button
                  key={color}
                  disabled={!hasStock}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize("");
                  }}
                  suppressHydrationWarning
                  className={`px-3 py-2 border rounded text-sm cursor-pointer
                    ${selectedColor === color ? "bg-black text-white" : ""}
                    ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* SIZES */}
        {selectedColor && (
          <div className="mb-4">
            <p className="text-sm mb-2">{t("modal_size")}</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => {
                const variant = variants.find(
                  v =>
                    v.color === selectedColor &&
                    v.size === size
                );

                const hasStock =
                  (variant?.stock ?? 0) > 0;

                return (
                  <button
                    key={size}
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(size)}
                    suppressHydrationWarning
                    className={`px-3 py-2 border rounded text-sm cursor-pointer
                      ${selectedSize === size ? "bg-black text-white" : ""}
                      ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* QUANTITY */}
        {selectedSize && (
          <div className="mb-6">
            <p className="text-sm mb-2">{t("modal_quantity")}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full px-2 py-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  suppressHydrationWarning
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition cursor-pointer"
                >
                  −
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(prev => (selectedVariant?.stock && prev < selectedVariant.stock) ? prev + 1 : prev)}
                  disabled={selectedVariant?.stock !== undefined && qty >= selectedVariant.stock}
                  suppressHydrationWarning
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
              {selectedVariant?.stock !== undefined && selectedVariant.stock <= 10 && (
                <p className="text-xs text-amber-500 font-medium">
                  {t("modal_only_left", { n: selectedVariant.stock })}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          disabled={isOutOfStock}
          onClick={handleAdd}
          suppressHydrationWarning
          className={`w-full py-3 rounded-full cursor-pointer
            ${!selectedVariant
              ? "bg-gray-200 text-gray-400"
              : isOutOfStock
                ? "bg-gray-300 text-gray-500"
                : "bg-black text-white"
            }
          `}
        >
          {!selectedVariant
            ? t("modal_select_options")
            : isOutOfStock
              ? t("product_out_of_stock")
              : t("modal_add_to_cart")}
        </button>

        <button
          onClick={onClose}
          suppressHydrationWarning
          className="mt-3 w-full text-sm text-gray-500 cursor-pointer"
        >
          {t("modal_cancel")}
        </button>
      </div>
    </div>
  );
}
