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

  return (
    <footer className="relative overflow-hidden border-t bg-muted/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
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
              {[Code2, Globe, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Social link"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative mt-14 overflow-hidden border border-border">
          <Image
            src="/footer-banner.png"
            alt="Smart Campus"
            width={2880}
            height={1360}
            loading="lazy"
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-auto w-full"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-background/40 to-transparent"
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smart Campus. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
