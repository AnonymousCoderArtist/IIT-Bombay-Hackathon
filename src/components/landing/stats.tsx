"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Stats() {
  const { t } = useI18n();
  const stats = [
    { value: "4", label: t("stats.roles") },
    { value: "13+", label: t("stats.entities") },
    { value: "100%", label: t("stats.remote") },
    { value: "24/7", label: t("stats.available") },
  ];

  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`px-6 py-8 ${i > 0 ? "border-l border-border/60" : ""} ${
                i >= 2 ? "border-t lg:border-t-0" : ""
              } ${i === 2 && i >= 2 ? "lg:border-l" : ""}`}
            >
              <p className="font-serif text-6xl tracking-tight tabular-nums text-primary lg:text-7xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
