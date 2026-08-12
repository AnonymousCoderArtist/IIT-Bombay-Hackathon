import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "hi"];
const DEFAULT_LOCALE = "en";

export function useLocale() {
  const t = useTranslations();
  const locale = usePathname().includes("/hi/") ? "hi" : "en";
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    try {
      const lang = localStorage.getItem("lang") || locale;
      setCurrentLocale(lang);
    } catch {
      setCurrentLocale(locale);
    }
  }, [locale]);

  const toggleLocale = () => {
    const next = currentLocale === "en" ? "hi" : "en";
    localStorage.setItem("lang", next);
    setCurrentLocale(next);
    // Note: using next-intl for production would need proper locale switching
  };

  return { t, currentLocale, toggleLocale, supportedLocales: SUPPORTED_LOCALES };
}
