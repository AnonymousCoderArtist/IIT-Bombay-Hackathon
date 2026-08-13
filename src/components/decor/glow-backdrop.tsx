"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { cn } from "@/lib/utils";

export function GlowBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_85%_10%,color-mix(in_oklch,var(--violet-accent)_10%,transparent),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_10%_85%,color-mix(in_oklch,var(--cyan-accent)_8%,transparent),transparent)]" />
      <DottedGlowBackground
        gap={26}
        radius={1.4}
        opacity={0.45}
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
