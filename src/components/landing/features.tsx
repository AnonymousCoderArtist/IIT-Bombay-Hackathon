"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Briefcase,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const AREAS = [
  "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
  "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
  "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
  "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
  "md:[grid-area:3/1/4/7] xl:[grid-area:2/8/3/13]",
  "md:[grid-area:3/7/4/13] xl:[grid-area:3/1/4/13]",
];

export function Features() {
  const { t } = useI18n();
  const features = [
    { icon: LayoutDashboard, title: t("f1.title"), description: t("f1.desc") },
    { icon: CalendarCheck, title: t("f2.title"), description: t("f2.desc") },
    { icon: ClipboardList, title: t("f3.title"), description: t("f3.desc") },
    { icon: Megaphone, title: t("f4.title"), description: t("f4.desc") },
    { icon: Briefcase, title: t("f5.title"), description: t("f5.desc") },
    { icon: Users, title: t("f6.title"), description: t("f6.desc") },
  ];

  return (
    <section id="features" className="relative overflow-hidden border-y py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
            {t("features.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{t("features.subtitle")}</p>
        </div>

        <motion.ul
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-14 grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-5"
        >
          {features.map((feature, index) => (
            <li key={feature.title} className={`list-none min-h-[13rem] ${AREAS[index % AREAS.length]}`}>
              <div
                className={`group relative flex h-full flex-col justify-between gap-6 overflow-hidden border border-border p-7 transition-colors duration-300 hover:border-primary/35 md:p-8 ${
                  index === 1 || index === 2 ? "bg-surface" : "bg-surface/60"
                }`}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 ${
                    index === 1 || index === 2
                      ? "bg-[radial-gradient(120%_120%_at_15%_0%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]"
                      : "opacity-0"
                  }`}
                />
                {index === 1 || index === 2 ? (
                  <feature.icon
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -bottom-6 size-28 text-primary/10"
                  />
                ) : null}
                <div className="absolute top-0 left-0 h-px w-10 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col justify-between gap-3">
                  <div className="flex size-10 items-center justify-center border border-border text-primary transition-colors duration-300 group-hover:border-primary/50">
                    <feature.icon className="size-5" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-balance md:text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
