"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem } from "@/data/cart";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(
  null
);

const STORAGE_KEY = "hedoomyy_cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  /* LOAD */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CartItem[];
      setItems(parsed.map(item => ({
        ...item,
        variantId: item.variantId || `${item.color}-${item.size}`
      })));
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  /* ADD ITEM (SYNC + FAST) */
  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i =>
          i.productId === item.productId &&
          i.variantId === item.variantId
      );

      if (existing) {
        return prev.map(i => {
          if (
            i.productId === item.productId &&
            i.variantId === item.variantId
          ) {
            const newQty = i.qty + item.qty;
            const cappedQty =
              item.stock !== undefined
                ? Math.min(newQty, item.stock)
                : newQty;
            return { ...i, qty: cappedQty };
          }
          return i;
        });
      }

      const newItemQty =
        item.stock !== undefined
          ? Math.min(item.qty, item.stock)
          : item.qty;

      return [...prev, { ...item, qty: newItemQty }];
    });

    setIsOpen(true);
  };

  const removeItem = (
    productId: string,
    variantId: string
  ) => {
    setItems(prev =>
      prev.filter(
        i =>
          !(
            i.productId === productId &&
            i.variantId === variantId
          )
      )
    );
  };

  const updateQty = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    setItems(prev =>
      prev.map(i => {
        if (i.productId === productId && i.variantId === variantId) {
          const newQty = Math.max(1, i.qty + delta);
          const cappedQty =
            i.stock !== undefined ? Math.min(newQty, i.stock) : newQty;
          return { ...i, qty: cappedQty };
        }
        return i;
      })
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
        updateQty,
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
  if (!ctx)
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  return ctx;
}
