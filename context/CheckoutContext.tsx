"use client";
import { createContext, useContext, useState } from "react";
import { CheckoutOrder } from "../data/checkout";

const initialOrder: CheckoutOrder = {
  items: [
    {
      id: "1",
      title: "NIKE SPECIAL KIT HOODIE",
      price: 750,
      qty: 1,
      image: "/product.jpg",
      variant: "M / Blue Navy",
    },
  ],
  contact: { email: "" },
  delivery: { address: "", phone: "" },
  payment: "cod",
};

const CheckoutContext = createContext<{
  order: CheckoutOrder;
  setOrder: React.Dispatch<React.SetStateAction<CheckoutOrder>>;
} | null>(null);

export function CheckoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [order, setOrder] = useState<CheckoutOrder>(initialOrder);

  return (
    <CheckoutContext.Provider value={{ order, setOrder }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside provider");
  return ctx;
}
