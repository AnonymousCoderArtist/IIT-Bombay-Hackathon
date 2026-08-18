"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CampusQuickPanel() {
  return (
    <Card className="relative h-full overflow-hidden border-primary/10 bg-gradient-to-br from-primary/10 via-card to-surface/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
      <CardContent className="flex h-full flex-col justify-center p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </span>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Smart tip
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          AI Assistant se doubt pucho, notes generate karo aur reminders set karo — sab ek jagah.
        </p>
        <Link
          href="/assistant"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          Try AI Assistant
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
