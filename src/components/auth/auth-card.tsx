"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomGradient() {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
}

export function GradientSubmitButton({
  label,
  loading,
  disabled,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group/btn relative block h-10 w-full rounded-lg bg-primary font-medium text-primary-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_2px_0_rgba(0,0,0,0.12)] transition-all hover:brightness-105 hover:shadow-[0_4px_16px_color-mix(in_oklch,var(--primary)_30%,transparent)] disabled:opacity-60"
    >
      <span className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {label}
      </span>
      <BottomGradient />
    </button>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-xl border border-border/70 bg-card/90 p-6 shadow-elevated backdrop-blur-xl md:p-8">
      <div className="relative">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Smart Campus
        </span>
        <h2 className="mt-2 text-2xl font-heading tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
}

export function GoogleButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group/btn relative flex h-10 w-full items-center justify-start space-x-2 rounded-lg border border-border bg-surface px-4 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
      type="button"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin text-foreground" />
      ) : (
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="text-sm text-foreground">{label}</span>
      <BottomGradient />
    </button>
  );
}
