"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileOverview from "@/components/account/ProfileOverview";
import OrderHistory from "@/components/account/OrderHistory";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountClient() {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login?redirect=/account");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{t("account_my_account")}</h1>
            <p className="text-zinc-500 mt-1">{t("account_subtitle")}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors text-sm font-medium bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <LogOut className="w-4 h-4" />
            {t("account_sign_out")}
          </button>
        </div>

        <div className="space-y-12">
          {/* Profile Section */}
          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className={`text-lg font-bold text-zinc-800 mb-8 border-b border-zinc-50 pb-4 ${isRTL ? "text-right" : "text-left"}`}>
              {t("account_profile")}
            </h3>
            <ProfileOverview />
          </section>

          {/* Orders Section */}
          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className={`text-lg font-bold text-zinc-800 mb-8 border-b border-zinc-50 pb-4 ${isRTL ? "text-right" : "text-left"}`}>
              {t("account_orders")}
            </h3>
            <OrderHistory />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
