import type { Metadata } from "next";
import LoginRequiredClient from "./Client";

export const metadata: Metadata = {
  title: "Login Required",
  description: "Please login to access your favorites and more.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginRequiredPage() {
  return <LoginRequiredClient />;
}
