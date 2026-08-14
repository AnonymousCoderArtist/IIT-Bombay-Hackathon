"use client";

import Link from "next/link";
import { Rays } from "@/components/decor/rays";
import { Logo } from "@/components/logo";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_-5%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_85%_15%,color-mix(in_oklch,var(--violet-accent)_12%,transparent),transparent)]"
      />
      <Rays className="-z-10" />
      <DottedGlowBackground
        className="opacity-90"
        gap={26}
        radius={1.4}
        opacity={0.5}
        speedMin={0.4}
        speedMax={1.4}
        speedScale={0.8}
        colorLightVar="--color-foreground"
        glowColorLightVar="--color-primary"
        colorDarkVar="--color-foreground"
        glowColorDarkVar="--color-primary"
      />

      <Link href="/" className="relative mb-8 flex items-center gap-2.5 font-semibold">
        <Logo className="h-9 w-9" />
        <span className="font-heading text-base font-bold tracking-tight">
          Smart<span className="text-primary">Campus</span>
        </span>
      </Link>

      {children}
    </div>
  );
}
