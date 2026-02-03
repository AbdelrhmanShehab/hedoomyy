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
  const { items, clearCart } = useCart(); // ✅ FIX
  const { order, setOrder } = useCheckout();
  const router = useRouter();

  useEffect(() => {
    setOrder(prev => ({
      ...prev,
      items,
    }));
  }, [items, setOrder]);

const submitOrder = async () => {
  if (
    !order.contact.email ||
    !order.delivery.address ||
    !order.delivery.phone
  ) {
    alert("Please complete all required fields");
    return; 
  }

  const orderPayload = {
    customer: {
      email: order.contact.email,
      phone: order.delivery.phone,
    },

    delivery: {
      address: order.delivery.address,
      city: order.delivery.city ?? "",
      government: order.delivery.government ?? "",
      apartment: order.delivery.apartment ?? "",
    },

    payment: {
      method: order.payment,
      paid: false,
    },

    items: order.items.map(item => ({
      productId: item.id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      image: item.image,
      variant: item.variant ?? "",
    })),

    totals: {
      subtotal: order.items.reduce(
        (sum, i) => sum + i.price * i.qty,
        0
      ),
      shipping: 50,
      total:
        order.items.reduce((sum, i) => sum + i.price * i.qty, 0) + 50,
    },

    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, "orders"), orderPayload);

  clearCart();
  router.push("/confirmation");
};


  return (
    <section className="max-w-7xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_420px] gap-16">
      {/* LEFT */}
      <div className="space-y-10">
        <ContactForm />
        <DeliveryForm />
        <PaymentMethod />

        <button
          onClick={submitOrder}
          className="w-full bg-purple-300 hover:bg-purple-400 transition text-white rounded-full py-4 text-sm font-medium"
        >
          Save and Proceed
        </button>
      </div>

      {/* RIGHT */}
      <OrderSummary />
    </section>
  );
}
