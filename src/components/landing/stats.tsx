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
    <section className="relative overflow-hidden py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-surface px-4 py-10 text-center"
            >
              <p className="text-4xl font-bold tracking-tight tabular-nums text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
