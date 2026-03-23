"use client";

import ContactForm from "../../components/checkout/ContactForm";
import DeliveryForm from "../../components/checkout/DeliveryForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import { useCheckout } from "../../context/CheckoutContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutClient() {
  const { items } = useCart();
  const { order, setOrder, setErrors } = useCheckout();
  const { user, userData, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/checkout&message=Please login to your account to complete your purchase.");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      items,
    }));
  }, [items, setOrder]);
  const isFormValid =
    !!order.contact.email &&
    !!order.delivery.address &&
    !!order.delivery.phone &&
    !!order.delivery.firstName &&
    !!order.delivery.lastName &&
    !!order.delivery.city &&
    !!order.delivery.apartment &&
    !!order.payment &&
    order.items.length > 0;

  const proceedToPayment = () => {
    const newErrors: Record<string, string> = {};

    if (!order.contact.email) newErrors.email = t("error_email_required");
    if (!order.delivery.address) newErrors.address = t("error_address_required");
    if (!order.delivery.phone) newErrors.phone = t("error_phone_required");
    if (!order.delivery.firstName) newErrors.firstName = t("error_first_name_required");
    if (!order.delivery.lastName) newErrors.lastName = t("error_last_name_required");
    if (!order.delivery.city) newErrors.city = t("error_city_required");
    if (!order.delivery.apartment) newErrors.apartment = t("error_apartment_required");
    if (!order.payment) newErrors.payment = t("error_payment_required");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Route to upload page — order is submitted there after attaching photo
    router.push("/checkout/payment-upload");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_420px] gap-16">
      <div className="space-y-10">
        <ContactForm />
        <DeliveryForm />
        <PaymentMethod />

        <button
          onClick={proceedToPayment}
          disabled={!isFormValid}
          className={`w-full rounded-full py-4 font-medium transition cursor-pointer
            ${isFormValid
              ? "bg-purple-400 hover:bg-purple-300 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {t("checkout_save_proceed")}
        </button>

        {!isFormValid && (
          <p className="text-xs text-gray-400 text-center">
            {t("checkout_complete_fields")}
          </p>
        )}
      </div>

      <OrderSummary />
    </section>
  );
}
