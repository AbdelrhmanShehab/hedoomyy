import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Hedoomyy account to track orders, save favorites, and enjoy a faster checkout experience.",
  alternates: {
    canonical: "https://hedoomyy.com/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
