"use client";

import Link from "next/link";
import Image from "next/image";
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
    <footer className="relative overflow-hidden">
      <Image
        src="/black-background-and-golden-waves-and-bubbles-photo.jpg"
        alt=""
        aria-hidden
        width={625}
        height={350}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-20 dark:opacity-25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="font-heading text-base tracking-tight">
                Smart<span className="text-primary">Campus</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon }, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
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

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
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
