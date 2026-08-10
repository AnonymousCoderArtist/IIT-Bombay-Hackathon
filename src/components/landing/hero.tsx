"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.9),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            Built for modern campuses
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Campus life,{" "}
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-600 to-neutral-400 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-neutral-500">
              one platform
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Attendance, assignments, events, placements and clubs — everything students, faculty
            and coordinators need, together in a fast, secure and beautiful app.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/register" />}>
              Get started free
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<a href="#features" />}>
              Explore features
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-2xl border bg-card p-2 shadow-2xl shadow-black/10">
            <div className="rounded-xl border bg-muted/40 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Good morning, Aarav</p>
                  <p className="text-lg font-semibold">Semester 5 · Computer Science</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-neutral-400" />
                  <span className="size-2.5 rounded-full bg-neutral-300" />
                  <span className="size-2.5 rounded-full bg-neutral-200" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Attendance", value: "92%" },
                  { label: "Assignments", value: "3 due" },
                  { label: "Events", value: "2 coming" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border bg-background p-3">
                    <p className="text-sm font-semibold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {["DBMS assignment due Friday", "Hackathon registration open", "Data Structures class at 10 AM"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
                    >
                      <span
                        className={`size-2 rounded-full ${
                          i === 0 ? "bg-neutral-900 dark:bg-white" : "bg-neutral-400"
                        }`}
                      />
                      <p className="text-sm">{item}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
