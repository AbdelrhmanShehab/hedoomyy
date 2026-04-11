"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Order } from "@/data/order";
import { useLanguage } from "@/context/LanguageContext";

export default function ConfirmationClient() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t, isRTL } = useLanguage();

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

  if (loading) return <p className="p-10">{t("confirmation_loading")}</p>;
  if (!order) return <p className="p-10">{t("confirmation_not_found")}</p>;

  const { items, delivery, payment, totals, createdAt } = order;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[1fr_420px] gap-20">
      {/* LEFT */}
      <div className="space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-purple-300 flex items-center justify-center text-white text-lg">
            ✓
          </div>
          <h1 className="text-2xl font-light">{t("confirmation_title")}</h1>
        </div>
        <p className="text-sm text-gray-500">
          {t("confirmation_thank_you")} <strong>{delivery.firstName}</strong> {t("confirmation_for_order")}.
          {t("confirmation_check_email")}
        </p>

        {/* ORDER OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("orders_order_id")}</p>
            <p className="text-sm font-medium text-zinc-900">#{orderId.slice(-6).toUpperCase()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("orders_date")}</p>
            <p className="text-sm font-medium text-zinc-900">
              {createdAt
                ? new Date(createdAt.seconds * 1000).toLocaleDateString(isRTL ? "ar-EG" : "en-GB", {
                  day: "numeric",
                  month: "short",
                })
                : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("confirmation_email")}</p>
            <p className="text-sm font-medium text-zinc-900 truncate" title={order.customer.email}>
              {order.customer.email}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t("orders_details")}</p>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-tighter">
              {t(`status_${order.status || "pending"}` as any)}
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            {/* Address */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("checkout_address")}</h4>
              <p className="text-sm text-zinc-700 leading-relaxed font-medium">
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
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("checkout_phone")}</h4>
              <p className="text-sm text-zinc-700 font-medium">{delivery.phone}</p>
              {delivery.secondPhone && (
                <p className="text-xs text-gray-400 mt-1">
                  {t("checkout_second_phone")}: {delivery.secondPhone}
                </p>
              )}
            </div>

            {/* Pickup */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("confirmation_pickup_time")}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {t("confirmation_pickup_desc")}
                <br />
                <span className="text-[10px] text-gray-400">
                  ({t("confirmation_excluding_days")})
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Payment */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("checkout_payment")}</h4>
              <p className="text-sm text-zinc-700 font-medium capitalize">
                {payment.method === "cod"
                  ? t("checkout_cod")
                  : t("checkout_online")}
              </p>

              {/* Deposit / payment details */}
              {payment.depositType && (
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                      {payment.depositType === "deposit"
                        ? t("confirmation_deposit_paid")
                        : t("confirmation_full_paid")}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter ${payment.paid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {payment.paid ? `✓ ${t("confirmation_confirmed")}` : `⏳ ${t("confirmation_awaiting")}`}
                    </div>
                  </div>

                  {payment.depositAmount && (
                    <div className="flex justify-between text-xs pt-2 border-t border-purple-100/50">
                      <p className="text-gray-500">{t("confirmation_amount_paid")}</p>
                      <p className="font-bold text-zinc-900">EGP {payment.depositAmount.toLocaleString()}</p>
                    </div>
                  )}

                  {payment.depositType === "deposit" && payment.depositAmount && (
                    <div className="flex justify-between text-xs">
                      <p className="text-gray-500">{t("confirmation_remaining")}</p>
                      <p className="font-bold text-pink-500">
                        EGP {( (totals?.total ?? 0) - payment.depositAmount ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment screenshot */}
              {payment.paymentPhotoUrl && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{t("confirmation_screenshot")}</p>
                  <a
                    href={payment.paymentPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full aspect-video rounded-2xl overflow-hidden border border-purple-100 group shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Image
                      src={payment.paymentPhotoUrl}
                      alt="Payment receipt"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-zinc-900 uppercase">
                        {t("confirmation_view_full")}
                      </span>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Details Footer */}
        <div className="pt-10 border-t border-gray-100 flex flex-wrap gap-x-12 gap-y-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          <div>
            <span className="text-gray-300">{t("orders_order_id")}:</span> {orderId}
          </div>
          <div>
            <span className="text-gray-300">{t("orders_date")}:</span>{" "}
            {createdAt
              ? new Date(createdAt.seconds * 1000).toLocaleString(isRTL ? "ar-EG" : "en-GB")
              : "N/A"}
          </div>
        </div>
      </div>

      {/* RIGHT – ORDER SUMMARY */}
      <div className="border rounded-3xl p-8 space-y-8">
        <h3 className="tracking-[0.3em] text-purple-300 text-sm uppercase">
          {t("checkout_order_summary")}
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
                <div className="flex flex-col gap-0.5 mt-1">
                  {item.variant && (
                    <p className="text-gray-400 text-xs">{item.variant}</p>
                  )}
                  <p className="text-gray-400 text-[11px]">
                    {item.qty} x EGP {item.price}
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium">
                EGP {item.price * item.qty}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-6 text-sm space-y-3">
          <div className="flex justify-between">
            <span>{t("checkout_subtotal")}</span>
            <span>EGP {totals.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout_shipping")}</span>
            <span>EGP {totals.shipping}</span>
          </div>
          <div className="flex justify-between font-medium text-base pt-3">
            <span>{t("checkout_total")}</span>
            <span>EGP {totals.total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
