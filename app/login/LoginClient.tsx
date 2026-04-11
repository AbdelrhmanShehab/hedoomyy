"use client";

import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import loginImg from "../../public/login.png";
import heartIcon from "../../public/heartLoginIcon.svg";
import { Suspense } from "react";
import { Kaushan_Script } from "next/font/google";
import { useLanguage } from "@/context/LanguageContext";

const kaushanScript = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const message = searchParams.get("message");
  const { t, isRTL } = useLanguage();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(redirectTo);
    } catch (error: any) {
      if (error.code === "auth/cancelled-popup-request") {
        // User closed the popup, no action needed
        return;
      }
      console.error("Login Error:", error);
    }
  };

  return (
    <div className={`min-h-screen flex relative ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
      {/* ================= LEFT SIDE (Visible on Desktop) ================= */}
      <div className="hidden md:flex w-1/3 relative">
        <Image
          src={loginImg}
          alt="Hedoomyy fashion store — login background"
          fill
          className="object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Text */}
        <div className={`absolute bottom-[25%] z-10 text-white ${isRTL ? "right-16 text-right" : "left-16 text-left"}`}>
          <h2 className="text-4xl font-medium leading-snug">
            {t("login_tagline_1")}
            <br />
            {t("login_tagline_2")}
            <br />
            {t("login_tagline_3")}
          </h2>
        </div>
      </div>
      
      {/* ================= RIGHT SIDE ================= */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center bg-white p-10 rounded-3xl shadow-sm">
          
          {message && (
            <div className="bg-purple-50 border border-purple-100 text-purple-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-500">
              {message}
            </div>
          )}

          {/* Welcome */}
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <h1 className={`${kaushanScript.className} text-4xl text-gray-700`}>
                {t("login_welcome")}
              </h1>
              <Image
                src={heartIcon}
                alt="heart"
                width={28}
                height={28}
              />
            </div>
            <p className="text-sm text-gray-500">
              {t("login_subtitle")}
            </p>
          </div>

          {/* Button */}
          <button
            onClick={loginWithGoogle}
            className="w-full bg-purple-400 hover:bg-purple-500 text-white font-medium py-4 rounded-xl transition duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            {t("login_google_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
