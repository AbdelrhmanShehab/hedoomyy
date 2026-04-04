"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Music2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type PolicyKey = "our" | "return" | "delivery" | "deposit";

export default function PolicyClient() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("our");
  const { t, isRTL } = useLanguage();

  const POLICIES: Record<PolicyKey, { title: string; faqs: { q: string; a: React.ReactNode }[] }> = {
    our: {
      title: t("policy_title_our"),
      faqs: [
        { q: t("faq_our_q1"), a: t("faq_our_a1") },
        { q: t("faq_our_q2"), a: t("faq_our_a2") },
        { q: t("faq_our_q3"), a: t("faq_our_a3") },
        { q: t("faq_our_q4"), a: t("faq_our_a4") },
      ],
    },
    return: {
      title: t("policy_title_return"),
      faqs: [
        { q: t("faq_return_q1"), a: t("faq_return_a1") },
        {
          q: t("faq_return_q2"),
          a: (
            <>
              {t("faq_return_a2_p1")}
              <ul className={`list-disc mt-2 ${isRTL ? "mr-5" : "ml-5"}`}>
                <li>{t("faq_return_a2_li1")}</li>
                <li>{t("faq_return_a2_li2")}</li>
                <li>{t("faq_return_a2_li3")}</li>
              </ul>
              <p className="mt-2">{t("faq_return_no_trying")}</p>
            </>
          ),
        },
      ],
    },
    delivery: {
      title: t("policy_title_delivery"),
      faqs: [
        {
          q: t("faq_delivery_q1"),
          a: (
            <>
              {t("faq_delivery_a1_p1")}
              <ul className={`list-disc mt-2 ${isRTL ? "mr-5" : "ml-5"}`}>
                <li>{t("faq_delivery_a1_li1")}</li>
                <li>{t("faq_delivery_a1_li2")}</li>
              </ul>
              <p className="mt-2">{t("faq_delivery_a2")}</p>
            </>
          ),
        },
        { q: t("faq_delivery_q2"), a: t("faq_delivery_a2") },
      ],
    },
    deposit: {
      title: t("policy_title_deposit"),
      faqs: [
        { q: t("faq_deposit_q1"), a: t("faq_deposit_a1") },
        { q: t("faq_deposit_q2"), a: t("faq_deposit_a2") },
        { q: t("faq_deposit_q3"), a: t("faq_deposit_a3") },
        { q: t("faq_deposit_q4"), a: t("faq_deposit_a4") },
      ],
    },
  };

  return (
    <div className={`max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-16 ${isRTL ? "text-right" : "text-left"}`}>
      {/* LEFT */}
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
          {isRTL ? "← " : ""}{t("policy_back_home")}{!isRTL ? " →" : ""}
        </Link>

        <h1 className="text-5xl font-light mt-6">
          <span className="bg-gradient-to-r font-medium from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {t("policy_contact_us")}
          </span>
        </h1>

        <div className="mt-10 space-y-12 text-sm">
          <div className="flex gap-12">
            <div>
              <p className="text-gray-500">{t("policy_submit_email")}</p>
              <p className="text-purple-300 font-bold text-base">hedoomyy@outlook.com</p>
            </div>

            <div>
              <p className="text-gray-500">{t("policy_call_us")}</p>
              <p className="text-purple-300 font-bold text-base">01141088386</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-2">{t("policy_social_media")}</p>
            <div className={`flex gap-4 text-gray-600 ${isRTL ? "justify-end" : ""}`}>
              <Link
                href="https://www.instagram.com/hedoomyy/"
                target="_blank"
                aria-label="Hedoomyy on Instagram"
              >
                <Instagram className="hover:text-pink-600 transition-colors" />
              </Link>
              <Link
                href="https://www.tiktok.com/@hedoomyy"
                target="_blank"
                aria-label="Hedoomyy on TikTok"
              >
                <Music2 className="hover:text-black transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div>
        {/* POLICY NAV */}
        <nav aria-label="Policy tabs" className={`flex flex-wrap gap-3 text-sm mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
          {(Object.keys(POLICIES) as PolicyKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActivePolicy(key)}
              className={`px-4 py-2 rounded-full transition cursor-pointer ${activePolicy === key
                ? "bg-purple-300 font-bold text-white shadow-md shadow-purple-100"
                : "text-gray-500 hover:text-purple-300 bg-zinc-50"
                }`}
            >
              {POLICIES[key].title}
            </button>
          ))}
        </nav>

        {/* FAQ LIST */}
        <div className="space-y-8">
          {POLICIES[activePolicy].faqs.map((faq, index) => (
            <div key={index} className="border-b border-zinc-100 pb-6 last:border-0">
              <h2 className="text-purple-400 font-bold text-base mb-2">
                {faq.q}
              </h2>
              <div className="text-gray-600 text-sm leading-relaxed">
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
