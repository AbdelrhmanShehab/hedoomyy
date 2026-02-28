"use client";

import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import loginImg from "../../public/login.png";
import heartIcon from "../../public/heartLoginIcon.svg";
import { Suspense } from "react";
import { Kaushan_Script } from "next/font/google";

const kaushanScript = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

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
    <div className="min-h-screen flex relative">
      {/* ================= LEFT SIDE ================= */}
      <div className="hidden md:flex w-1/3 relative">
        <Image
          src={loginImg}
          alt="login_background_image"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Text */}
        <div className="absolute bottom-[25%] left-16 text-white z-10">
          <h2 className="text-4xl font-medium leading-snug">
            Enter.
            <br />
            Explore.
            <br />
            Express yourself.
          </h2>
        </div>
      </div>
      {/* ================= RIGHT SIDE ================= */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center bg-white p-10 rounded-3xl shadow-sm">

          {/* Welcome */}
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <h1 className={`${kaushanScript.className} text-4xl text-gray-700`}>
                Welcome Back!
              </h1>
              <Image
                src={heartIcon}
                alt="heart"
                width={28}
                height={28}
              />
            </div>
            <p className="text-sm text-gray-500">
              Add your google account to login
            </p>
          </div>

          {/* Input
          <div className="space-y-4">
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-gray-50/50"
            />
          </div> */}

          {/* Button */}
          <button
            onClick={loginWithGoogle}
            className="w-full bg-purple-400 hover:bg-purple-500 text-white font-medium py-4 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
