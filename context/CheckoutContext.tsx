"use client";
import { createContext, useContext, useState } from "react";
import { CheckoutOrder } from "../data/checkout";

const initialOrder: CheckoutOrder = {
  items: [],

  contact: {
    email: "",
  },

  delivery: {
    address: "",
    phone: "",
    firstName: "",
    lastName: "",
    city: "",
    government: "",
    apartment: "",
  },

  payment: "cod",
};


const CheckoutContext = createContext<{
  order: CheckoutOrder;
  setOrder: React.Dispatch<React.SetStateAction<CheckoutOrder>>;
} | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState(initialOrder);

  return (
    <CheckoutContext.Provider value={{ order, setOrder }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
}
