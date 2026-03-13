import type { Metadata } from "next";
import PolicyClient from "./PolicyClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Policies & Contact",
  description:
    "Learn about Hedoomyy's shipping, return, delivery, and deposit policies. Contact us via email or phone. We're based in Cairo, Egypt and deliver all over Egypt.",
  alternates: {
    canonical: "https://hedoomyy.com/policy",
  },
  openGraph: {
    url: "https://hedoomyy.com/policy",
    title: "Policies & Contact | Hedoomyy",
    description:
      "Shipping, return, delivery, and deposit policies for Hedoomyy — online fashion store in Egypt.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PolicyPage() {
  return (
    <div>
      <Header />
      <PolicyClient />
      <Footer />
    </div>
  );
}
