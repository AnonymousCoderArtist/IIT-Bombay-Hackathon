"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CalendarCheck, ClipboardList, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useI18n } from "@/lib/i18n";

const stats = [
  { label: "Attendance", value: "92%" },
  { label: "Assignments", value: "3 due" },
  { label: "Events", value: "2 coming" },
];

const rows = [
  { text: "DBMS assignment due Friday", tone: "accent" },
  { text: "Hackathon registration open", tone: "default" },
  { text: "Data Structures class at 10 AM", tone: "default" },
];

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] -z-10 size-[28rem] rounded-full bg-linear-to-br from-primary/10 to-[var(--violet-accent)]/10 blur-3xl animate-pulse-glow"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title1")}{" "}
            <span className="animate-[gradient-shift_6s_ease_infinite] bg-linear-to-r from-primary via-[color-mix(in_oklch,var(--primary),white_30%)] to-[var(--violet-accent)] bg-clip-text bg-[length:200%_auto] text-transparent">
              {t("hero.title2")}
            </span>
          </h1>

          <TextGenerateEffect
            words={t("hero.subtitle")}
            className="mt-6 max-w-xl text-lg font-normal text-muted-foreground"
            textClassName="text-lg font-normal leading-7 text-muted-foreground"
          />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/register" />}>
              {t("hero.start")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#features" />}>
              {t("hero.explore")}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-lg bg-linear-to-br from-primary/20 via-transparent to-[var(--violet-accent)]/20 blur-2xl"
          />
          <Image
            src="/glow-circle.svg"
            alt=""
            fill
            sizes="600px"
            aria-hidden
            className="pointer-events-none absolute -inset-x-[90%] -inset-y-[85%] -z-10 h-full w-full object-cover opacity-45 mix-blend-multiply dark:opacity-55 dark:mix-blend-screen"
          />
          <div className="rounded-lg border border-border bg-card/80 p-2 shadow-elevated backdrop-blur-sm">
            <div className="rounded-sm border bg-surface-secondary/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Good morning, Aarav</p>
                  <p className="text-lg font-semibold bg-linear-to-t from-foreground/45 to-foreground bg-clip-text text-transparent">Semester 5 · Computer Science</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {stats.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-sm border border-border bg-surface p-3"
                  >
                    <p className="text-sm font-bold tabular-nums">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5">
                {rows.map((item, i) => {
                  const Icon = i === 0 ? ClipboardList : i === 1 ? Megaphone : CalendarCheck;
                  return (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-md ${
                          item.tone === "accent"
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <p className="text-sm">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
