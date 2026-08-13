"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { AuroraInput } from "@/components/ui/aurora-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard, GradientSubmitButton, LabelInputContainer } from "@/components/auth/auth-card";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      toast.success("Reset code sent to your email");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="Forgot password" subtitle="Enter your email and we will send you a reset code">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <AuroraInput
              id="email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </LabelInputContainer>

          <GradientSubmitButton label="Send reset code" loading={loading} />
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Remembered it?{" "}
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
