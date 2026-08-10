"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Upload, FileText, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AssignmentDetail = {
  _id: string;
  title: string;
  subject?: string;
  course?: string;
  description?: string;
  deadline: string;
  rubric?: string;
  attachments: string[];
};

type Submission = {
  _id: string;
  fileUrl?: string;
  githubLink?: string;
  notes?: string;
  marks?: number;
  feedback?: string;
  status: string;
  submittedAt?: string;
};

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/assignments/${params.id}`)
      .then((res) => res.json())
      .then((json) => {
        setAssignment(json.assignment);
        setSubmission(json.submission ?? null);
        if (json.submission) {
          setFileUrl(json.submission.fileUrl ?? "");
          setGithubLink(json.submission.githubLink ?? "");
          setNotes(json.submission.notes ?? "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      setFileUrl(data.url);
      toast.success("File uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/assignments/${params.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, githubLink, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not submit");
        return;
      }

      toast.success("Submission saved");
      setSubmission(data.submission);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !assignment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  const deadline = new Date(assignment.deadline);
  const isLate = new Date() > deadline;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground">
          {assignment.subject ?? "General"}
          {assignment.course ? ` · ${assignment.course}` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={isLate ? "destructive" : "secondary"}>
                  {isLate ? "Deadline passed" : "Open"} ·{" "}
                  {deadline.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {assignment.description || "No description provided."}
              </p>
              {assignment.rubric && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Rubric</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {assignment.rubric}
                  </p>
                </div>
              )}
              {assignment.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Attachments</p>
                  {assignment.attachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="size-4" />
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {role === "student" ? (
          <Card>
            <CardHeader>
              <CardTitle>Your submission</CardTitle>
              <CardDescription>
                {submission
                  ? `Status: ${submission.status}`
                  : "Submit your solution before the deadline."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submission?.status === "graded" && (
                <div className="mb-4 rounded-lg border bg-muted/40 p-4 text-center">
                  <p className="text-3xl font-bold">{submission.marks ?? "—"}/100</p>
                  <p className="mt-1 text-xs text-muted-foreground">Marks</p>
                  {submission.feedback && (
                    <p className="mt-2 text-sm text-muted-foreground">{submission.feedback}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Solution file</Label>
                  <label>
                    <span className="sr-only">Upload solution</span>
                    <Input
                      type="file"
                      accept=".pdf,.zip,.doc,.docx"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      {uploading ? "Uploading..." : fileUrl ? "Replace file" : "Upload file"}
                    </span>
                  </label>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3" />
                      {fileUrl.split("/").pop()}
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="github">GitHub link</Label>
                  <Input
                    id="github"
                    type="url"
                    placeholder="https://github.com/user/repo"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Anything the reviewer should know..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <Send className="size-4" />
                  {submission ? "Update submission" : "Submit assignment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>Review student submissions for this assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/assignments/${params.id}/submissions`}
                className="flex w-full items-center justify-center rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                View all submissions
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
