"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Order } from "@/data/order";

export default function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", orderId));
      if (snap.exists()) {
        setOrder(snap.data() as Order);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <p className="p-10">Loading order…</p>;
  if (!order) return <p className="p-10">Order not found.</p>;

  const { items, delivery, payment, totals, customer, createdAt } = order;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_420px] gap-20">
      {/* LEFT */}
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-purple-300 flex items-center justify-center text-white text-lg">
            ✓
          </div>
          <h1 className="text-2xl font-light">Order Confirmation</h1>
        </div>

        <p className="text-sm text-gray-500">
          Thank you <strong>{delivery.firstName}</strong> for your order.  
          Please check your email for confirmation.
        </p>

        {/* DETAILS */}
        <div className="space-y-6 text-sm">
          {/* Address */}
          <div>
            <h4 className="font-medium mb-1">Shipping Address</h4>
            <p className="text-gray-600 leading-relaxed">
              {delivery.firstName} {delivery.lastName}
              <br />
              {delivery.address}
              {delivery.apartment && `, Apt ${delivery.apartment}`}
              <br />
              {delivery.city}, {delivery.government}
            </p>
          </div>

          {/* Phone */}
          <div>
            <h4 className="font-medium mb-1">Mobile Phone</h4>
            <p className="text-gray-600">{delivery.phone}</p>
            {delivery.secondPhone && (
              <p className="text-gray-400">
                Second: {delivery.secondPhone}
              </p>
            )}
          </div>

          {/* Pickup */}
          <div>
            <h4 className="font-medium mb-1">Pick-up Time</h4>
            <p className="text-gray-500">
              From 1 to 5 working days  
              <br />
              <span className="text-xs">
                (excluding Friday & Saturday)
              </span>
            </p>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-medium mb-1">Payment Method</h4>
            <p className="text-gray-600">
              {payment.method === "cod"
                ? "Cash on Delivery (COD)"
                : "Online Payment"}
            </p>
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400">
            Order ID: {orderId}
          </div>
        </div>
      </div>

      {/* RIGHT – ORDER SUMMARY */}
      <div className="border rounded-3xl p-8 space-y-8">
        <h3 className="tracking-[0.3em] text-purple-300 text-sm uppercase">
          Order Summary
        </h3>

        {/* Items */}
        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="relative w-20 h-28 rounded-xl overflow-hidden">
                <span className="absolute bg-gray-200 text-xs w-6 h-6 flex items-center justify-center rounded-full z-99">
                  {item.qty}
                </span>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 text-sm">
                <p className="font-medium">{item.title}</p>
                {item.variant && (
                  <p className="text-gray-400">{item.variant}</p>
                )}
              </div>

              <p className="text-sm">
                EGP {item.price * item.qty}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-6 text-sm space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>EGP {totals.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>EGP {totals.shipping}</span>
          </div>
          <div className="flex justify-between font-medium text-base pt-3">
            <span>Total</span>
            <span>EGP {totals.total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
