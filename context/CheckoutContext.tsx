"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CheckoutOrder } from "../data/checkout";
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { checkoutErrors } from '@/lib/checkoutValidation';

type Quote = { totals: { subtotal: number; shipping: number; discount: number; total: number }; payment: { depositAmount: number } };

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
  quote: Quote | null;
  quoteError: string;
  quoteLoading: boolean;
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
  const [quoted, setQuoted] = useState<{ key: string; data: Quote } | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const quoteKey = JSON.stringify(order);
  const quote = quoted?.key === quoteKey ? quoted.data : null;
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setQuoteError('');
    if (Object.keys(checkoutErrors(order)).length) { setQuoteLoading(false); return; }
    const load = async () => {
      setQuoteLoading(true);
      try {
        const response = await authenticatedFetch('/api/checkout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: quoteKey, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not validate checkout.');
        if (active) { setQuoted({ key: quoteKey, data }); setShippingFee(data.totals.shipping); setQuoteError(''); }
      } catch (error: unknown) { if (active) { setQuoted(null); setQuoteError(error instanceof Error ? error.message : 'Could not validate checkout.'); } }
      finally { if (active) setQuoteLoading(false); }
    };
    const timer = setTimeout(load, 300);
    const refresh = setInterval(load, 30000);
    return () => { active = false; controller.abort(); clearTimeout(timer); clearInterval(refresh); };
  // quoteKey includes every checkout field, including cart and promo changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey]);

  // 🔥 SAVE TO LOCAL STORAGE ON CHANGE
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  return (
    <CheckoutContext.Provider
      value={{ order, setOrder, errors, setErrors, shippingFee, setShippingFee, quote, quoteError, quoteLoading }}
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
