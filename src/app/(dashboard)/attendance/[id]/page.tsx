"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import QrCheckInDialog from "@/components/dashboard/qr-checkin-dialog";

type Student = {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
};

type SessionDetail = {
  _id: string;
  subject: string;
  date: string;
  sessionType: string;
  facultyId: { name: string } | string;
};

type MarkSessionPageData = {
  session: SessionDetail;
  students: Student[];
  records: { studentId: string; status: string; photoUrl?: string }[];
};

export default function MarkSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<MarkSessionPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const [sessionRes, studentsRes] = await Promise.all([
          fetch(`/api/attendance/sessions/${params.id}`),
          fetch(`/api/users/students`),
        ]);

        const sessionJson = await sessionRes.json();
        const studentsJson = await studentsRes.json();

        const students = studentsJson.students ?? [];
        const records = sessionJson.records ?? [];
        const existing = Object.fromEntries(
          records.map((r: { studentId: string; status: string }) => [r.studentId, r.status])
        );
        const photoMap = Object.fromEntries(
          records
            .filter((r: { photoUrl?: string }) => Boolean(r.photoUrl))
            .map((r: { studentId: string; photoUrl?: string }) => [r.studentId, r.photoUrl as string])
        );

        setPhotos(photoMap);
        setStatuses(existing);
        setData({
          session: sessionJson.session,
          students,
          records,
        });
      } catch {
        toast.error("Could not load session");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  function markAll(status: string) {
    if (!data) return;
    setStatuses(
      Object.fromEntries(data.students.map((s) => [s._id, status]))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Could not save attendance");
        return;
      }

      toast.success("Attendance saved");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const visibleStudents = data.students.filter(
    (s) => filter === "all" || statuses[s._id] === filter
  );

  const options: { value: string; label: string; classes: string }[] = [
    { value: "present", label: "Present", classes: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300" },
    { value: "late", label: "Late", classes: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300" },
    { value: "excused", label: "Excused", classes: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300" },
    { value: "absent", label: "Absent", classes: "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.session.subject}</h1>
          <p className="text-muted-foreground">
            {data.session.sessionType} ·{" "}
            {new Date(data.session.date).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QrCheckInDialog sessionId={params.id} />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save attendance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Students ({data.students.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            {["all", ...options.map((o) => o.value)].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {options.map((o) => (
              <Button key={o.value} size="sm" variant="outline" onClick={() => markAll(o.value)}>
                Mark all {o.label}
              </Button>
            ))}
          </div>

          {visibleStudents.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No students in this list yet.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleStudents.map((student) => {
                const current = statuses[student._id] ?? "absent";
                return (
                  <div
                    key={student._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {photos[student._id] && (
                        <a
                          href={photos[student._id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Face check-in photo verify karo"
                          className="shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photos[student._id]}
                            alt={`${student.name} check-in photo`}
                            className="h-10 w-10 rounded-md border object-cover"
                          />
                          <span className="sr-only">Open check-in photo</span>
                        </a>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{student.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {student.rollNumber ? `${student.rollNumber} · ` : ""}
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {options.map((o) => (
                        <button
                          key={o.value}
                          onClick={() =>
                            setStatuses((prev) => ({ ...prev, [student._id]: o.value }))
                          }
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            current === o.value
                              ? o.classes
                              : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                        >
                          {current === o.value && <Check className="size-3" />}
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          Present: {Object.values(statuses).filter((s) => s === "present").length}
        </Badge>
        <Badge variant="secondary">
          Late: {Object.values(statuses).filter((s) => s === "late").length}
        </Badge>
        <Badge variant="secondary">
          Excused: {Object.values(statuses).filter((s) => s === "excused").length}
        </Badge>
        <Badge variant="secondary">
          Absent: {Object.values(statuses).filter((s) => s === "absent").length}
        </Badge>
      </div>
    </div>
  );
}
