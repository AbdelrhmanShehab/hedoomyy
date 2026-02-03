"use client";
import { useCheckout } from "../../context/CheckoutContext";

export default function DeliveryForm() {
  const { order, setOrder } = useCheckout();

  return (
    <div className="space-y-6">
      <h2 className="text-base font-medium">Delivery</h2>

      <div className="grid grid-cols-2 gap-4">
        <select className="border rounded-md px-4 py-3 text-sm">
          <option>Egypt</option>
        </select>

        <input
          placeholder="Where you want to receive your order"
          value={order.delivery.address}
          onChange={(e) =>
            setOrder({
              ...order,
              delivery: { ...order.delivery, address: e.target.value },
            })
          }
          className="border rounded-md px-4 py-3 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input placeholder="First Name" className="border rounded-md px-4 py-3 text-sm" />
        <input placeholder="Last Name" className="border rounded-md px-4 py-3 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Phone Number"
          value={order.delivery.phone}
          onChange={(e) =>
            setOrder({
              ...order,
              delivery: { ...order.delivery, phone: e.target.value },
            })
          }
          className="border rounded-md px-4 py-3 text-sm"
        />
        <input placeholder="Second Phone Number" className="border rounded-md px-4 py-3 text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <input placeholder="City" className="border rounded-md px-4 py-3 text-sm" />
        <input placeholder="Government" className="border rounded-md px-4 py-3 text-sm" />
        <input placeholder="Apartment" className="border rounded-md px-4 py-3 text-sm" />
      </div>
    </div>
  );
}
