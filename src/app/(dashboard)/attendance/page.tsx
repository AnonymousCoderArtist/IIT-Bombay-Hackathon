"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type StudentAttendance = {
  summary: { total: number; present: number; late: number; excused: number; absent: number; percentage: number };
  subjectWise: { subject: string; total: number; present: number; percentage: number }[];
  history: { _id: string; status: string; sessionId: { subject: string; date: string } }[];
};

export default function AttendancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          {role === "faculty" || role === "admin"
            ? "Create sessions and mark attendance for your classes."
            : "Track your attendance across subjects."}
        </p>
      </div>

      {role === "faculty" || role === "admin" ? <FacultyAttendance /> : <StudentAttendanceView />}
    </div>
  );
}

function StudentAttendanceView() {
  const [data, setData] = useState<StudentAttendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance/me")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

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
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="font-medium">No attendance recorded yet</p>
          <p className="text-sm text-muted-foreground">
            Once your faculty marks attendance, your analytics will show up here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Overall", value: `${data.summary.percentage}%`, sub: `${data.summary.present + data.summary.late + data.summary.excused}/${data.summary.total} sessions` },
          { label: "Present", value: data.summary.present },
          { label: "Late", value: data.summary.late },
          { label: "Absent", value: data.summary.absent },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.sub && <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="subjects">
        <TabsList>
          <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      record.status === "present"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : record.status === "late"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          : record.status === "excused"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
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
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <p className="font-medium">No sessions yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first attendance session to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <a key={s._id} href={`/attendance/${s._id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{s.subject}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {s.sessionType} · {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
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
