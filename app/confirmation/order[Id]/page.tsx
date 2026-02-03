"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Order } from "../../../data/order";

type Props = {
  params: {
    orderId: string;
  };
};

export default function ConfirmationPage({ params }: Props) {
  const { orderId } = params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", orderId));

        if (snap.exists()) {
          setOrder(snap.data() as Order);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <p className="p-10">Loading order…</p>;
  if (!order) return <p className="p-10">Order not found.</p>;

  const { items, delivery, payment, totals } = order;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-[1fr_420px] gap-16">
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
            <p>
              {delivery.firstName} {delivery.lastName}
              <br />
              {delivery.address}
              {delivery.apartment && `, Apt ${delivery.apartment}`}
              <br />
              {delivery.city}, {delivery.government}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Mobile Phone</h4>
            <p>{delivery.phone}</p>
            {delivery.secondPhone && (
              <p className="text-gray-500">
                Second: {delivery.secondPhone}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-medium">Payment Method</h4>
            <p>
              {payment.method === "cod"
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

        {items.map((item, i) => (
          <div key={i} className="flex gap-4">
            <Image
              src={item.image}
              alt={item.title}
              width={70}
              height={90}
              className="rounded-xl"
              unoptimized
            />

            <div className="flex-1 text-sm">
              <p className="font-medium">{item.title}</p>
              {item.variant && (
                <p className="text-gray-500">{item.variant}</p>
              )}
              <p className="text-gray-500">Qty {item.qty}</p>
            </div>

            <p className="text-sm">
              EGP {item.price * item.qty}
            </p>
          </div>
        ))}

        <div className="border-t pt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>EGP {totals.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>EGP {totals.shipping}</span>
          </div>
          <div className="flex justify-between font-medium pt-2">
            <span>Total</span>
            <span>EGP {totals.total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
