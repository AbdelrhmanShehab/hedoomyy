"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "../data/cart";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  subtotal: number;

  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "hedoomyy_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* ---------------- ADD ITEM ---------------- */
const addItem = (item: CartItem) => {
  setItems(prev => {
    const existing = prev.find(
      i =>
        i.productId === item.productId &&
        i.variantId === item.variantId
    );

    if (existing) {
      return prev.map(i =>
        i.productId === item.productId &&
        i.variantId === item.variantId
          ? { ...i, qty: i.qty + item.qty }
          : i
      );
    }

    return [...prev, item];
  });

  setIsOpen(true);
};

  const removeItem = (productId: string, variantId: string) => {
    setItems(prev =>
      prev.filter(
        i =>
          !(i.productId === productId &&
            i.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        subtotal,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
