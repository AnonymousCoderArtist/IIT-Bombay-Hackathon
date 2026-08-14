"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t, locale, toggleLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const links = [
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.testimonials"), href: "#testimonials" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="font-heading text-base tracking-tight">
            Smart<span className="text-primary">Campus</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && (resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />)}
          </Button>

          <Button variant="ghost" onClick={toggleLocale} aria-label="Toggle language">
            <Languages className="size-5" />
            <span className="text-xs font-medium">{locale === "en" ? "हिंदी" : "EN"}</span>
          </Button>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" render={<Link href="/login" />}>
              {t("nav.signin")}
            </Button>
            <Button render={<Link href="/register" />}>
              {t("nav.start")}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" render={<Link href="/login" />}>
                {t("nav.signin")}
              </Button>
              <Button className="flex-1" render={<Link href="/register" />}>
                {t("nav.start")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
