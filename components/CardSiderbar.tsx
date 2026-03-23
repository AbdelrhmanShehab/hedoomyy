"use client";

import { X, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQty } = useCart();
  const { t } = useLanguage();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px] transition-all cursor-pointer"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-zinc-800" />
            <h2 className="text-xl font-bold text-zinc-800">{t("cart_title")}</h2>
            <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors group cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-400 group-hover:text-zinc-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-10 h-10 text-zinc-200" />
              </div>
              <p className="text-zinc-500 font-medium">{t("cart_empty")}</p>
              <button
                onClick={closeCart}
                className="text-pink-400 font-bold hover:underline cursor-pointer"
              >
                {t("about_start_shopping")}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-5 group">
                  <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-100 rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-zinc-800 text-sm md:text-base truncate">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        aria-label={t("cart_remove")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 font-medium uppercase tracking-wider">
                      {item.color} / {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center bg-zinc-50 rounded-full p-1 border border-zinc-100">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, -1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-white rounded-full transition-all disabled:opacity-30 cursor-pointer"
                          disabled={item.qty <= 1}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-zinc-700">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-white rounded-full transition-all disabled:opacity-30 cursor-pointer"
                          disabled={item.stock !== undefined && item.qty >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-zinc-400 font-medium">
                          {item.price} EGP {t("cart_each")}
                        </p>
                        <p className="font-bold text-zinc-900">
                          {item.price * item.qty} EGP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">{t("cart_total")}</span>
              <span className="text-2xl font-bold text-zinc-900">{subtotal} EGP</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-[#DE9DE5] text-white py-4 rounded-2xl font-bold text-center block hover:bg-[#cf8ed5] transition-all transform active:scale-[0.98] shadow-lg shadow-pink-100 cursor-pointer"
            >
              {t("cart_checkout")}
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-zinc-400 text-sm font-medium hover:text-zinc-800 transition-colors cursor-pointer"
            >
              ← {t("cart_close")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
