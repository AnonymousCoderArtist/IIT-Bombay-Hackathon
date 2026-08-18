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
    { title: t("footer.product"), links: [{ label: "Features", href: "/#features" }, { label: "FAQ", href: "/#faq" }, { label: "Source Code", href: "https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon" }] },
    { title: t("footer.campus"), links: [{ label: "Dashboard", href: "/dashboard" }, { label: "Login", href: "/login" }] },
    { title: t("footer.company"), links: [{ label: "Open Source", href: "/#open-source" }, { label: "Readme", href: "https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon#readme" }] },
  ];

  const socials = [
    {
      icon: GithubIcon,
      href: "https://github.com/AnonymousCoderArtist/IIT-Bombay-Hackathon",
      label: "GitHub",
    },
    { icon: GlobeIcon, href: "#", label: "Website" },
    { icon: BrandTelegramIcon, href: "#", label: "Telegram" },
  ];

  return (
    <footer className="relative overflow-hidden">
      <Image
        src="/vecteezy_golden-abstract-wave-with-a-transparent-background-a_49389895.png"
        alt=""
        aria-hidden
        width={5824}
        height={3264}
        className="pointer-events-none absolute inset-x-0 bottom-[-10rem] -z-10 h-96 w-full object-cover object-center opacity-40 dark:opacity-45"
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
              <span className="font-heading text-base tracking-tight text-foreground dark:text-zinc-50">
                Smart<span className="text-primary">Campus</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  aria-label={label}
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
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                    >
                      {link.label}
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
