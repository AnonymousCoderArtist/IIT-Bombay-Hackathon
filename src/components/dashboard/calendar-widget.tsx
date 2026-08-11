"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Megaphone, ClipboardList, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CalendarItem = {
  id: string;
  date: string;
  title: string;
  kind: "event" | "assignment" | "placement";
  link: string;
};

function dayLabel(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return target.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const kindMeta = {
  event: { icon: Megaphone, className: "bg-primary/10 text-primary" },
  assignment: { icon: ClipboardList, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  placement: { icon: Briefcase, className: "bg-green-500/10 text-green-600 dark:text-green-400" },
};

export function CalendarWidget() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 14 * 86400000);

    Promise.all([
      fetch("/api/events").then((r) => r.json()).catch(() => ({ events: [] })),
      fetch("/api/assignments").then((r) => r.json()).catch(() => ({ assignments: [] })),
      fetch("/api/placements").then((r) => r.json()).catch(() => ({ placements: [] })),
    ])
      .then(([eventJson, assignmentJson, placementJson]) => {
        const list: CalendarItem[] = [];

        for (const event of eventJson.events ?? []) {
          const date = new Date(event.startDate);
          if (date < now || date > limit) continue;
          list.push({
            id: event._id,
            date: event.startDate,
            title: event.title,
            kind: "event",
            link: `/events`,
          });
        }

        for (const assignment of assignmentJson.assignments ?? []) {
          const date = new Date(assignment.deadline);
          if (date < now || date > limit) continue;
          list.push({
            id: assignment._id,
            date: assignment.deadline,
            title: assignment.title,
            kind: "assignment",
            link: `/assignments/${assignment._id}`,
          });
        }

        for (const placement of placementJson.placements ?? []) {
          const date = new Date(placement.deadline);
          if (date < now || date > limit) continue;
          list.push({
            id: placement._id,
            date: placement.deadline,
            title: `${placement.company} — ${placement.jobRole}`,
            kind: "placement",
            link: `/placements`,
          });
        }

        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setItems(list.slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          Upcoming (next 14 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Next 2 weeks me koi deadline ya event nahi hai.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => {
              const meta = kindMeta[item.kind];
              const Icon = meta.icon;
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.link}
                    className="flex items-center gap-3 rounded-md py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.kind === "event"
                          ? "Event"
                          : item.kind === "assignment"
                            ? "Assignment deadline"
                            : "Application deadline"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                      {dayLabel(new Date(item.date))}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
