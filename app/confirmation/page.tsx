"use client";

import { useCheckout } from "../../context/CheckoutContext";
import Image from "next/image";

export default function ConfirmationPage() {
  const { order } = useCheckout();

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = 50;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-[1fr_420px] gap-16">
      {/* LEFT */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center text-white">
            ✓
          </div>
          <h1 className="text-xl font-medium">Order Confirmation</h1>
        </div>

        <p className="text-sm text-gray-600">
          Thank you for your order. Please check your email for confirmation.
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium">Shipping Address</h4>
            <p>{order.delivery.address}</p>
          </div>

          <div>
            <h4 className="font-medium">Mobile Phone</h4>
            <p>{order.delivery.phone}</p>
          </div>

          <div>
            <h4 className="font-medium">Payment Method</h4>
            <p>
              {order.payment === "cod"
                ? "Cash on delivery (COD)"
                : "Online payment"}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="border rounded-2xl p-6 space-y-6">
        <h3 className="tracking-widest text-purple-300 text-sm">
          ORDER SUMMARY
        </h3>

        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4">
            <Image
              src={item.image}
              alt={item.title}
              width={70}
              height={90}
              className="rounded-xl"
            />
            <div className="flex-1 text-sm">
              <p>{item.title}</p>
              <p className="text-gray-500">
                Qty {item.qty}
              </p>
            </div>
            <p className="text-sm">
              EGP {item.price * item.qty}
            </p>
          </div>
        ))}

        <div className="border-t pt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>EGP {subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>EGP {shipping}</span>
          </div>
          <div className="flex justify-between font-medium pt-2">
            <span>Total</span>
            <span>EGP {subtotal + shipping}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
