"use client";

import { useCheckout } from "../../context/CheckoutContext";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function OrderSummary() {
  const { order, shippingFee } = useCheckout();
  const { t } = useLanguage();

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shipping = shippingFee;
  const total = subtotal + shipping;

  if (order.items.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        {t("checkout_order_summary")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {order.items.map((item, i) => (
        <div key={i} className="flex justify-between gap-4">
          <div className="flex gap-3">
            <Image
              src={item.image || "/1.png"}
              alt={item.title}
              width={60}
              height={80}
              className="rounded-md object-cover"
            />

            <div className="text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-gray-500">
                {item.color} / {item.size}
              </p>
              <p className="text-xs text-gray-500">
                EGP {item.price.toLocaleString()} x {item.qty}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium">
            EGP {(item.price * item.qty).toLocaleString()}
          </p>
        </div>
      ))}

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{t("checkout_subtotal")}</span>
          <span>EGP {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>{t("checkout_shipping")}</span>
          <span>EGP {shipping}</span>
        </div>

        <div className="flex justify-between font-medium pt-2 text-base">
          <span>{t("checkout_total")}</span>
          <span>EGP {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
