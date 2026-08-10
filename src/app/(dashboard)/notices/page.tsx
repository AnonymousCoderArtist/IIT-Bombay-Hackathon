"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Plus, Pin, Megaphone } from "lucide-react";
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

type Notice = {
  _id: string;
  title: string;
  body: string;
  category?: string;
  pinned?: boolean;
  createdAt: string;
  authorId?: {
    name: string;
    role: string;
  };
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} min ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NoticesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const canPost = ["admin", "coordinator", "faculty"].includes(role);

  function load() {
    fetch("/api/notices")
      .then((res) => res.json())
      .then((json) => {
        setNotices(json.notices ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">
            Campus announcements aur important updates.
          </p>
        </div>
        {canPost && <CreateNoticeDialog onCreated={load} />}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : notices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Megaphone className="size-10 text-muted-foreground" />
            <p className="font-medium">Koi notice nahi hai</p>
            <p className="text-sm text-muted-foreground">
              Faculty aur coordinators ke announcements yahan dikhenge.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice._id} className={notice.pinned ? "border-primary/40" : ""}>
              <CardContent className="space-y-2 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  {notice.pinned && (
                    <Badge variant="outline" className="gap-1">
                      <Pin className="size-3" />
                      Pinned
                    </Badge>
                  )}
                  {notice.category && (
                    <Badge variant="secondary" className="capitalize">
                      {notice.category}
                    </Badge>
                  )}
                  <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    {notice.authorId?.name || "Campus"}
                    {notice.authorId?.role ? ` · ${notice.authorId.role}` : ""}
                    {" · "}
                    {timeAgo(notice.createdAt)}
                  </span>
                </div>
                <h2 className="font-medium">{notice.title}</h2>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {notice.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateNoticeDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "" });

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not publish notice");
        return;
      }

      toast.success("Notice publish ho gaya!");
      setOpen(false);
      setForm({ title: "", body: "", category: "" });
      onCreated();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Publish notice
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish a notice</DialogTitle>
          <DialogDescription>
            Campus ko ek announcement ya important update batao.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Mid-sem exams schedule"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Exam / Event / General"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              rows={4}
              placeholder="Notice ka poora content..."
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
            />
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
