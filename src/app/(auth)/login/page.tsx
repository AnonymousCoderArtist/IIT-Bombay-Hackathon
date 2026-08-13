"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AuroraInput } from "@/components/ui/aurora-input";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthCard,
  BottomGradient,
  GoogleButton,
  LabelInputContainer,
} from "@/components/auth/auth-card";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        toast.error("Please verify your email first");
        return;
      }

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <AuthShell>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your campus account to continue."
      >
        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <AuroraInput
              id="email"
              placeholder="you@college.edu"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Forgot password?
              </Link>
            </div>
            <AuroraInput
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full bg-primary font-medium text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_2px_0_rgba(0,0,0,0.12)] transition-transform hover:brightness-105"
            type="submit"
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign in &rarr;
            </span>
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-4">
            <GoogleButton
              label="Continue with Google"
              loading={googleLoading}
              onClick={handleGoogle}
            />
          </div>
        </form>

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-neutral-900 hover:underline dark:text-white"
          >
            Create one
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
