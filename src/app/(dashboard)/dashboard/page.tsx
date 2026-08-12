"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import CalendarWidget from "@/components/dashboard/calendar-widget";
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

  const studentCards = [
    { title: "Attendance", value: `${attendancePct(data)}%`, icon: CalendarDays },
    { title: "Assignments", value: value(data, "submissions"), hint: `of ${value(data, "totalAssignments")} total`, icon: ClipboardList },
    { title: "Events registered", value: value(data, "eventsRegistered"), icon: Megaphone },
    { title: "Unread notifications", value: value(data, "unreadNotifications"), icon: Bell },
  ];

  const facultyCards = [
    { title: "Classes taken", value: value(data, "classes"), icon: CalendarDays },
    { title: "Assignments", value: value(data, "assignments"), icon: ClipboardList },
    { title: "Students", value: value(data, "students"), icon: Users },
    { title: "Submissions", value: value(data, "submissions"), icon: FileText },
  ];

  const coordinatorCards = [
    { title: "Events", value: value(data, "events"), icon: Megaphone },
    { title: "Upcoming events", value: value(data, "upcomingEvents"), icon: CalendarDays },
    { title: "Registrations", value: value(data, "registrations"), icon: Users },
    { title: "Students", value: value(data, "students"), icon: GraduationCap },
  ];

  const adminCards = [
    { title: "Students", value: value(data, "totalStudents"), icon: Users },
    { title: "Faculty", value: value(data, "totalFaculty"), icon: GraduationCap },
    { title: "Departments", value: value(data, "departments"), icon: Building2 },
    { title: "Events", value: value(data, "events"), icon: Megaphone },
    { title: "Attendance %", value: `${value(data, "attendancePercentage")}%`, icon: BarChart3 },
    { title: "Assignments", value: value(data, "assignments"), icon: ClipboardList },
    { title: "Placements", value: value(data, "placements"), icon: Briefcase },
    { title: "Pending applications", value: value(data, "pendingApplications"), icon: FileText },
  ];

  const cardsByRole: Record<string, typeof studentCards> = {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening on your campus today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardsByRole[role]?.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(role === "student" || role === "coordinator") && <CalendarWidget />}

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickActions[role as keyof typeof quickActions]?.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5 text-green-600" />
          Campus WhatsApp groups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.map((group) => (
          <a
            key={`${group.kind}-${group.name}-${group.link}`}
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{group.name}</p>
              <p className="text-xs text-muted-foreground">{group.kind}</p>
            </div>
            <span className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
              Join
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
