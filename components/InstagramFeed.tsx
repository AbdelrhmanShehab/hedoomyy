"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function InstagramFeed() {
  const { t } = useLanguage();
  const images = Array.from({ length: 10 }, (_, i) => `/img${i + 1}.png`);
  const instagramUrl = "https://www.instagram.com/hedoomyy/";

  return (
    <section className="w-[90%] mx-auto bg-white py-16">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111]">
          {t("instagram_follow")}
        </h2>
      </div>

      {/* Grid Wrapper */}
      <div className="relative group">
        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 w-full">
          {images.map((imgSrc, i) => (
            <a
              key={i}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative aspect-square overflow-hidden ${i >= 6 ? "hidden md:block" : "block"
                }`}
            >
              <Image
                src={imgSrc}
                alt={`Instagram post ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width:768px) 50vw, 20vw"
              />
            </a>
          ))}
        </div>

        {/* Section Overlay */}
        <Link
          href={instagramUrl}
          target="_blank"
          className="absolute inset-0 bg-black/40 md:bg-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-300 flex items-center justify-center cursor-pointer"
        >
          <div className="flex flex-col items-center scale-90 md:scale-100">
            <div className="rounded-2xl">
              <Image
                src="/instagram.png"
                alt="Hedoomyy"
                width={85}
                height={85}
              />
            </div>

            <span className="text-white text-3xl font-extrabold mt-3 tracking-wide">
              Hedoomyy
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}