"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useI18n } from "@/lib/i18n";
import AlarmClockPlusIcon from "@/components/ui/alarm-clock-plus-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import FilledBellIcon from "@/components/ui/filled-bell-icon";

const stats = [
  { label: "Attendance", value: "92%" },
  { label: "Assignments", value: "3 due" },
  { label: "Events", value: "2 coming" },
];

const rows = [
  { text: "DBMS assignment due Friday", Icon: FileDescriptionIcon },
  { text: "Hackathon registration open", Icon: FilledBellIcon },
  { text: "Data Structures class at 10 AM", Icon: AlarmClockPlusIcon },
];

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {t("hero.badge")}
          </span>

          <h1 className="mt-7 text-5xl leading-[1.02] font-heading tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.title1")}{" "}
            <span className="font-serif-italic font-light italic text-primary">
              {t("hero.title2")}
            </span>
          </h1>

          <TextGenerateEffect
            words={t("hero.subtitle")}
            className="mt-6 max-w-xl text-lg font-normal text-muted-foreground"
            textClassName="text-lg font-normal leading-7 text-muted-foreground"
          />

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" className="rounded-full px-6" render={<Link href="/register" />}>
              {t("hero.start")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6" render={<a href="#features" />}>
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
            className="absolute -inset-4 -z-10 rounded-2xl bg-linear-to-br from-primary/15 via-transparent to-[#30363c]/40 blur-2xl"
          />
          <div className="rounded-xl border border-border bg-surface/80 p-2 shadow-elevated backdrop-blur-sm">
            <div className="rounded-lg border border-border/70 bg-background/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Good morning
                  </p>
                  <p className="mt-1 font-heading text-xl text-foreground">
                    Aarav · <span className="font-serif italic text-primary">Sem 5 CSE</span>
                  </p>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <FilledBellIcon size={16} />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {stats.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-lg border border-border bg-surface p-3.5"
                  >
                    <p className="font-heading text-lg font-extrabold tabular-nums">{card.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5">
                {rows.map(({ text, Icon }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 transition-colors duration-300 hover:border-primary/40"
                  >
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon size={14} />
                    </span>
                    <p className="text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
