"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { CartItem } from "@/data/cart";
import { trackEvent, syncCartState } from "@/lib/trackEvent";
import { addCartItem } from "@/lib/cart-items";
import { useAuth } from "@/context/AuthContext";

type CartContextType = {
  items: CartItem[]; addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, delta: number) => void;
  clearCart: () => void; subtotal: number; isOpen: boolean; openCart: () => void; closeCart: () => void;
};
const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "hedoomyy_cart";
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const current = useRef<CartItem[]>([]);
  const knownProducts = useRef(new Set<string>());
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const commit = (next: CartItem[]) => { current.current = next; setItems(next); };
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        const valid = (saved as CartItem[]).filter(i => i && typeof i.productId === "string" && Number.isSafeInteger(i.qty) && i.qty > 0).map(i => ({ ...i, variantId: i.variantId || `${i.color}-${i.size}` }));
        valid.forEach(i => knownProducts.current.add(i.productId));
        commit(valid);
      }
    } catch { /* A broken browser cache must not crash shopping. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    const ids = new Set([...knownProducts.current, ...items.map(i => i.productId)]);
    knownProducts.current = new Set(items.map(i => i.productId));
    const info = user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined;
    ids.forEach(id => syncCartState(id, items.filter(i => i.productId === id).reduce((sum, i) => sum + i.qty, 0), info));
  }, [items, ready, user]);
  const addItem = (item: CartItem) => {
    const next = addCartItem(current.current, item);
    if (next === current.current) return;
    commit(next);
    trackEvent(item.productId, "cart", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined);
    setIsOpen(true);
  };
  const removeItem = (productId: string, variantId: string) => commit(current.current.filter(i => i.productId !== productId || i.variantId !== variantId));
  const updateQty = (productId: string, variantId: string, delta: number) => {
    if (!Number.isSafeInteger(delta)) return;
    commit(current.current.map(i => i.productId === productId && i.variantId === variantId ? { ...i, qty: Math.min(Math.max(1, i.qty + delta), i.stock ?? Infinity) } : i).filter(i => i.qty > 0));
  };
  const clearCart = () => { commit([]); setIsOpen(false); };
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, subtotal, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}