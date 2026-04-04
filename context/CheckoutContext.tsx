"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CheckoutOrder } from "../data/checkout";

type Errors = Record<string, string | undefined>;

const STORAGE_KEY = "checkout_order";

const initialOrder: CheckoutOrder = {
  items: [],
  contact: { email: "" },
  delivery: {
    address: "",
    phone: "",
    firstName: "",
    lastName: "",
    city: "",
    apartment: "",
    secondPhone: "",
  },
  payment: "cod",
};

const CheckoutContext = createContext<{
  order: CheckoutOrder;
  setOrder: React.Dispatch<React.SetStateAction<CheckoutOrder>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  shippingFee: number;
  setShippingFee: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<CheckoutOrder>(() => {
    if (typeof window === "undefined") return initialOrder;

    const saved = localStorage.getItem(STORAGE_KEY);

    try {
      return saved ? JSON.parse(saved) : initialOrder;
    } catch (e) {
      console.error("Invalid checkout data, resetting...", e);
      return initialOrder;
    }
  });

  const [errors, setErrors] = useState<Errors>({});
  const [shippingFee, setShippingFee] = useState<number>(0);

  // 🔥 SAVE TO LOCAL STORAGE ON CHANGE
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  return (
    <CheckoutContext.Provider
      value={{ order, setOrder, errors, setErrors, shippingFee, setShippingFee }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }
  return ctx;
}
