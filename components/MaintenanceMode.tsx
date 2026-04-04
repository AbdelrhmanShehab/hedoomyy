"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import banner from "../public/hedoomyybanner.png";
import { useLanguage } from "@/context/LanguageContext";

export default function MaintenanceMode() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Logo/Banner */}
        <div className="relative w-full max-w-md mx-auto aspect-[1200/630]">
          <Image
            src={banner}
            alt="Hedoomyy"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Maintenance Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
            {t("maintenance_title" as any) || "We'll be back shortly"}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            {t("maintenance_desc" as any) || 
              "We're currently updating our store to provide you with the best fashion experience. Thank you for your patience!"}
          </p>
        </div>

        {/* Visual Decoration */}
        <div className="flex justify-center py-4">
          <div className="h-1 w-24 bg-[#E3A5E7] rounded-full" />
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4">
          <p className="text-gray-500 font-medium">
            {t("maintenance_follow" as any) || "Follow us for updates:"}
          </p>
          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/hedoomyy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all group active:scale-95"
            >
              <Instagram className="w-5 h-5 group-hover:text-[#E3A5E7] transition-colors" />
              <span className="font-bold">@hedoomyy</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 pt-8">
          © {new Date().getFullYear()} Hedoomyy. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
