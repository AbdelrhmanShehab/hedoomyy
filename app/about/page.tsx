"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-24">

        {/* Breadcrumb */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors w-fit"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {t("policy_back_home")}
        </Link>

        {/* HERO STATEMENT */}
        <div className={`mt-16 mb-20 ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-5xl md:text-7xl font-light leading-tight text-gray-900">
            {t("about_new_hero_1")}
            <br />
            {t("about_new_hero_2")}
            <span className="font-semibold">{t("about_new_hero_3")}</span>
          </h1>
        </div>

        {/* INTRO */}
        <div className={`grid md:grid-cols-2 gap-12 mb-20 ${isRTL ? "text-right" : "text-left"}`}>
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              {t("about_who_we_are")}
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {t("about_who_we_are_desc")}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              {t("about_what_we_believe")}
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {t("about_what_we_believe_desc")}
            </p>
          </div>
        </div>

        {/* PHILOSOPHY */}
        <div className={`mb-20 max-w-3xl ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            {t("about_our_approach")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t("about_our_approach_desc")}
          </p>
        </div>

        {/* WHAT MAKES US SPECIAL */}
        <section className={`mb-24 ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-12">
            {t("about_what_makes_us")} <span className="font-semibold">{t("about_different")}</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("about_affordable_title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("about_affordable_desc")}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("about_cairo_title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("about_cairo_desc")}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                {t("about_love_title")}
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("about_love_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* EMOTIONAL LINE */}
        <div className={`mb-24 ${isRTL ? "flex justify-end" : ""}`}>
          <p className="text-2xl md:text-3xl font-light text-gray-900 flex items-center gap-3 w-fit">
            {t("about_made_with_care")}
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            {t("about_worn_with_confidence")}
          </p>
        </div>

        {/* CTA */}
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition"
          >
            {t("about_explore_collection")}
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}