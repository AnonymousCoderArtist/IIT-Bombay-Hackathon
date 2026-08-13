"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AuroraInput } from "@/components/ui/aurora-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthCard,
  BottomGradient,
  LabelInputContainer,
} from "@/components/auth/auth-card";

const roles = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "coordinator", label: "Coordinator" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      toast.success(data.message);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        title="Create your account"
        subtitle="Join your campus in minutes. Attendance, assignments, events sab ek jagah."
      >
        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="name">Full name</Label>
            <AuroraInput
              id="name"
              placeholder="Aarav Kumar"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              minLength={2}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <AuroraInput
              id="email"
              placeholder="you@college.edu"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <AuroraInput
              id="password"
              placeholder="At least 8 characters"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={8}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <Label htmlFor="role">I am a</Label>
            <Select value={form.role} onValueChange={(value) => update("role", value ?? "student")}>
              <SelectTrigger id="role" className="h-10 w-full rounded-md border-none bg-gray-50 dark:bg-zinc-800">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full bg-primary font-medium text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_2px_0_rgba(0,0,0,0.12)] transition-transform hover:brightness-105"
            type="submit"
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign up &rarr;
            </span>
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </form>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
