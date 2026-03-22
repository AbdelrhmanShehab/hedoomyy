"use client";

import { createContext, useContext, useEffect, useState } from "react";
import en, { TranslationKeys } from "@/locales/en";
import ar from "@/locales/ar";

type Lang = "en" | "ar";

const translations: Record<Lang, Record<TranslationKeys, string>> = { en, ar };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKeys, replacements?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load persisted language on mount
  useEffect(() => {
    const stored = localStorage.getItem("hedoomyy_lang") as Lang | null;
    if (stored === "en" || stored === "ar") {
      setLangState(stored);
    }
  }, []);

  // Apply dir + lang to <html> and persist choice
  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
    localStorage.setItem("hedoomyy_lang", lang);
  }, [lang]);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
  };

  const t = (key: TranslationKeys, replacements?: Record<string, string | number>): string => {
    let str = translations[lang][key] ?? en[key] ?? key;
    if (replacements) {
      for (const [token, value] of Object.entries(replacements)) {
        str = str.replace(`{${token}}`, String(value));
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
