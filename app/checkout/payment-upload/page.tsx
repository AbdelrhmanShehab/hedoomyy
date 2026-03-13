"use client";

import { useCheckout } from "../../../context/CheckoutContext";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PaymentUploadPage() {
    const { order, shippingFee } = useCheckout();
    const { clearCart } = useCart();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/checkout/payment-upload&message=Please login to your account to complete your purchase.");
        }
    }, [loading, user, router]);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );
    const shipping = shippingFee;
    const total = subtotal + shipping;

    // COD  → Tiered deposit
    // Online → full amount
    const isCOD = order.payment === "cod";
    
    const calculateDeposit = (amount: number) => {
        if (amount < 500) return 150;
        if (amount < 1000) return 200;
        if (amount < 2000) return 250;
        if (amount < 4000) return 500;
        return Math.ceil(amount * 0.5);
    };

    const amountDue = isCOD ? calculateDeposit(subtotal) : total;
    const remainingOnDelivery = isCOD ? total - amountDue : 0;

    // Redirect back if cart is empty
    useEffect(() => {
        if (order.items.length === 0) {
            router.push("/checkout");
        }
    }, [order.items.length, router]);

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError("");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith("image/")) handleFile(dropped);
    };

    const handleSubmit = async () => {
        // Photo is mandatory for both COD deposit and online full payment
        if (!file) {
            setError("Please attach your Instapay transaction screenshot to proceed.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            // Upload photo to Firebase Storage
            const storageRef = ref(
                storage,
                `payment-proofs/${Date.now()}_${file.name}`
            );
            const snapshot = await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(snapshot.ref);

            // Build order items
            const orderItems = order.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                price: item.price,
                qty: item.qty,
                image: item.image,
                color: item.color,
                size: item.size,
            }));

            // Submit order
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.uid ?? null,
                    items: orderItems,
                    customer: {
                        email: order.contact.email,
                        phone: order.delivery.phone,
                    },
                    delivery: order.delivery,
                    payment: order.payment,
                    // COD → depositType = "deposit", amount = 10%
                    // Online → depositType = "full", amount = total
                    depositType: isCOD ? "deposit" : "full",
                    depositAmount: amountDue,
                    paymentPhotoUrl: photoUrl,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
                setUploading(false);
                return;
            }

            clearCart();
            router.push(`/confirmation/${data.orderId}`);
        } catch (err: any) {
            setError("Upload failed: " + err.message);
            setUploading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">

                {/* ── Step indicator ── */}
                <div className="flex items-center gap-2 mb-10 text-xs text-gray-400">
                    <span className="text-gray-300">Contact &amp; Delivery</span>
                    <span className="mx-1 text-gray-300">›</span>
                    <span className="font-semibold text-purple-500">
                        {isCOD ? "Deposit Payment" : "Online Payment"}
                    </span>
                    <span className="mx-1 text-gray-300">›</span>
                    <span>Confirmation</span>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 space-y-7">

                    {/* ── Header ── */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-light tracking-tight">
                            {isCOD ? "Pay Your Deposit" : "Complete Payment via Instapay"}
                        </h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {isCOD
                                ? "A mandatory deposit is required to confirm your order based on the products subtotal. Transfer it via Instapay and attach the screenshot below."
                                : "Transfer the full order amount via Instapay and attach your transaction screenshot below."}
                        </p>
                    </div>

                    {/* ── Amount breakdown ── */}
                    <div
                        className={`rounded-2xl p-5 space-y-3 text-sm ${isCOD
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-purple-50 border border-purple-200"
                            }`}
                    >
                        <p
                            className={`font-semibold text-base ${isCOD ? "text-amber-800" : "text-purple-800"
                                }`}
                        >
                            {isCOD ? "Required Deposit" : "Full Payment Amount"}
                        </p>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-gray-600">
                                <span>Order subtotal</span>
                                <span>EGP {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>EGP {shipping}</span>
                            </div>
                            <div
                                className={`flex justify-between font-bold text-base pt-1 border-t ${isCOD
                                    ? "border-amber-200 text-amber-800"
                                    : "border-purple-200 text-purple-800"
                                    }`}
                            >
                                <span>{isCOD ? "Deposit to pay now" : "Amount to transfer"}</span>
                                <span>EGP {amountDue.toLocaleString()}</span>
                            </div>
                            {isCOD && (
                                <p className="text-xs text-amber-600 pt-1">
                                    Remaining{" "}
                                    <strong>EGP {remainingOnDelivery.toLocaleString()}</strong>{" "}
                                    will be collected on delivery.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Instapay account card ── */}
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 space-y-1.5 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-2">
                            Instapay Account or Vodafone Cash
                        </p>
                        <p className="font-semibold text-gray-800 text-base">Hedoomyy Store</p>
                        <p className="text-gray-600">
                            Number:{" "}
                            <span className="font-mono font-bold text-purple-700 text-base">
                                01023202564
                            </span>
                        </p>
                        <p className="text-gray-500 text-xs pt-1">
                            Transfer exactly{" "}
                            <strong className="text-purple-700">
                                EGP {amountDue.toLocaleString()}
                            </strong>{" "}
                            and save the screenshot.
                        </p>
                    </div>

                    {/* ── Photo upload ── */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                            Transaction screenshot{" "}
                            <span className="text-red-400">*</span>
                        </p>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[180px] ${preview
                                ? "border-purple-400 p-3"
                                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 p-8"
                                }`}
                        >
                            {preview ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={preview}
                                        alt="Payment receipt preview"
                                        className="rounded-xl object-contain max-h-56 w-full mx-auto"
                                    />
                                    <p className="text-xs text-purple-500">
                                        ✓ Screenshot attached — click or drag to replace
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-3xl select-none">
                                        📎
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            Drop your Instapay screenshot here
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            or click to browse — PNG, JPG, WEBP
                                        </p>
                                    </div>
                                </>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => router.push("/checkout")}
                            className="flex-none rounded-full border border-gray-300 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            ← Back
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={uploading || !file}
                            className={`flex-1 rounded-full py-3 font-medium text-sm transition ${uploading || !file
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-purple-400 hover:bg-purple-500 text-white shadow-md shadow-purple-200"
                                }`}
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Uploading &amp; Submitting…
                                </span>
                            ) : (
                                "Confirm Order →"
                            )}
                        </button>
                    </div>

                    {!file && (
                        <p className="text-xs text-center text-gray-400">
                            Attach your screenshot to enable the confirm button
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
