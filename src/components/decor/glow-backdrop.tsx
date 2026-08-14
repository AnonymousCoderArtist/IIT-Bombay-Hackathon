"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { cn } from "@/lib/utils";

export function GlowBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)]" />
      <div className="absolute -top-32 left-[8%] size-[36rem] rounded-full bg-[#c5ae79]/10 blur-[140px]" />
      <div className="absolute top-[30%] right-[4%] size-[30rem] rounded-full bg-[#30363c]/40 blur-[130px]" />
      <div className="absolute bottom-[8%] left-[30%] size-[28rem] rounded-full bg-[#7c735c]/25 blur-[120px]" />
      <DottedGlowBackground
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
    </div>
  );
}
