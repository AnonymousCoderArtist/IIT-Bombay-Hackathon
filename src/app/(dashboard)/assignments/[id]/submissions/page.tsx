"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Submission = {
  _id: string;
  studentId: { name: string; email: string; rollNumber?: string } | string;
  fileUrl?: string;
  githubLink?: string;
  notes?: string;
  marks?: number;
  feedback?: string;
  status: string;
  submittedAt?: string;
};

export default function SubmissionsPage() {
  const params = useParams<{ id: string }>();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/submissions?assignmentId=${params.id}`)
      .then((res) => res.json())
      .then((json) => {
        setSubmissions(json.submissions ?? []);
        const initial = Object.fromEntries(
          (json.submissions ?? []).map((s: Submission) => [
            s._id,
            {
              marks: s.marks != null ? String(s.marks) : "",
              feedback: s.feedback ?? "",
            },
          ])
        );
        setGrades(initial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function updateGrade(id: string, field: string, value: string) {
    setGrades((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function handleGrade(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marks: grades[id]?.marks ? Number(grades[id].marks) : 0,
          feedback: grades[id]?.feedback ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not save grade");
        return;
      }

      toast.success("Grade saved");
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, status: "graded", marks: Number(grades[id]?.marks ?? 0) } : s
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="font-medium">No submissions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Student submissions will appear here for grading.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">Review and grade student submissions.</p>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => {
          const student =
            typeof submission.studentId === "string"
              ? { name: "Student", email: "" }
              : submission.studentId;
          const isLate = submission.status === "late";
          const isGraded = submission.status === "graded";

          return (
            <Card key={submission._id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.rollNumber ? `${student.rollNumber} · ` : ""}
                      {student.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLate && <Badge variant="destructive">Late</Badge>}
                    <Badge variant={isGraded ? "default" : "secondary"}>
                      {isGraded ? `Graded · ${submission.marks}` : "Pending"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {submission.fileUrl && (
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                      View submission file
                    </a>
                  )}
                  {submission.githubLink && (
                    <a
                      href={submission.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                      GitHub repo
                    </a>
                  )}
                  {submission.submittedAt && (
                    <span>
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {submission.notes && (
                  <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {submission.notes}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                  <div className="space-y-1.5">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={grades[submission._id]?.marks ?? ""}
                      onChange={(e) => updateGrade(submission._id, "marks", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Feedback</Label>
                    <Textarea
                      rows={2}
                      value={grades[submission._id]?.feedback ?? ""}
                      onChange={(e) => updateGrade(submission._id, "feedback", e.target.value)}
                      placeholder="Add feedback for the student..."
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleGrade(submission._id)}
                      disabled={savingId === submission._id}
                    >
                      {savingId === submission._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>;
}
