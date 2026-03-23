"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactForm() {
  const { order, setOrder, errors, setErrors } = useCheckout();
  const { t } = useLanguage();

  const handleEmailChange = (value: string) => {
    setOrder(prev => ({
      ...prev,
      contact: { email: value.trim() },
    }));

    // Clear error while typing
    setErrors(prev => ({ ...prev, email: undefined }));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: t("checkout_contact_invalid_email"),
      }));
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{t("checkout_contact")}</h2>

      <input
        type="email"
        value={order.contact.email}
        onChange={(e) => handleEmailChange(e.target.value)}
        onBlur={() => validateEmail(order.contact.email)}
        placeholder={t("checkout_contact_placeholder")}
        className={`w-full border rounded-xl px-4 py-3 text-sm ${
          errors.email ? "border-red-500" : "border-gray-300"
        }`}
      />

      {errors.email && (
        <p className="text-red-500 text-xs">{errors.email}</p>
      )}
    </div>
  );
}
