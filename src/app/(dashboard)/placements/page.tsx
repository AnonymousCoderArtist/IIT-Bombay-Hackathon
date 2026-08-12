"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Briefcase, MapPin, IndianRupee, Building2, Plus, Loader2, Users, Sparkles } from "lucide-react";
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
import type { MatchResult } from "@/lib/ai";

type Placement = {
  _id: string;
  company: string;
  logo?: string;
  jobRole: string;
  description?: string;
  eligibility?: string;
  ctc?: string;
  location?: string;
  deadline: string;
  link?: string;
  skills?: string[];
  status: string;
  applied?: boolean;
  applicationStatus?: string;
};

export default function PlacementsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Placements</h1>
          <p className="text-muted-foreground">
            {role === "admin" || role === "coordinator"
              ? "Post and manage placement opportunities."
              : "Explore companies hiring from your campus."}
          </p>
        </div>
        {(role === "admin" || role === "coordinator") && <CreatePlacementDialog />}
      </div>

      <PlacementList role={role} />
    </div>
  );
}

function PlacementList({ role }: { role: string }) {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [studentSkills, setStudentSkills] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<Record<string, MatchResult | "loading">>({});

  useEffect(() => {
    fetch("/api/placements")
      .then((res) => res.json())
      .then((json) => {
        setPlacements(json.placements ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((json) => setStudentSkills(json.user?.skills ?? []))
      .catch(() => undefined);
  }, []);

  function matchPercent(placement: Placement) {
    const required = placement.skills?.map((s) => s.toLowerCase().trim()) ?? [];
    const owned = studentSkills.map((s) => s.toLowerCase().trim());
    if (!required.length || !owned.length) return null;
    const matched = required.filter((s) => owned.includes(s)).length;
    return Math.round((matched / required.length) * 100);
  }

  async function analyze(placement: Placement) {
    if (aiResults[placement._id] === "loading") return;
    setAiResults((prev) => ({ ...prev, [placement._id]: "loading" }));
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_role: placement.jobRole,
          job_skills: placement.skills ?? [],
          job_requirements: placement.eligibility ?? "",
          profile_skills: studentSkills,
        }),
      });
      const data = (await res.json()) as MatchResult;
      setAiResults((prev) => ({ ...prev, [placement._id]: data }));
    } catch {
      setAiResults((prev) => {
        const next = { ...prev };
        delete next[placement._id];
        return next;
      });
    }
  }

  async function handleApply(placementId: string) {
    setApplyingId(placementId);
    try {
      const res = await fetch(`/api/placements/${placementId}/apply`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not apply");
        return;
      }

      setPlacements((prev) =>
        prev.map((p) =>
          p._id === placementId ? { ...p, applied: true, applicationStatus: "pending" } : p
        )
      );
      toast.success("Application submitted!");
    } finally {
      setApplyingId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    );
  }

  if (placements.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Briefcase className="size-10 text-muted-foreground" />
          <p className="font-medium">No placements posted yet</p>
          <p className="text-sm text-muted-foreground">
            Placement drives and job openings will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {placements.map((placement) => {
        const isClosed =
          placement.status === "closed" || new Date(placement.deadline) < new Date();
        const isExpanded = expanded === placement._id;

        return (
          <Card key={placement._id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {placement.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={placement.logo}
                      alt={placement.company}
                      className="size-10 rounded-md bg-muted object-contain"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                      <Building2 className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{placement.company}</p>
                    <p className="text-sm text-muted-foreground">{placement.jobRole}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {role === "student" && (
                    <MatchBadge percent={matchPercent(placement)} />
                  )}
                  {isClosed ? (
                    <Badge variant="secondary">Closed</Badge>
                  ) : (
                    <Badge>{placement.status}</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {placement.ctc && (
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="size-4" />
                    {placement.ctc}
                  </span>
                )}
                {placement.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {placement.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  Deadline:{" "}
                  {new Date(placement.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>

              <p
                className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}
              >
                {placement.description || "No description provided."}
              </p>

              {placement.eligibility && (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Eligibility: {placement.eligibility}
                </p>
              )}

              {role === "student" && (
                <div className="space-y-2">
                  {studentSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Profile me skills add karo to har opening ka AI match % dekho.
                    </p>
                  ) : aiResults[placement._id] === "loading" ? (
                    <Button variant="outline" size="sm" disabled className="w-full">
                      <Loader2 className="size-4 animate-spin" />
                      Analyzing profile...
                    </Button>
                  ) : aiResults[placement._id] && aiResults[placement._id] !== "loading" ? (
                    <AiMatchPanel result={aiResults[placement._id] as MatchResult} />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => analyze(placement)}
                    >
                      <Sparkles className="size-4" />
                      Check AI match
                    </Button>
                  )}
                </div>
              )}

              {role === "student" ? (
                placement.applied ? (
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="capitalize">
                      {placement.applicationStatus ?? "applied"}
                    </Badge>
                    {placement.link && (
                      <a
                        href={placement.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Company link →
                      </a>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={isClosed || applyingId === placement._id}
                    onClick={() => handleApply(placement._id)}
                  >
                    {applyingId === placement._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Apply now"
                    )}
                  </Button>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setExpanded(isExpanded ? null : placement._id)}
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CreatePlacementDialog() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    company: "",
    jobRole: "",
    description: "",
    eligibility: "",
    ctc: "",
    location: "",
    deadline: "",
    link: "",
    skills: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          jobRole: form.jobRole,
          description: form.description,
          eligibility: form.eligibility,
          ctc: form.ctc,
          location: form.location,
          deadline: new Date(form.deadline),
          link: form.link || undefined,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not create placement");
        return;
      }

      toast.success("Placement posted");
      setOpen(false);
      setForm({
        company: "",
        jobRole: "",
        description: "",
        eligibility: "",
        ctc: "",
        location: "",
        deadline: "",
        link: "",
        skills: "",
      });
      window.location.reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Post placement
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a placement</DialogTitle>
          <DialogDescription>
            Add a company and job opening for students to apply.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Google"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobRole">Job role</Label>
              <Input
                id="jobRole"
                placeholder="Software Engineer"
                value={form.jobRole}
                onChange={(e) => update("jobRole", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ctc">CTC</Label>
              <Input
                id="ctc"
                placeholder="₹18 LPA"
                value={form.ctc}
                onChange={(e) => update("ctc", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Bengaluru"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Role overview, responsibilities…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eligibility">Eligibility</Label>
            <Input
              id="eligibility"
              placeholder="B.Tech CS/EE, CGPA ≥ 7.0"
              value={form.eligibility}
              onChange={(e) => update("eligibility", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Required skills</Label>
            <Input
              id="skills"
              placeholder="React, Node.js, MongoDB (comma separated)"
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Application deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Apply link</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://careers.google.com/…"
                value={form.link}
                onChange={(e) => update("link", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Post placement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MatchBadge({ percent }: { percent: number | null }) {
  if (percent === null) return null;
  const classes =
    percent >= 60
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : percent >= 30
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {percent}% match
    </span>
  );
}

function AiMatchPanel({ result }: { result: MatchResult }) {
  return (
    <div className="space-y-2 rounded-lg border p-3">
      {result.strengths.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.strengths.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {result.gaps.length > 0 && (
        <p className="text-xs text-muted-foreground">Gaps: {result.gaps.join(", ")}</p>
      )}
      {result.advice && (
        <p className="text-xs text-muted-foreground">Tip: {result.advice}</p>
      )}
    </div>
  );
}
