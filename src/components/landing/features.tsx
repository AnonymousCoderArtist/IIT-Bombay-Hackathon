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
    <section id="features" className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("features.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("features.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
