"use client";
import Image from "next/image";
import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import PrimaryButton from "../../components/PrimaryButton";
import loginPic from "../../public/login.png"
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return;

    setLoading(true);
    const actionCodeSettings = {
      url: `${window.location.origin}/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* Left Image */}
      <div className="relative hidden lg:block">
        <Image
          src={loginPic}
          alt="Login Visual"
          
          className="w-3/4 h-[100vh]"
        />
        <div className="absolute bottom-12 left-12 text-white text-[40px] font-semibold flex flex-col">
          <span>Enter.</span> 
          <span>Explore.</span> 
          <span>Express yourself.</span>    
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          
          <h1 className="text-3xl font-light">
            Welcome Back! <span className="text-pink-400">♡</span>
          </h1>

          <p className="text-gray-500">
            Enter your email to login
          </p>

          {!sent ? (
            <>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full border rounded-md px-4 py-3
                  focus:outline-none focus:ring-1 focus:ring-pink-300
                "
              />

              <PrimaryButton onClick={handleLogin} disabled={loading}>
                {loading ? "Sending..." : "Login"}
              </PrimaryButton>
            </>
          ) : (
            <p className="text-green-600 font-medium">
              Check your email for the login link ✨
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
