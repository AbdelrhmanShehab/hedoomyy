import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order at Hedoomyy. Fill in your details and select a payment method to finish your purchase.",
  alternates: {
    canonical: "https://hedoomyy.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
