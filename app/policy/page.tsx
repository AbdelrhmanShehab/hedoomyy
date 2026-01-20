"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Music2 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
type PolicyKey = "our" | "return" | "delivery" | "deposit";

const POLICIES: Record<PolicyKey, { title: string; faqs: any[] }> = {
  our: {
    title: "Our Policy",
    faqs: [
      {
        q: "How long does shipping take?",
        a: "Orders usually arrive within 1 to 7 business days after the order is confirmed.",
      },
      {
        q: "How long do pre-order items take to arrive?",
        a: "Pre-order items typically arrive within 5 to 20 days.",
      },
      {
        q: "Will I receive a tracking number?",
        a: "Yes, you will receive a mail that your order has been shipped once it’s ready.",
      },
      {
        q: "Are you responsible for shipping delays?",
        a: "No, we are not responsible for delays caused by couriers, customs, or unforeseen circumstances.",
      },
    ],
  },

  return: {
    title: "Return Policy",
    faqs: [
      {
        q: "Do you offer returns or exchanges?",
        a: "Unfortunately we don't do return nor exchange unless the item you received was defected or different from pictures shown.",
      },
      {
        q: "What if I discover a defect after the courier leaves?",
        a: (
          <>
            If a defect is found after delivery:
            <ul className="list-disc ml-5 mt-2">
              <li>Another courier will collect the item</li>
              <li>The piece will be examined by our quality control team</li>
              <li>If the defect is confirmed, you will receive a full refund, excluding shipping fees</li>
            </ul>
            <p className="mt-2">Trying the item on is not allowed.</p>
          </>
        ),
      },
    ],
  },

  delivery: {
    title: "Delivery Policy",
    faqs: [
      {
        q: "What am I allowed to check during delivery?",
        a: (
          <>
            You may only check that:
            <ul className="list-disc ml-5 mt-2">
              <li>The item is not defective</li>
              <li>The item matches the pictures shown</li>
            </ul>
            <p className="mt-2">Trying the item on is not allowed.</p>
          </>
        ),
      },
      {
        q: "Can I try the item before paying?",
        a: "No. Trying the item before payment is not allowed.",
      },
    ],
  },

  deposit: {
    title: "Deposit Policy",
    faqs: [
      {
        q: "Is a deposit required to place an order?",
        a: "Yes. A deposit is required for every order to confirm and start production.",
      },
      {
        q: "Why do you require a deposit?",
        a: "All pieces are made to order. The deposit helps us secure materials and begin the production process for your item.",
      },
      {
        q: "Is the deposit refundable?",
        a: "Deposits are non-refundable once the order is confirmed, as production starts immediately.",
      },
      {
        q: "When do I pay the remaining balance?",
        a: "The remaining balance must be paid upon delivery.",
      },
      {
        q: "What happens if I cancel my order?",
        a: "If an order is canceled after confirmation, the deposit will not be refunded.",
      },
    ],
  },
};

export default function ContactPage() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("our");

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16">
        {/* LEFT */}
        <div>
          <Link href="/" className="text-sm text-gray-500">
            Back to home &gt;
          </Link>

          <h1 className="text-5xl font-light mt-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Contact{" "}
              Us
            </span>
          </h1>

          <div className="mt-10 space-y-12 text-sm">
            <div className="flex gap-12">

              <div >
                <p className="text-gray-500">Submit Email:</p>
                <p className="text-purple-400">Alaa@gmail.com</p>
              </div>

              <div>
                <p className="text-gray-500">Call us:</p>
                <p className="text-purple-400">01023202564</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Our Social Media:</p>
              <div className="flex gap-4 text-gray-600">
                <Instagram />
                <Music2 />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {/* POLICY NAV */}
          <div className="flex flex-wrap gap-3 text-sm mb-8 ">
            {(Object.keys(POLICIES) as PolicyKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActivePolicy(key)}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${activePolicy === key
                  ? "bg-purple-300 font-bold text-white"
                  : "text-gray-500 hover:text-purple-500"
                  }`}
              >
                {POLICIES[key].title}
              </button>
            ))}
          </div>

          {/* FAQ LIST */}
          <div className="space-y-8">
            {POLICIES[activePolicy].faqs.map((faq, index) => (
              <div key={index} className="border-b pb-6">
                <h3 className="text-purple-400 font-medium">
                  {faq.q}
                </h3>
                <div className="text-gray-600 text-sm mt-2">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
