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
import { OrderItem } from "../../data/order";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { order, setOrder, setErrors } = useCheckout();
  const router = useRouter();

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
    !!order.delivery.government &&
    !!order.payment &&
    order.items.length > 0;

  const submitOrder = async () => {
    const newErrors: Record<string, string> = {};

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

    const orderItems: OrderItem[] = order.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      qty: item.qty,
      image: item.image,
      variant: `${item.color} / ${item.size}`,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const shipping = 50;
    const total = subtotal + shipping;

    const orderRef = await addDoc(collection(db, "orders"), {
      items: orderItems,
      customer: {
        email: order.contact.email,
        phone: order.delivery.phone,
      },
      delivery: order.delivery,
      payment: {
        method: order.payment,
        paid: false,
      },
      totals: {
        subtotal,
        shipping,
        total,
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
            ${
              isFormValid
                ? "bg-purple-300 hover:bg-purple-400 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
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
