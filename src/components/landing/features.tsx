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

        <div className="mt-16 grid gap-5 md:grid-cols-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-7 transition-colors duration-300 hover:border-primary/40 hover:bg-surface md:p-8 ${
                index === 0
                  ? "md:col-span-4 md:row-span-2 md:p-10"
                  : index === 1
                    ? "md:col-span-2"
                    : index === 2
                      ? "md:col-span-2"
                      : index === 3
                        ? "md:col-span-2"
                        : index === 4
                          ? "md:col-span-3"
                          : "md:col-span-3"
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/8 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative">
                <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-105">
                  <feature.icon size={22} />
                </span>
                <h3 className="mt-6 text-2xl tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
