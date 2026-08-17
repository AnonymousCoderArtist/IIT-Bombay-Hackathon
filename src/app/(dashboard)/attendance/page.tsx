"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { Download, Loader2, CalendarDays, Plus, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type StudentAttendance = {
  summary: { total: number; present: number; late: number; excused: number; absent: number; percentage: number };
  subjectWise: { subject: string; total: number; present: number; percentage: number }[];
  history: { _id: string; status: string; sessionId: { subject: string; date: string } }[];
  monthly?: {
    month: string;
    summary: { total: number; present: number; late: number; excused: number; absent: number; percentage: number };
    subjectWise: { subject: string; total: number; present: number; percentage: number }[];
    byDay: { date: string; subject: string; status: string }[];
  } | null;
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildTrend(
  history: { status: string; sessionId: { date?: string } }[]
): { month: string; percentage: number }[] {
  const now = new Date();
  const buckets = new Map<string, { label: string; total: number; present: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      total: 0,
      present: 0,
    });
  }

  for (const record of history) {
    const date = new Date(record.sessionId?.date ?? new Date());
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (record.status !== "absent") bucket.present += 1;
  }

  return Array.from(buckets.values()).map((b) => ({
    month: b.label,
    percentage: b.total === 0 ? 0 : Math.round((b.present / b.total) * 100),
  }));
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<CalendarDays className="size-5" />}
        title="Attendance"
        subtitle={
          role === "faculty" || role === "admin"
            ? "Create sessions and mark attendance for your classes."
            : "Track your attendance across subjects."
        }
      />

      {role === "faculty" || role === "admin" ? <FacultyAttendance /> : <StudentAttendanceView />}
    </div>
  );
}

function StudentAttendanceView() {
  const [data, setData] = useState<StudentAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    fetch(`/api/attendance/me?month=${month}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data || data.summary.total === 0) {
    return (
      <Card>
        <EmptyState
          icon={CalendarDays}
          title="No attendance recorded yet"
          description="Once your faculty marks attendance, your analytics will show up here."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Link href="/attendance/scan">
          <Button variant="outline" className="gap-2">
            <ScanLine className="size-4" />
            QR check-in
          </Button>
        </Link>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open("/api/attendance/me/export", "_blank")}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Overall", value: `${data.summary.percentage}%`, sub: `${data.summary.present + data.summary.late + data.summary.excused}/${data.summary.total} sessions`, accent: "border-primary/40 bg-primary/10" },
            { label: "Present", value: data.summary.present, accent: "border-emerald-500/40 bg-emerald-500/10" },
            { label: "Late", value: data.summary.late, accent: "border-amber-500/40 bg-amber-500/10" },
            { label: "Absent", value: data.summary.absent, accent: "border-red-500/40 bg-red-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className={`transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow ${stat.accent}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums">{stat.value}</p>
                {stat.sub && <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="month" className="text-xs text-muted-foreground">
            Monthly report
          </Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 w-full sm:w-44"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
            Analytics
          </p>
          <CardTitle className="text-base">Attendance trend (last 6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buildTrend(data.history)}>
                <defs>
                  <linearGradient id="studentAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  unit="%"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "var(--shadow-elevated)",
                  }}
                  cursor={{ stroke: "var(--border-strong)" }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  name="Attendance %"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#studentAtt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="subjects">
        <TabsList>
          <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="monthly">Monthly report</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="mt-4 space-y-3">
          {data.subjectWise.map((subject) => (
            <Card key={subject.subject}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{subject.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {subject.present}/{subject.total} · {subject.percentage}%
                  </p>
                </div>
                <Progress value={subject.percentage} className="mt-3" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="divide-y">
              {data.history.map((record) => (
                <div key={record._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {(record.sessionId as unknown as { subject?: string })?.subject ?? "General"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        (record.sessionId as unknown as { date?: string })?.date ?? new Date()
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          {!data.monthly || data.monthly.summary.total === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarDays}
                title="No attendance for this month"
                description="Koi attendance session is month me nahi hua."
              />
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Monthly %", value: `${data.monthly.summary.percentage}%`, sub: `${data.monthly.summary.present + data.monthly.summary.late + data.monthly.summary.excused}/${data.monthly.summary.total} sessions`, accent: "border-primary/40 bg-primary/10" },
                  { label: "Present", value: data.monthly.summary.present, accent: "border-emerald-500/40 bg-emerald-500/10" },
                  { label: "Late", value: data.monthly.summary.late, accent: "border-amber-500/40 bg-amber-500/10" },
                  { label: "Absent", value: data.monthly.summary.absent, accent: "border-red-500/40 bg-red-500/10" },
                ].map((stat) => (
                  <Card key={stat.label} className={`transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated ${stat.accent}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                      {stat.sub && <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subject-wise ({data.monthly.month})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.monthly.subjectWise.map((subject) => (
                      <div key={subject.subject}>
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-medium">{subject.subject}</p>
                          <p className="text-muted-foreground">
                            {subject.present}/{subject.total} · {subject.percentage}%
                          </p>
                        </div>
                        <Progress value={subject.percentage} className="mt-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Day-wise breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-80 divide-y overflow-y-auto">
                    {data.monthly.byDay.map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="text-sm font-medium">{day.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(day.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <StatusBadge status={day.status} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FacultyAttendance() {
  const [sessions, setSessions] = useState<{ _id: string; subject: string; date: string; sessionType: string; recordCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ subject: "", date: "", sessionType: "theory" });

  async function loadSessions() {
    const res = await fetch("/api/attendance/sessions");
    const json = await res.json();
    setSessions(json.sessions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/attendance/sessions")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setSessions(json.sessions ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: new Date(form.date) }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not create session");
        return;
      }

      toast.success("Attendance session created");
      setDialogOpen(false);
      setForm({ subject: "", date: "", sessionType: "theory" });
      loadSessions();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            New session
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create attendance session</DialogTitle>
              <DialogDescription>
                Set the subject and date, then mark attendance for students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Data Structures"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sessionType">Type</Label>
                <Input
                  id="sessionType"
                  placeholder="theory / lab / tutorial"
                  value={form.sessionType}
                  onChange={(e) => setForm((prev) => ({ ...prev, sessionType: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  Create session
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No sessions yet"
            description="Create your first attendance session to get started."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <a key={s._id} href={`/attendance/${s._id}`}>
              <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{s.subject}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {s.sessionType} · {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium tabular-nums">
                      {s.recordCount} marked
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
