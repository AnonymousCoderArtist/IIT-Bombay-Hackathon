"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Upload, Save, LinkIcon, ScanFace, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FaceCaptureDialog from "@/components/dashboard/face-capture-dialog";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  semester?: number;
  skills: string[];
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  bio?: string;
  image?: string;
};

const initialForm = {
  name: "",
  phone: "",
  rollNumber: "",
  department: "",
  semester: "",
  skills: "",
  linkedin: "",
  github: "",
  bio: "",
};

export default function ProfilePage() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [faceEnrolling, setFaceEnrolling] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((json) => {
        const user = json.user as UserProfile;
        setProfile(user);
        setForm({
          name: user.name ?? "",
          phone: user.phone ?? "",
          rollNumber: user.rollNumber ?? "",
          department: user.department ?? "",
          semester: user.semester ? String(user.semester) : "",
          skills: user.skills?.join(", ") ?? "",
          linkedin: user.linkedin ?? "",
          github: user.github ?? "",
          bio: user.bio ?? "",
        });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", file.type.startsWith("image/") ? "image" : "file");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      if (file.type.startsWith("image/")) {
        await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: data.url }),
        });
        toast.success("Profile picture updated");
        await updateSession();
      } else {
        await fetch("/api/users/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeUrl: data.url }),
        });
        toast.success("Resume uploaded");
        setProfile((prev) => (prev ? { ...prev, resumeUrl: data.url } : prev));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleFaceCapture(image: string) {
    setFaceEnrolling(true);
    try {
      const res = await fetch("/api/face/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Face enroll fail hua");
        return;
      }
      setFaceEnrolled(true);
      toast.success("Face enrolled — ab face check-in use kar sakte ho");
    } finally {
      setFaceEnrolling(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        rollNumber: form.rollNumber,
        department: form.department,
        semester: form.semester ? Number(form.semester) : undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        linkedin: form.linkedin,
        github: form.github,
        bio: form.bio,
      };

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not save profile");
        return;
      }

      toast.success("Profile saved");
      await updateSession();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal and academic details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Avatar & resume</CardTitle>
            <CardDescription>Upload a profile picture and your latest resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-24 items-center justify-center rounded-full bg-muted text-3xl font-bold">
                {profile?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <label className="w-full">
                <span className="sr-only">Upload profile picture</span>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {uploading ? "Uploading..." : "Change photo"}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="sr-only">Upload resume</span>
                <Input
                  type="file"
                  accept=".pdf,.zip,.doc,.docx"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {uploading ? "Uploading..." : "Upload resume"}
                </span>
              </label>
              {profile?.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LinkIcon className="size-3" />
                  View uploaded resume
                </a>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  No resume uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Face enrollment</CardTitle>
            <CardDescription>
              Camera se photo lo — attendance face check-in ke liye use hogi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faceEnrolled ? (
              <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle2 className="size-5 shrink-0" />
                <p>Face enrolled ho chuki hai. Face check-in ready hai!</p>
              </div>
            ) : (
              <FaceCaptureDialog
                title="Face enroll karo"
                description="Camera ke samne seedha aao, achhi lighting me, bina glasses/hat ke — phir capture karo."
                loading={faceEnrolling}
                onCapture={handleFaceCapture}
                trigger={
                  <Button type="button" disabled={faceEnrolling}>
                    {faceEnrolling ? <Loader2 className="size-4 animate-spin" /> : <ScanFace className="size-4" />}
                    {faceEnrolling ? "Enrolling..." : "Enroll face"}
                  </Button>
                }
              />
            )}
            <p className="text-xs text-muted-foreground">
              AI face service (UniFace) se embedding store hoti hai. Face check-in me sirf
              aapka apna face hi attendance mark kar sakta hai.
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSave} className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email ?? ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 00000 00000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rollNumber">Roll number</Label>
                <Input id="rollNumber" value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" type="number" min={1} max={12} value={form.semester} onChange={(e) => update("semester", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Input id="skills" value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" type="url" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="github">GitHub</Label>
                  <Input id="github" type="url" value={form.github} onChange={(e) => update("github", e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="A short intro about yourself..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              <Save className="size-4" />
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
