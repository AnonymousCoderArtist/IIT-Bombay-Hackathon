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

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please sign up again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Invalid code");
        return;
      }

      toast.success(data.message);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);

    try {
      const res = await fetch("/api/auth/register/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not resend code");
        return;
      }

      setResent(true);
      toast.success("Verification code sent again");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        title="Verify your email"
        subtitle={
          <>
            We sent a 6-digit code to <span className="font-medium">{email || "your email"}</span>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <LabelInputContainer>
            <Label htmlFor="code">Verification code</Label>
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

          <GradientSubmitButton
            label="Verify email"
            loading={loading}
            disabled={code.length !== 6}
          />
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {resent ? (
            <p>Code resent. Check your inbox.</p>
          ) : (
            <>
              Did not get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-medium text-neutral-900 hover:underline dark:text-white"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
