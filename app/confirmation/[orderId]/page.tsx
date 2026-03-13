import type { Metadata } from "next";
import ConfirmationClient from "./ConfirmationClient";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your order has been placed successfully at Hedoomyy. View your order summary and delivery details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationPage() {
  return <ConfirmationClient />;
}
