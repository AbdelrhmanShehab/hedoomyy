"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col items-center justify-center px-4  py-10 md:py-24 text-center">
      <h1 className=" lg:w-[1200px] text-3xl font-medium leading-snug text-zinc-900 md:text-5xl">
        {t("hero_headline")}
      </h1>

      <Link
        href="/products"
        className="mt-8 inline-flex text-lg items-center justify-center rounded-full bg-[#E3A5E7] px-10 py-5 text-sm font-bold text-white transition hover:opacity-90"
      >
        {t("hero_shop_all")}
      </Link>
    </section>
  );
}
