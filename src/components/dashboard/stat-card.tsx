import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
  accent?: "primary" | "cyan" | "violet" | "emerald" | "amber";
};

export function StatCard({ title, value, icon: Icon, hint, loading }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-colors duration-300 hover:border-primary/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-transform duration-300 group-hover:scale-105">
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
      </CardContent>
    </Card>
  );
}
