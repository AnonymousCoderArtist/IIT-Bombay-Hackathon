import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
  accent?: "primary" | "cyan" | "violet" | "emerald" | "amber";
};

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  cyan: "bg-primary/10 text-primary dark:text-primary",
  violet: "bg-primary/15 text-primary dark:text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function StatCard({ title, value, icon: Icon, hint, loading, accent = "primary" }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-elevated">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
            ACCENT_CLASSES[accent]
          )}
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
