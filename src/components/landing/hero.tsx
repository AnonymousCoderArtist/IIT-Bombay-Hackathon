"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useI18n } from "@/lib/i18n";

const stats = [
  { label: "Attendance", value: "92%" },
  { label: "Assignments", value: "3 due" },
  { label: "Events", value: "2 coming" },
];

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72"
      >
        <Image
          src="/vecteezy_golden-abstract-wave-with-a-transparent-background-a_49389895.png"
          alt=""
          width={5824}
          height={3264}
          className="h-full w-full object-cover object-top opacity-40 dark:opacity-50 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:pb-28 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              {t("hero.badge")}
            </span>

            <h1 className="mt-8 text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
              {t("hero.title1")}{" "}
              <em className="font-serif italic text-primary">
                {t("hero.title2")}
              </em>
            </h1>

            <TextGenerateEffect
              words={t("hero.subtitle")}
              className="mx-auto mt-6 max-w-2xl text-base font-normal text-muted-foreground sm:text-lg"
              textClassName="text-base font-normal leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            />

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="group h-11 rounded-full px-7"
                render={<Link href="/register" />}
              >
                {t("hero.start")}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-11 rounded-full px-7 text-muted-foreground"
                render={<a href="#features" />}
              >
                {t("hero.explore")}
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-20 max-w-3xl"
        >
          <div
            aria-hidden
            className="absolute -inset-10 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)] blur-3xl"
          />
          <div className="rounded-2xl border border-border bg-surface/70 shadow-elevated backdrop-blur-md">
            <div className="flex items-center justify-between rounded-t-2xl border-b border-border px-6 py-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#30363c]" />
                <span className="size-2.5 rounded-full bg-[#30363c]/60" />
                <span className="size-2.5 rounded-full bg-[#30363c]/30" />
              </div>
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                smartcampus.io
              </p>
            </div>
            <div className="p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Good morning
                  </p>
                  <p className="mt-1.5 font-heading text-lg text-foreground">
                    Aarav ·{" "}
                    <span className="font-serif italic text-primary">Sem 5 CSE</span>
                  </p>
                </div>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {stats.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-border bg-background/60 px-4 py-4"
                  >
                    <p className="font-heading text-2xl font-extrabold tabular-nums text-primary">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <p className="text-sm text-muted-foreground">
                  DBMS assignment due{" "}
                  <span className="text-foreground">Friday</span>
                </p>
                <span className="rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-[0.7rem] font-medium text-primary">
                  Hackathon live
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
