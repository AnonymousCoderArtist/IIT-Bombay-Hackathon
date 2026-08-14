"use client";

import { useI18n } from "@/lib/i18n";
import LayoutDashboardIcon from "@/components/ui/layout-dashboard-icon";
import AlarmClockPlusIcon from "@/components/ui/alarm-clock-plus-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import FilledBellIcon from "@/components/ui/filled-bell-icon";
import ChartBarIcon from "@/components/ui/chart-bar-icon";
import MessageCircleIcon from "@/components/ui/message-circle-icon";

export function Features() {
  const { t } = useI18n();
  const features = [
    { icon: LayoutDashboardIcon, title: t("f1.title"), description: t("f1.desc") },
    { icon: AlarmClockPlusIcon, title: t("f2.title"), description: t("f2.desc") },
    { icon: FileDescriptionIcon, title: t("f3.title"), description: t("f3.desc") },
    { icon: FilledBellIcon, title: t("f4.title"), description: t("f4.desc") },
    { icon: ChartBarIcon, title: t("f5.title"), description: t("f5.desc") },
    { icon: MessageCircleIcon, title: t("f6.title"), description: t("f6.desc") },
  ];

  return (
    <section id="features" className="relative border-y border-border/60 py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-medium tracking-[0.3em] uppercase text-primary">
              {t("features.eyebrow")}
            </span>
            <h2 className="mt-4 text-4xl tracking-tight text-balance sm:text-5xl">
              {t("features.title")}
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground md:text-right">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-16 border-t border-border/60">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group grid gap-6 border-b border-border/60 py-8 transition-colors duration-300 hover:bg-surface/40 md:grid-cols-12 md:items-center md:py-10"
            >
              <span className="font-heading text-sm font-extrabold tracking-[0.2em] text-primary/50 transition-colors group-hover:text-primary md:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-start gap-5 md:col-span-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-105">
                  <feature.icon size={22} />
                </span>
                <h3 className="pt-1 text-xl tracking-tight md:text-2xl">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground md:col-span-6 md:pl-6">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
