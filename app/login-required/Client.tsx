"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, User, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function LoginRequiredContent() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Icon Header */}
        <div className="flex justify-center relative">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center relative z-10">
            <Heart className="w-12 h-12 text-pink-400 fill-pink-400 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shadow-sm z-20 border-4 border-white">
            <User className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {t("login_required_title")}
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            {t("login_required_desc")}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all transform active:scale-95 shadow-xl shadow-zinc-200 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {t("login_required_btn")}
          </button>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 font-bold py-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            {t("login_required_back")}
          </Link>
        </div>

        {/* Subtle Tagline */}
        <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-4">
          Hedoomyy — {t("footer_tagline")}
        </p>
      </div>
    </div>
  );
}

export default function LoginRequiredClient() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginRequiredContent />
    </Suspense>
  );
}
