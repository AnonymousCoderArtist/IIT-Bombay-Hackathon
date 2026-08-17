"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ROLE_POINTS: Record<string, { label: string; href: string }[]> = {
  student: [
    { label: "View attendance", href: "/attendance" },
    { label: "Browse events", href: "/events" },
    { label: "See placements", href: "/placements" },
  ],
  faculty: [
    { label: "Take attendance", href: "/attendance" },
    { label: "Create assignment", href: "/assignments" },
  ],
  coordinator: [
    { label: "Manage events", href: "/events" },
    { label: "Create placement", href: "/placements" },
  ],
  admin: [
    { label: "Manage users", href: "/admin/users" },
    { label: "View logs", href: "/admin/logs" },
  ],
};

export function CampusQuickPanel() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "student") as keyof typeof ROLE_POINTS;
  const points = ROLE_POINTS[role] ?? [];

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-card via-surface/40 to-surface/20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="p-4">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
            Quick access
          </p>
          <div className="mt-3 space-y-2">
            {points.map((point, i) => (
              <Link
                key={point.href}
                href={point.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm font-medium transition-all duration-200",
                  "hover:translate-x-0.5 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary">
                    {i + 1}
                  </span>
                  {point.label}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-primary/10 via-card to-surface/30">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-3.5" />
            </span>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Smart tip
            </p>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            AI Assistant se doubt pucho, lecture notes generate karo aur apne schedule ke hisaab se
            reminders set karo — sab kuch ek jagah.
          </p>
          <Link
            href="/assistant"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Try AI Assistant
            <ArrowRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
