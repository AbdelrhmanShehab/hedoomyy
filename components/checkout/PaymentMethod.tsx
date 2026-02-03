"use client";
import { useCheckout } from "../../context/CheckoutContext";

export default function PaymentMethod() {
  const { order, setOrder } = useCheckout();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">Payment</h2>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={order.payment === "cod"}
          onChange={() =>
            setOrder({ ...order, payment: "cod" })
          }
        />
        Cash on Delivery
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={order.payment === "online"}
          onChange={() =>
            setOrder({ ...order, payment: "online" })
          }
        />
        Pay Online
      </label>
    </div>
  );
}
