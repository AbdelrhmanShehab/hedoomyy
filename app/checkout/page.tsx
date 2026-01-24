"use client";
import ContactForm from "../../components/checkout/ContactForm";
import DeliveryForm from "../../components/checkout/DeliveryForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import SubmitOrder from "../../components/checkout/SubmitOrder";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/context/CheckoutContext";
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { setOrder } = useCheckout();
  const router = useRouter();

  const submitOrder = (formData: any) => {
    setOrder({
      items,
      contact: { email: formData.email },
      delivery: {
        address: formData.address,
        phone: formData.phone,
      },
      payment: formData.payment,
    });

    clearCart();
    router.push("/confirmation");
  };

  return (
    <>
      {/* Your forms */}
      <button onClick={() => submitOrder({})}>
        Place Order
      </button>
    </>
  );
}