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
    <section className="relative overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center lg:text-left"
            >
              <p className="font-heading text-5xl font-extrabold tracking-tight tabular-nums text-primary lg:text-6xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
