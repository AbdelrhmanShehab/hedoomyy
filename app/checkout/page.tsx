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

export default function CheckoutPage() {
  const { items } = useCart();
  const { order, setOrder, setErrors } = useCheckout();
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);

      // If we have userData from global AuthContext, prefer it
      if (userData) {
        setOrder(prev => ({
          ...prev,
          contact: {
            email: prev.contact.email || userData.email || user.email || ""
          },
          delivery: {
            address: prev.delivery.address || userData.address || "",
            phone: prev.delivery.phone || userData.phone || "",
            firstName: prev.delivery.firstName || userData.firstName || "",
            lastName: prev.delivery.lastName || userData.lastName || "",
            city: prev.delivery.city || userData.city || "",
            apartment: prev.delivery.apartment || userData.apartment || "",
            secondPhone: prev.delivery.secondPhone || userData.secondPhone || "",
          }
        }));
      }
    }
  }, [user, userData, setOrder]);

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

    if (!order.contact.email) newErrors.email = "Email is required";
    if (!order.delivery.address) newErrors.address = "Address is required";
    if (!order.delivery.phone) newErrors.phone = "Phone number is required";
    if (!order.delivery.firstName) newErrors.firstName = "First name required";
    if (!order.delivery.lastName) newErrors.lastName = "Last name required";
    if (!order.delivery.city) newErrors.city = "City is required";
    if (!order.delivery.apartment) newErrors.apartment = "Apartment is required";
    if (!order.payment) newErrors.payment = "Select payment method";

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

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 text-3xl">
          🔒
        </div>
        <h1 className="text-2xl font-light mb-4">Login Required</h1>
        <p className="text-gray-500 max-w-md mb-8">
          To provide you with a secure shopping experience and auto-fill your details, 
          please login to your account before proceeding to checkout.
        </p>
        <button
          onClick={() => router.push("/account")}
          className="bg-gray-900 text-white px-10 py-4 rounded-full font-medium hover:bg-purple-500 transition-all shadow-xl shadow-purple-100"
        >
          Login or Create Account
        </button>
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
          className={`w-full rounded-full py-4 font-medium transition
            ${isFormValid
              ? "bg-purple-400 hover:bg-purple-300 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          Save and Proceed →
        </button>

        {!isFormValid && (
          <p className="text-xs text-gray-400 text-center">
            Please complete all required fields
          </p>
        )}
      </div>

      <OrderSummary />
    </section>
  );
}
