"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Phone,
  X,
  ExternalLink,
  Globe
} from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import me from "../public/me.png"
interface DeveloperPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const socials = [
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://www.linkedin.com/in/abdelrhman-shihab-372bb2228/",
    color: "bg-[#0077b5]",
    description: "Connect for professional networking"
  },
  {
    name: "Portfolio",
    icon: Globe,
    url: "https://abdelrhmanshihab.vercel.app/",
    color: "bg-[#6366f1]",
    description: "Explore my full portfolio and projects"
  },
];

export default function DeveloperPopup({ isOpen, onClose }: DeveloperPopupProps) {
  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[110] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto custom-scrollbar max-h-[90vh] rounded-[2rem] md:rounded-[2.5rem] bg-[#121212]/90 border border-white/10 text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="relative p-6 md:p-10 text-center">
              <button
                onClick={onClose}
                suppressHydrationWarning
                className="absolute right-4 top-4 md:right-8 md:top-8 rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 shadow-xl">
                  <Image
                    src={me}
                    alt="Abdelrhman Shehab"
                    width={80}
                    height={80}
                  />
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 uppercase">LET'S CONNECT</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-8 bg-zinc-700" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
                    Powered by Design Profiles
                  </p>
                  <div className="h-px w-8 bg-zinc-700" />
                </div>
                <p className="mt-4 md:mt-6 text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
                  Explore my work, process, and code <br className="hidden md:block" /> across multiple platforms.
                </p>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 px-6 md:px-8 pb-8 md:pb-10">
              {socials.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="group flex items-center gap-3 md:gap-4 rounded-xl md:rounded-2xl bg-white/5 p-2 md:p-3 pr-4 md:pr-5 transition-all hover:bg-white/10 hover:translate-x-1"
                >
                  <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl transition-transform group-hover:scale-110 shadow-lg ${social.color}`}>
                    <social.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-bold text-xs md:text-sm uppercase tracking-wide">{social.name}</h3>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 truncate font-medium">{social.description}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-zinc-700 group-hover:text-white transition-colors" />
                </motion.a>
              ))}

              {/* Phone / Marketing */}
              <motion.a
                href="https://wa.me/201287419214"
                target="_blank"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="group flex items-center gap-3 md:gap-4 rounded-xl md:rounded-2xl bg-emerald-500/10 p-2 md:p-3 pr-4 md:pr-5 ring-1 ring-emerald-500/20 transition-all hover:bg-emerald-500/20 hover:translate-x-1"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform group-hover:scale-110">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-extrabold text-xs md:text-sm uppercase tracking-wide text-emerald-400">WhatsApp / Call</h3>
                  <p className="text-[9px] md:text-[10px] text-emerald-500/70 font-bold uppercase tracking-tighter italic">Available for freelance projects</p>
                </div>
                <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
              </motion.a>
            </div>

            {/* Developer Info Footer */}
            <div className="bg-white/5 py-4 md:py-5 px-4 text-center border-t border-white/5">
              <p className="text-[7px] md:text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold">
                Developed with <span className="text-rose-500 animate-pulse">❤️</span> by Abdelrhman Shehab
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
