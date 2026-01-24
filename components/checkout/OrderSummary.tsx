"use client";
import { useCheckout } from "../../context/CheckoutContext";
import Image from "next/image";

export default function OrderSummary() {
    const { order } = useCheckout();

    const subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    return (
        <div className="space-y-6">
            {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                    <Image
                        src={item.image}
                        alt={item.title}
                        width={70}
                        height={90}
                        className="rounded-xl"
                    />

                    <div className="flex-1 text-sm">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-gray-500">
                            {item.variant}
                        </p>
                    </div>

                    <p className="text-sm">EGP {item.price}</p>
                </div>
            ))}

            <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>EGP {subtotal}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>EGP 50</span>
                </div>
                <div className="flex justify-between font-medium pt-2">
                    <span>Total</span>
                    <span>EGP {subtotal + 50}</span>
                </div>
            </div>
        </div>
    );
}
