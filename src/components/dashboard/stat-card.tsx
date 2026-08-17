import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  progress?: number;
  loading?: boolean;
};

export function StatCard({ title, value, icon: Icon, hint, progress, loading }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-primary/10 bg-gradient-to-br from-card to-surface/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/8 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40">
            <Icon className="size-3.5" />
          </span>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-11 w-28" />
        ) : (
          <p className="mt-3 font-heading text-4xl font-extrabold tracking-tight tabular-nums">
            {value}
          </p>
        )}
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        {progress !== undefined && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary/40 via-primary to-primary/70 transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[0.7rem] font-medium text-primary">{progress}% complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
