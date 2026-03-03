"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import feedbacks from "../../data/feedback";

export default function Feedback() {
    const constraintsRef = useRef(null);

    return (
        <section className="relative w-full h-[800px] overflow-hidden bg-white cursor-grab active:cursor-grabbing">

            {/* 1. Fixed Header Overlay (Z-index high so it stays on top) */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center items-center px-6">
                <div className="absolute top-8 left-8">
                    <h3 className="text-xl font-bold text-zinc-900">Our Family</h3>
                </div>

                <div className="text-center max-w-2xl bg-white/40 backdrop-blur-sm p-6 rounded-3xl">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
                        Explore what our customers <br />
                        have to say about us
                    </h2>
                    <p className="text-lg text-gray-500 font-medium">
                        your feedback shapes everything we do &lt;3
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-widest text-gray-400 animate-pulse">
                        ← Drag to explore →
                    </p>
                </div>
            </div>

            {/* 2. The Draggable Canvas Container */}
            <div ref={constraintsRef} className="absolute inset-[-25%] w-[150%] h-[150%] z-10">
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.2}
                    // Starting position in the middle
                    initial={{ x: "-15%", y: "-15%" }}
                    className="relative w-full h-full"
                >
                    {feedbacks.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={`absolute p-2 ${item.desktop || "top-1/2 left-1/2"}`}
                            style={{
                                // Adding a slight random rotation to each for the "collage" look
                                rotate: index % 2 === 0 ? 3 : -3,
                            }}
                            whileHover={{ scale: 1.05, zIndex: 50 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image
                                src={item.src}
                                alt="Customer feedback"
                                width={280} // Smaller for mobile density
                                height={200}
                                className="w-full h-auto object-contain drop-shadow-xl rounded-xl"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* 3. Background Decoration (Optional) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />
        </section>
    );
}