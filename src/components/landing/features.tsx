"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Check, Clock, MapPin, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LayoutDashboardIcon from "@/components/ui/layout-dashboard-icon";
import AlarmClockPlusIcon from "@/components/ui/alarm-clock-plus-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import FilledBellIcon from "@/components/ui/filled-bell-icon";
import ChartBarIcon from "@/components/ui/chart-bar-icon";
import MessageCircleIcon from "@/components/ui/message-circle-icon";

const roles = [
  { name: "Student", active: true },
  { name: "Faculty", active: false },
  { name: "Admin", active: false },
];

const attendanceMonths = [
  { day: "Mar", value: 62 },
  { day: "Apr", value: 95 },
  { day: "May", value: 58 },
  { day: "Jun", value: 88 },
  { day: "Jul", value: 45 },
  { day: "Aug", value: 97 },
];

const tasks = [
  { label: "DBMS assignment", done: true },
  { label: "OS practical file", done: true },
  { label: "ML lab report", done: false },
];

const events = [
  { label: "Tech Talk", time: "Today, 4 PM" },
  { label: "Hackathon", time: "Tomorrow, 9 AM" },
];

const placements = [
  { label: "TCS", offer: "6.5 LPA" },
  { label: "Infosys", offer: "5.2 LPA" },
  { label: "Microsoft", offer: "24 LPA" },
];

export function Features() {
  const { t } = useI18n();
  const features = [
    {
      icon: LayoutDashboardIcon,
      title: t("f1.title"),
      description: t("f1.desc"),
      span: "md:col-span-2",
      extra: (
        <div className="mt-6 space-y-2.5">
          {roles.map((role) => (
            <div
              key={role.name}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                role.active
                  ? "border-primary/40 bg-primary/8 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground"
              }`}
            >
              <span>{role.name}</span>
              {role.active ? <Check className="size-4 text-primary" /> : <Users className="size-4 opacity-50" />}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: AlarmClockPlusIcon,
      title: t("f2.title"),
      description: t("f2.desc"),
      span: "md:col-span-4",
      extra: (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <div className="flex items-end gap-3">
              <span className="font-heading text-4xl font-extrabold tabular-nums text-primary">92%</span>
              <span className="flex items-center gap-1.5 pb-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> this month
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full w-[92%] rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Only 2 lectures missed out of 25
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Last 6 months
              </p>
              <span className="flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="size-3.5" /> +7% vs last month
              </span>
            </div>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceMonths}>
                  <defs>
                    <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c5ae79" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#c5ae79" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis hide domain={[40, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Attendance"
                    stroke="#c5ae79"
                    strokeWidth={2.5}
                    fill="url(#attFill)"
                    activeDot={{ r: 4, fill: "#c5ae79", strokeWidth: 2 }}
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: FileDescriptionIcon,
      title: t("f3.title"),
      description: t("f3.desc"),
      span: "md:col-span-2",
      extra: (
        <div className="mt-6 space-y-2">
          {tasks.map((task) => (
            <div key={task.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex size-4 items-center justify-center rounded border text-[0.6rem] ${
                  task.done
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={task.done ? "text-muted-foreground" : "text-foreground"}>{task.label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: FilledBellIcon,
      title: t("f4.title"),
      description: t("f4.desc"),
      span: "md:col-span-2",
      extra: (
        <div className="mt-6 space-y-2">
          {events.map((event) => (
            <div key={event.label} className="rounded-xl border border-border bg-background/40 px-3.5 py-3">
              <p className="text-sm font-medium text-foreground">{event.label}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {event.time}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: ChartBarIcon,
      title: t("f5.title"),
      description: t("f5.desc"),
      span: "md:col-span-2",
      extra: (
        <div className="mt-6 flex h-16 items-end gap-1.5">
          {[40, 65, 50, 80, 60, 100].map((height, i) => (
            <span
              key={i}
              style={{ height: `${height}%` }}
              className={`w-full rounded-t-md ${
                i === 5 ? "bg-primary" : "bg-primary/25"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      icon: MessageCircleIcon,
      title: t("f6.title"),
      description: t("f6.desc"),
      span: "md:col-span-6",
      extra: (
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {placements.map((company) => (
            <div key={company.label} className="rounded-xl border border-border bg-background/40 px-3 py-3 text-center">
              <p className="text-sm font-medium text-foreground">{company.label}</p>
              <p className="mt-0.5 text-xs text-primary">{company.offer}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="relative overflow-hidden py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <Image
          src="/golden-spiral.png"
          alt=""
          width={4800}
          height={3000}
          className="h-full w-full -rotate-90 scale-125 object-cover opacity-15 mix-blend-screen dark:opacity-20"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-6rem] -z-10"
      >
        <Image
          src="/black-background-and-golden-waves-and-bubbles-photo.jpg"
          alt=""
          width={625}
          height={350}
          className="h-72 w-full object-cover object-center opacity-25 dark:opacity-30"
        />
      </div>
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
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-surface/50 p-7 transition-colors duration-300 hover:border-primary/30 hover:bg-surface/70 md:p-8 ${feature.span}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/8 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative">
                <div className="flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary transition-transform duration-300 group-hover:scale-105">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-5 text-xl tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                {feature.extra}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}