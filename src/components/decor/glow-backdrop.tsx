"use client";

import { cn } from "@/lib/utils";

export function GlowBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-15%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_70%)]" />
      <div className="absolute -top-48 right-[-12%] size-[36rem] rounded-full bg-[#c5ae79]/12 blur-[160px]" />
      <div className="absolute top-[25%] left-[-10%] size-[32rem] rounded-full bg-[#7c735c]/15 blur-[160px]" />
      <div className="absolute bottom-[-20%] right-[15%] size-[30rem] rounded-full bg-[#30363c]/60 blur-[150px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,oklch(0.05_0.01_60/0.4)_100%)]" />
    </div>
  );
}
