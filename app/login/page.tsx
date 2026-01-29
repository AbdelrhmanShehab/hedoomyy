"use client";

import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/checkout");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-light">
          Login to continue
        </h1>

        <button
          onClick={loginWithGoogle}
          className="w-full border py-3 rounded flex items-center justify-center gap-3 hover:bg-gray-50"
        >
          <img src="/google.svg" alt="google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
