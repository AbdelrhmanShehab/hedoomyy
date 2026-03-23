"use client";
import Image from "next/image";
import feedbacks from "../../data/feedback";
import { useLanguage } from "@/context/LanguageContext";

export default function Feedback() {
    const { t } = useLanguage();
    return (
        <section className="relative w-full min-h-[900px] flex flex-col justify-center items-center py-40">

            {/* Section Label */}
            <div className="absolute top-8 left-8 z-20">
                <h3 className="text-2xl font-bold text-zinc-900">{t("feedback_our_family")}</h3>
            </div>

            {/* Center Text */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                    {t("feedback_headline")}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 font-medium">
                    {t("feedback_subline")}
                </p>
            </div>

            {/* Mobile Slider */}
            <div className="lg:hidden w-full mt-12 overflow-x-auto snap-x snap-mandatory flex gap-6 px-6">
                {feedbacks.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-[85%] snap-center flex-shrink-0"
                    >
                        <Image
                            src={item.src}
                            alt="Customer feedback"
                            width={500}
                            height={400}
                            className="w-full h-auto object-contain rounded-2xl shadow-md"
                        />
                    </div>
                ))}
            </div>

            {/* Desktop Floating Irregular Circle */}
            {feedbacks.map((item) => (
                <div
                    key={item.id}
                    className={`hidden lg:block absolute ${item.desktop}`}
                >
                    <Image
                        src={item.src}
                        alt="Customer feedback"
                        width={500}
                        height={400}
                        className="w-full h-auto object-contain 
                       hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ))}

        </section>
    );
}
