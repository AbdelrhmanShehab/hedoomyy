"use client";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export function CartSidebar() {
  const { items, subtotal } = useCart();
  const router = useRouter();

  return (
    <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6">
      <h3>Cart</h3>

      {items.map(item => (
        <div key={item.id} className="flex justify-between">
          <span>{item.title}</span>
          <span>EGP {item.price * item.qty}</span>
        </div>
      ))}

      <div className="mt-4 font-medium">
        Total: EGP {subtotal}
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="mt-6 w-full bg-black text-white py-3 rounded"
      >
        Checkout
      </button>
    </aside>
  );
}
