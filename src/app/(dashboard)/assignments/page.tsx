"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Plus, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Assignment = {
  _id: string;
  title: string;
  subject?: string;
  description?: string;
  deadline: string;
  rubric?: string;
  submitted?: boolean;
  submission?: { status: string; marks?: number } | null;
};

export default function AssignmentsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            {role === "faculty" || role === "admin"
              ? "Create assignments and review student submissions."
              : "Track and submit your assignments on time."}
          </p>
        </div>
        {(role === "faculty" || role === "admin") && <CreateAssignmentDialog />}
      </div>

      <AssignmentList role={role} />
    </div>
  );
}

function AssignmentList({ role }: { role: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then((res) => res.json())
      .then((json) => {
        setAssignments(json.assignments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="font-medium">No assignments yet</p>
          <p className="text-sm text-muted-foreground">
            {role === "faculty" || role === "admin"
              ? "Create your first assignment to get started."
              : "New assignments from your faculty will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assignments.map((assignment) => {
        const deadline = new Date(assignment.deadline);
        const isOverdue = deadline < new Date();
        const submission = assignment.submission;

        return (
          <Link key={assignment._id} href={`/assignments/${assignment._id}`}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {assignment.subject ?? "General"}
                    </p>
                  </div>
                  {role === "student" ? (
                    submission ? (
                      <Badge
                        variant={submission.status === "graded" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {submission.status === "graded"
                          ? `Graded${submission.marks != null ? ` · ${submission.marks}` : ""}`
                          : submission.status === "late"
                            ? "Late"
                            : "Submitted"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Pending
                      </Badge>
                    )
                  ) : null}
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {assignment.description || "No description provided."}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  {isOverdue ? (
                    <Clock className="size-3.5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
                  )}
                  <span className={isOverdue ? "text-destructive" : ""}>
                    {isOverdue ? "Overdue" : "Due"}:{" "}
                    {deadline.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function CreateAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    course: "",
    description: "",
    deadline: "",
    rubric: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline: new Date(form.deadline),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not create assignment");
        return;
      }

      toast.success("Assignment published");
      setOpen(false);
      setForm({ title: "", subject: "", course: "", description: "", deadline: "", rubric: "" });
      window.location.reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New assignment
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create assignment</DialogTitle>
          <DialogDescription>
            Set a title, deadline and optional rubric. Students will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="DBMS Assignment 2"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Database Management"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course">Course code</Label>
              <Input
                id="course"
                placeholder="CS301"
                value={form.course}
                onChange={(e) => update("course", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="What should students do for this assignment?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rubric">Rubric</Label>
            <Textarea
              id="rubric"
              rows={3}
              placeholder="How will this be graded?"
              value={form.rubric}
              onChange={(e) => update("rubric", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Publish assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
