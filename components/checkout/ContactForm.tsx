"use client";
import { useCheckout } from "@/context/CheckoutContext";

export default function ContactForm() {
  const { order, setOrder } = useCheckout();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Contact</h2>

      <input
        type="email"
        placeholder="Email Address"
        value={order.contact.email}
        onChange={(e) =>
          setOrder({
            ...order,
            contact: { email: e.target.value },
          })
        }
        className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-300"
      />
    </div>
  );
}
