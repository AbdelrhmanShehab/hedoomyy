"use client";
import { useCheckout } from "../../context/CheckoutContext";

export default function ContactForm() {
  const { order, setOrder, errors } = useCheckout();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Contact</h2>

      <input
        type="email"
        value={order.contact.email}
        onChange={(e) =>
          setOrder({
            ...order,
            contact: { email: e.target.value },
          })
        }
        placeholder="Email address"
        className={`w-full border rounded-xl px-4 py-3 text-sm ${
          errors.email ? "border-red-500" : ""
        }`}
      />

      {errors.email && (
        <p className="text-red-500 text-xs">{errors.email}</p>
      )}
    </div>
  );
}
