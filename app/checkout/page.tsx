"use client";

import ContactForm from "../../components/checkout/ContactForm";
import DeliveryForm from "../../components/checkout/DeliveryForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useCheckout } from "../../context/CheckoutContext";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { order, setOrder, setErrors } = useCheckout();
  const router = useRouter();

  // Sync cart → checkout
  useEffect(() => {
    setOrder(prev => ({ ...prev, items }));
  }, [items, setOrder]);

  // ✅ FORM VALIDATION (MUST BE HERE)
  const isFormValid =
    !!order.contact.email &&
    !!order.delivery.address &&
    !!order.delivery.phone &&
    !!order.delivery.firstName &&
    !!order.delivery.lastName &&
    !!order.delivery.city &&
    !!order.delivery.government &&
    !!order.payment &&
    order.items.length > 0;

  const submitOrder = async () => {
    const newErrors: any = {};

    if (!order.contact.email) newErrors.email = "Email is required";
    if (!order.delivery.address) newErrors.address = "Address is required";
    if (!order.delivery.phone) newErrors.phone = "Phone number is required";
    if (!order.delivery.firstName) newErrors.firstName = "First name required";
    if (!order.delivery.lastName) newErrors.lastName = "Last name required";
    if (!order.delivery.city) newErrors.city = "City is required";
    if (!order.delivery.government) newErrors.government = "Government is required";
    if (!order.payment) newErrors.payment = "Select payment method";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const orderRef = await addDoc(collection(db, "orders"), {
      customer: {
        email: order.contact.email,
        phone: order.delivery.phone,
      },
      delivery: order.delivery,
      payment: {
        method: order.payment,
        paid: false,
      },
      items: order.items,
      totals: {
        subtotal: order.items.reduce((s, i) => s + i.price * i.qty, 0),
        shipping: 50,
        total:
          order.items.reduce((s, i) => s + i.price * i.qty, 0) + 50,
      },
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    clearCart();
    router.push(`/confirmation/${orderRef.id}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_420px] gap-16">
      <div className="space-y-10">
        <ContactForm />
        <DeliveryForm />
        <PaymentMethod />

        <button
          onClick={submitOrder}
          disabled={!isFormValid}
          className={`w-full rounded-full py-4 font-medium transition
            ${isFormValid
              ? "bg-purple-300 hover:bg-purple-400 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Save and Proceed
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
