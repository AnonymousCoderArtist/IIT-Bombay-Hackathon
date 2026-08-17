"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Megaphone,
  Briefcase,
  Users,
  Bell,
  Building2,
  GraduationCap,
  BarChart3,
  FileText,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import { CampusQuickPanel } from "@/components/dashboard/campus-quick-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsData = Record<string, unknown>;

function value(data: AnalyticsData | null, key: string, fallback = 0) {
  const val = data?.[key];
  return typeof val === "number" ? val : fallback;
}

function attendancePct(data: AnalyticsData | null) {
  const attendance = data?.attendance as { percentage?: number } | undefined;
  return attendance?.percentage ?? 0;
}

type CardDef = {
  title: string;
  value: string | number;
  icon: typeof CalendarDays;
  hint?: string;
  accent: "primary" | "cyan" | "violet" | "emerald" | "amber";
  progress?: number;
};

export default function DashboardHome() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => setData(json.data ?? {}))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const role = session?.user?.role ?? "student";

  const studentCards: CardDef[] = [
    { title: "Attendance", value: `${attendancePct(data)}%`, icon: CalendarDays, accent: "primary", progress: attendancePct(data) },
    { title: "Assignments", value: value(data, "submissions"), hint: `of ${value(data, "totalAssignments")} total`, icon: ClipboardList, accent: "cyan" },
    { title: "Events registered", value: value(data, "eventsRegistered"), icon: Megaphone, accent: "violet" },
    { title: "Unread notifications", value: value(data, "unreadNotifications"), icon: Bell, accent: "amber" },
  ];

  const facultyCards: CardDef[] = [
    { title: "Classes taken", value: value(data, "classes"), icon: CalendarDays, accent: "primary" },
    { title: "Assignments", value: value(data, "assignments"), icon: ClipboardList, accent: "cyan" },
    { title: "Students", value: value(data, "students"), icon: Users, accent: "violet" },
    { title: "Submissions", value: value(data, "submissions"), icon: FileText, accent: "emerald" },
  ];

  const coordinatorCards: CardDef[] = [
    { title: "Events", value: value(data, "events"), icon: Megaphone, accent: "primary" },
    { title: "Upcoming events", value: value(data, "upcomingEvents"), icon: CalendarDays, accent: "cyan" },
    { title: "Registrations", value: value(data, "registrations"), icon: Users, accent: "violet" },
    { title: "Students", value: value(data, "students"), icon: GraduationCap, accent: "emerald" },
  ];

  const adminCards: CardDef[] = [
    { title: "Students", value: value(data, "totalStudents"), icon: Users, accent: "primary" },
    { title: "Faculty", value: value(data, "totalFaculty"), icon: GraduationCap, accent: "cyan" },
    { title: "Departments", value: value(data, "departments"), icon: Building2, accent: "violet" },
    { title: "Events", value: value(data, "events"), icon: Megaphone, accent: "emerald" },
    { title: "Attendance %", value: `${value(data, "attendancePercentage")}%`, icon: BarChart3, accent: "primary" },
    { title: "Assignments", value: value(data, "assignments"), icon: ClipboardList, accent: "cyan" },
    { title: "Placements", value: value(data, "placements"), icon: Briefcase, accent: "violet" },
    { title: "Pending applications", value: value(data, "pendingApplications"), icon: FileText, accent: "amber" },
  ];

  const cardsByRole: Record<string, CardDef[]> = {
    student: studentCards,
    faculty: facultyCards,
    coordinator: coordinatorCards,
    admin: adminCards,
  };

  const quickActions = {
    student: [
      { label: "View attendance", href: "/attendance" },
      { label: "Browse events", href: "/events" },
      { label: "See placements", href: "/placements" },
    ],
    faculty: [
      { label: "Take attendance", href: "/attendance" },
      { label: "Create assignment", href: "/assignments" },
    ],
    coordinator: [
      { label: "Manage events", href: "/events" },
      { label: "Create placement", href: "/placements" },
    ],
    admin: [
      { label: "Manage users", href: "/admin/users" },
      { label: "View logs", href: "/admin/logs" },
    ],
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-primary" suppressHydrationWarning>
            {today}
          </p>
          <h1 className="mt-0.5 font-serif text-2xl tracking-tight text-balance sm:text-3xl">
            Welcome back,{" "}
            <em className="italic text-primary">{session?.user?.name?.split(" ")[0]}</em>
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            Here is what is happening on your campus today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions[role as keyof typeof quickActions]?.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-card transition-all hover:border-primary/40 hover:text-primary"
            >
              {action.label}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cardsByRole[role]?.map((card) => (
          <motion.div
            key={card.title}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
          >
            <StatCard {...card} loading={loading} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="grid gap-3 lg:grid-cols-2">
            {(role === "student" || role === "coordinator") && <CalendarWidget />}

            {role === "student" ? (
              <CampusGroupsCard />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your recent activity and updates will appear here as things happen.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {role === "admin" && <AnalyticsCharts data={data ?? {}} />}
        </div>

        <CampusQuickPanel />
      </div>
    </div>
  );
}

function CampusGroupsCard() {
  const [groups, setGroups] = useState<{ name: string; kind: string; link: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/clubs").then((res) => res.json()),
      fetch("/api/courses").then((res) => res.json()),
    ])
      .then(([clubJson, courseJson]) => {
        if (cancelled) return;
        const clubs = (clubJson.clubs ?? [])
          .filter((club: { whatsappGroupLink?: string }) => club.whatsappGroupLink)
          .map((club: { name: string; whatsappGroupLink: string }) => ({
            name: club.name,
            kind: "Club",
            link: club.whatsappGroupLink,
          }));
        const courses = (courseJson.courses ?? [])
          .filter((course: { whatsappGroupLink?: string }) => course.whatsappGroupLink)
          .map((course: { name: string; code?: string; whatsappGroupLink: string }) => ({
            name: course.code ? `${course.name} (${course.code})` : course.name,
            kind: "Course",
            link: course.whatsappGroupLink,
          }));
        setGroups([...clubs, ...courses]);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campus WhatsApp groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campus WhatsApp groups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Koi WhatsApp group link abhi add nahi hua. Faculty ya admin clubs aur courses me link
            add karein to groups yahan dikhenge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MessageCircle className="size-3.5" />
          </span>
          Campus WhatsApp groups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.slice(0, 4).map((group) => (
          <a
            key={`${group.kind}-${group.name}-${group.link}`}
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-elevated"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{group.name}</p>
              <p className="text-xs text-muted-foreground">{group.kind}</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary/20">
              Join
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
