"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_-5%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[10%] size-[30rem] rounded-full bg-[#c5ae79]/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] right-[5%] size-[26rem] rounded-full bg-[#30363c]/40 blur-[130px]"
      />
      <DottedGlowBackground
        className="opacity-90"
        gap={26}
        radius={1.4}
        opacity={0.4}
        speedMin={0.4}
        speedMax={1.4}
        speedScale={0.8}
        colorLightVar="--color-foreground"
        glowColorLightVar="--color-primary"
        colorDarkVar="--color-foreground"
        glowColorDarkVar="--color-primary"
      />

      <Link href="/" className="relative mb-8 flex items-center gap-2.5">
        <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
        <span className="font-heading text-base tracking-tight">
          Smart<span className="text-primary">Campus</span>
        </span>
      </Link>

      {children}
    </div>
  );
}
