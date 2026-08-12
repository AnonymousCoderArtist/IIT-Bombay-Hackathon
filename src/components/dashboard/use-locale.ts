import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

function subscribeLang(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readLang() {
  try {
    const lang = window.localStorage.getItem("lang");
    return lang === "hi" || lang === "en" ? lang : "en";
  } catch {
    return "en";
  }
}

function readLangServer() {
  return "en";
}

export function useLocale() {
  const pathLocale = usePathname().includes("/hi/") ? "hi" : "en";
  const stored = useSyncExternalStore(subscribeLang, readLang, readLangServer);
  const currentLocale = stored ?? pathLocale;

  const toggleLocale = () => {
    const next = currentLocale === "en" ? "hi" : "en";
    try {
      window.localStorage.setItem("lang", next);
      window.dispatchEvent(new Event("storage"));
    } catch {
      return;
    }
  };

  return { currentLocale, toggleLocale, supportedLocales: ["en", "hi"] };
}
