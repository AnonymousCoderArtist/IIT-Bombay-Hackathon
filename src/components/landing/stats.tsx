"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "4", label: "Role-based portals" },
  { value: "13+", label: "Data entities" },
  { value: "100%", label: "Remote ready" },
  { value: "24/7", label: "Always available" },
];

export function Stats() {
  return (
    <section className="border-t bg-primary py-14 text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-sm text-primary-foreground/70">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
