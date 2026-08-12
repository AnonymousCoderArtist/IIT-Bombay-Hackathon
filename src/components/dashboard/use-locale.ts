import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useLocale() {
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
  };

  return { currentLocale, toggleLocale, supportedLocales: ["en", "hi"] };
}
