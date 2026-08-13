"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Plus, BookOpen, Upload, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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

type Material = {
  _id: string;
  title: string;
  subject?: string;
  course?: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  createdAt: string;
  facultyId?: { name: string };
};

export default function MaterialsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    course: "",
    description: "",
    fileUrl: "",
    fileType: "",
  });

  const canUpload = role === "faculty" || role === "admin";

  function load() {
    fetch("/api/study-materials")
      .then((res) => res.json())
      .then((json) => {
        setMaterials(json.materials ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

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

      setForm((prev) => ({ ...prev, fileUrl: data.url, fileType: file.type }));
      toast.success("File uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/study-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not upload material");
        return;
      }

      toast.success("Study material uploaded");
      setDialogOpen(false);
      setForm({ title: "", subject: "", course: "", description: "", fileUrl: "", fileType: "" });
      load();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<BookOpen className="size-5" />}
        title="Study Materials"
        subtitle={
          canUpload
            ? "Upload notes, slides aur reference material apne students ke liye."
            : "Faculty ke notes aur reference materials browse karo."
        }
        actions={
          canUpload && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button />}>
                <Plus className="size-4" />
              Upload material
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload study material</DialogTitle>
                <DialogDescription>
                  Notes, slides ya reference file upload karo. Students ko notify ho jayega.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="DBMS Lecture 5 - Normalization"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
                      onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="course">Course code</Label>
                    <Input
                      id="course"
                      placeholder="CS301"
                      value={form.course}
                      onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={2}
                    placeholder="Kya is material me cover hota hai?"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>File</Label>
                  <label>
                    <span className="sr-only">Upload file</span>
                    <Input
                      type="file"
                      accept=".pdf,.zip,.doc,.docx,.txt"
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
                      {uploading ? "Uploading..." : form.fileUrl ? "Replace file" : "Upload file"}
                    </span>
                  </label>
                  {form.fileUrl && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {form.fileUrl.split("/").pop()}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating || !form.fileUrl}>
                    {creating && <Loader2 className="size-4 animate-spin" />}
                    Upload
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No study materials yet"
            description={
              canUpload
                ? "Apna pehla study material upload karo."
                : "Faculty ke uploads yahan dikhenge."
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map((material) => (
            <Card key={material._id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{material.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {material.subject ?? "General"}
                      {material.course ? ` · ${material.course}` : ""}
                    </p>
                  </div>
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                </div>

                {material.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {material.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span>
                    {material.facultyId?.name ?? "Faculty"}
                    {" · "}
                    {new Date(material.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground hover:bg-primary/80"
                  >
                    <ExternalLink className="size-3.5" />
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
