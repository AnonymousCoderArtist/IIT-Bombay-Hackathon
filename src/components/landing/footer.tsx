"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Code2, Globe, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const columns = [
    { title: t("footer.product"), links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: t("footer.campus"), links: ["Events", "Placements", "Clubs", "Announcements"] },
    { title: t("footer.company"), links: ["About", "Blog", "Careers", "Contact"] },
  ];

  const socials = [
    { icon: Code2, hover: "hover:text-primary hover:border-primary/50" },
    { icon: Globe, hover: "hover:text-amber-600 hover:border-amber-500/50 dark:hover:text-amber-400" },
    { icon: Send, hover: "hover:text-orange-600 hover:border-orange-500/50 dark:hover:text-orange-400" },
  ];

  return (
    <footer className="relative overflow-hidden border-t">
      <Image
        src="/footer-banner.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_115%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-background/95 via-background/55 to-background/90"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <span className="flex size-9 items-center justify-center bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                <GraduationCap className="size-5" />
              </span>
              <span className="font-heading text-base font-bold tracking-tight">
                Smart<span className="text-primary">Campus</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, hover }, i) => (
                <a
                  key={i}
                  href="#"
                  className={`flex size-9 items-center justify-center rounded-lg border bg-background/70 text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 ${hover}`}
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column, colIndex) => (
            <div key={column.title}>
              <h3 className="flex items-center gap-2 font-semibold">
                <span
                  className={`size-1.5 rounded-full ${["bg-primary", "bg-amber-500", "bg-orange-500"][colIndex % 3]}`}
                />
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smart Campus. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
