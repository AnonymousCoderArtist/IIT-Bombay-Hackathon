"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { AuroraInput } from "@/components/ui/aurora-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard, GradientSubmitButton, LabelInputContainer } from "@/components/auth/auth-card";

export const dynamic = "force-dynamic";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email) {
      toast.error("Email is missing. Please start again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not reset password");
        return;
      }

      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        title="Set a new password"
        subtitle="Enter the code from your email and a new password"
      >
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <LabelInputContainer>
            <Label htmlFor="code">Reset code</Label>
            <AuroraInput
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center text-lg tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">New password</Label>
            <AuroraInput
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="confirm">Confirm password</Label>
            <AuroraInput
              id="confirm"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </LabelInputContainer>

          <GradientSubmitButton label="Reset password" loading={loading} />
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <Link
            href="/login"
            className="font-medium text-neutral-900 hover:underline dark:text-white"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
