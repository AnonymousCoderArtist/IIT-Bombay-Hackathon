"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";
import GithubIcon from "@/components/ui/github-icon";
import GlobeIcon from "@/components/ui/globe-icon";
import BrandTelegramIcon from "@/components/ui/brand-telegram-icon";

export function Footer() {
  const { t } = useI18n();
  const columns = [
    { title: t("footer.product"), links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: t("footer.campus"), links: ["Events", "Placements", "Clubs", "Announcements"] },
    { title: t("footer.company"), links: ["About", "Blog", "Careers", "Contact"] },
  ];

  const socials = [
    { icon: GithubIcon },
    { icon: GlobeIcon },
    { icon: BrandTelegramIcon },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_70%_55%_at_50%_115%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <div className="p-8 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Link href="/" className="flex items-center gap-2.5">
                  <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
                  <span className="font-heading text-base tracking-tight">
                    Smart<span className="text-primary">Campus</span>
                  </span>
                </Link>
                <p className="mt-4 max-w-sm text-sm text-foreground/75">{t("footer.tagline")}</p>
                <div className="mt-6 flex gap-3">
                  {socials.map(({ icon: Icon }, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex size-9 items-center justify-center rounded-full border border-border bg-background/70 text-foreground/75 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                      aria-label="Social link"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {columns.map((column) => (
                <div key={column.title}>
                  <h3 className="font-heading text-sm font-extrabold uppercase tracking-[0.15em] text-primary">
                    {column.title}
                  </h3>
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
      </div>
    </footer>
  );
}
