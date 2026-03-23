"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Heart, ShieldCheck, Truck, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  const values = [
    {
      icon: ShieldCheck,
      title: t("about_value_1_title"),
      desc: t("about_value_1_desc"),
    },
    {
      icon: Truck,
      title: t("about_value_2_title"),
      desc: t("about_value_2_desc"),
    },
    {
      icon: Globe,
      title: t("about_value_3_title"),
      desc: t("about_value_3_desc"),
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/1.png" // Replace with a more appropriate "About" image if available
          alt="About Hedoomyy"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="relative z-10 text-center text-white px-4 space-y-6 max-w-4xl">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight">
            {t("about_hero_title")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
             {t("about_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8">
                <div className="inline-block bg-pink-50 text-pink-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    {t("about_our_story")}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
                    {t("about_story_title")}
                </h2>
                <div className="space-y-6 text-gray-500 leading-relaxed text-lg">
                    <p>{t("about_story_p1")}</p>
                    <p>{t("about_story_p2")}</p>
                </div>
            </div>
            <div className="relative aspect-square rounded-[48px] overflow-hidden shadow-2xl shadow-pink-100/50">
                 <Image
                    src="/2.png"
                    alt="Our Vision"
                    fill
                    className="object-cover"
                />
            </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-zinc-50 rounded-[48px] md:rounded-[100px] mx-4 md:mx-6 border border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-20">
            <div className="max-w-2xl mx-auto space-y-4">
                 <h2 className="text-3xl md:text-5xl font-bold text-zinc-900">{t("about_mission_title")}</h2>
                 <p className="text-gray-500">{t("about_mission_desc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {values.map((v, i) => {
                    const Icon = v.icon;
                    return (
                        <div key={i} className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Icon className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-4">{v.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    )
                })}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-48 px-6 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-pink-100/30 blur-[120px] rounded-full -z-10" />
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-pink-100 rotate-12">
                     <Heart className="w-10 h-10 text-pink-500 fill-current" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 leading-tight">
                    {t("about_made_with_love")}
                </h2>
                <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-zinc-200"
                >
                    {t("about_start_shopping")} <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
                </Link>
            </div>
      </section>
    </div>
  );
}