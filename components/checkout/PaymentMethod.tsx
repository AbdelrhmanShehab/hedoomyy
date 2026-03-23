"use client";
import { useCheckout } from "../../context/CheckoutContext";
import { useLanguage } from "@/context/LanguageContext";

export default function PaymentMethod() {
  const { order, setOrder } = useCheckout();
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{t("checkout_payment")}</h2>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={order.payment === "cod"}
          onChange={() =>
            setOrder({ ...order, payment: "cod" })
          }
        />
        {t("checkout_cod")}
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={order.payment === "online"}
          onChange={() =>
            setOrder({ ...order, payment: "online" })
          }
        />
        {t("checkout_online")}
      </label>
    </div>
  );
}
