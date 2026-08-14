"use client";

import { cn } from "@/lib/utils";

export function GlowBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_-12%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]" />
      <div className="absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[#c5ae79]/8 blur-[160px]" />
      <div className="absolute bottom-[-15%] left-[-8%] size-[30rem] rounded-full bg-[#30363c]/50 blur-[150px]" />
    </div>
  );
}
