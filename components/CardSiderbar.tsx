"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";
import { Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function CartSidebar() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
  } = useCart();

  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={closeCart}
      />

      <aside className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl p-6 z-50 overflow-y-auto">
        <button
          onClick={closeCart}
          className="mb-4 text-sm text-gray-500"
        >
          ✕ Close
        </button>

        <h3 className="text-lg font-medium mb-6">
          Your Cart
        </h3>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400">
            Your cart is empty.
          </p>
        ) : (
          <>
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={60}
                    height={80}
                    className="rounded-md object-cover"
                  />

                  <div className="flex-1 text-sm">
                    <p className="font-medium">
                      {item.title}
                    </p>
                    <p className="text-gray-500">
                      {item.color} / {item.size}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.productId, item.variantId, -1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={item.qty <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.variantId, 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={item.stock !== undefined && item.qty >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(
                          item.productId,
                          item.variantId
                        )
                      }
                      className="text-red-500 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium">
                      EGP {item.price * item.qty}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-[11px] font-bold text-gray-400">
                        EGP {item.price} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-medium">
                  EGP {subtotal}
                </span>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="mt-4 w-full bg-black text-white py-3 rounded-full"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
