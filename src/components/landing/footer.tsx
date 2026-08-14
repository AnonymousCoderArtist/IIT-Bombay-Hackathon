"use client";

import Image from "next/image";
import Link from "next/link";
import { Code2, Globe, Send } from "lucide-react";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const columns = [
    { title: t("footer.product"), links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: t("footer.campus"), links: ["Events", "Placements", "Clubs", "Announcements"] },
    { title: t("footer.company"), links: ["About", "Blog", "Careers", "Contact"] },
  ];

  const socials = [
    { icon: Code2, hover: "hover:text-teal-600 hover:border-teal-500/50 dark:hover:text-teal-400" },
    { icon: Globe, hover: "hover:text-primary hover:border-primary/50" },
    { icon: Send, hover: "hover:text-orange-600 hover:border-orange-500/50 dark:hover:text-orange-400" },
  ];

  return (
    <footer className="relative overflow-hidden border-t">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_115%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]"
      />
      <Image
        src="/glow-circle.svg"
        alt=""
        width={1676}
        height={1676}
        aria-hidden
        className="pointer-events-none absolute -bottom-64 left-1/2 z-0 h-[44rem] w-[84rem] max-w-none -translate-x-1/2 opacity-30"
      />
      <Image
        src="/vecteezy_golden-abstract-wave-with-a-transparent-background-a_49389895.png"
        alt=""
        width={5824}
        height={3264}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-4 -z-10 h-full w-full object-cover object-top opacity-70"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="border border-border p-8 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <Logo className="h-9 w-9" />
              <span className="font-heading text-base font-bold tracking-tight">
                Smart<span className="text-primary">Campus</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-foreground/75">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, hover }, i) => (
                <a
                  key={i}
                  href="#"
                  className={`flex size-9 items-center justify-center rounded-lg border bg-background/70 text-foreground/75 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 ${hover}`}
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
                      className="text-sm text-foreground/75 transition-colors duration-200 hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row">
          <p className="text-sm text-foreground/75">
            © {new Date().getFullYear()} Smart Campus. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-foreground/75 transition-colors hover:text-primary">
              Privacy
            </a>
            <a href="#" className="text-sm text-foreground/75 transition-colors hover:text-primary">
              Terms
            </a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
