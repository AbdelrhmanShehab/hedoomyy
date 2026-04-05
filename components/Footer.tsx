"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import hedoomybanner from "../public/footerhedoomyy.png";
import useCategories from "../usecategories";
import tiktok from "../public/tiktok.svg";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import DeveloperPopup from "./DeveloperPopup";
import { db } from "@/lib/firebase";
import { doc, setDoc, increment } from "firebase/firestore";

export default function Footer() {
  const { categories = [] } = useCategories();
  const { t } = useLanguage();
  const [isDevPopupOpen, setIsDevPopupOpen] = useState(false);

  const handleDevClick = async () => {
    setIsDevPopupOpen(true);
    try {
      const devStatsRef = doc(db, "stats", "developer_clicks");
      await setDoc(devStatsRef, { count: increment(1) }, { merge: true });
    } catch (error) {
      console.error("Error tracking dev click:", error);
    }
  };

  return (
    <footer className="w-full bg-white text-zinc-800">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-10">
            <Image
              src={hedoomybanner}
              alt="Hedoomyy"
              width={140}
              height={100}
              className="h-28 w-34"
            />
            <p className="text-base font-semibold text-zinc-600">
              {t("footer_tagline")}
            </p>
          </div>
          {/* Shop Now */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              {t("footer_shop_now")}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/products">{t("footer_all_items")}</Link>
              </li>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`}>
                      <span className="capitalize">{cat.name}</span>
                    </Link>
                  </li>
                ))
              ) : null}
            </ul>
          </div>

          {/* Know Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              {t("footer_know_us")}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/about">{t("footer_about_us")}</Link>
              </li>
              <li>
                <Link href="/policy">{t("footer_contact_us")}</Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              {t("footer_help")}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <Link href="/policy">{t("footer_policy")}</Link>
              </li>
              <li>
                <Link href="/account">{t("footer_track_order")}</Link>
              </li>
              <li>
                <Link href="/policy">{t("footer_faqs")}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-zinc-300" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-sm text-zinc-600">{t("footer_copyright")}</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
              {t("footer_powered_by")}{" "}
              <button
                onClick={handleDevClick}
                className="font-bold text-zinc-600 transition-all hover:text-zinc-900 cursor-pointer underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-400 active:scale-95 duration-300"
              >
                Abdelrhman Shehab
              </button>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/hedoomyy/" target="_blank">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.tiktok.com/@hedoomyy?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnJ6MOZl8F0cgrJZNUxe0oMtg5ex9HQ1yBzfOt1MpX5yvEOs_araEV3cm0m9I_aem_qQ7jxkVHYc2Tjeu0wMXlyA"
              target="_blank"
            >
              <Image src={tiktok} alt="tiktok" width={24} height={24} />
            </Link>
          </div>
        </div>
        <DeveloperPopup
          isOpen={isDevPopupOpen}
          onClose={() => setIsDevPopupOpen(false)}
        />
      </div>
    </footer>
  );
}
