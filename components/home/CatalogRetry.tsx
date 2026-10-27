"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function CatalogRetry() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [pending, startTransition] = useTransition();
  const ar = lang === "ar";
  return <div role="status" className="mx-5 my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-pink-50 px-5 py-4 text-center text-sm text-zinc-600">
    <p>{ar ? "بعض المنتجات مش متاحة دلوقتي بسبب مشكلة في الاتصال. حاولي تاني." : "Some collections couldn't load. Please try again in a moment."}</p>
    <button disabled={pending} onClick={() => startTransition(() => router.refresh())} className="cursor-pointer rounded-full border border-pink-200 bg-white px-4 py-2 disabled:opacity-50">
      {pending ? (ar ? "بنحاول تاني…" : "Retrying…") : (ar ? "حاولي تاني" : "Try again")}
    </button>
  </div>;
}
