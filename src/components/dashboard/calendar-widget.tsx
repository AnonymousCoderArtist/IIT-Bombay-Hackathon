"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CalendarEvent = {
  title: string;
  date: string;
  meta: string;
};

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/events")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const list = (json.events ?? [])
          .filter((event: { startDate?: string }) => {
            if (!event.startDate) return false;
            return new Date(event.startDate).getTime() >= Date.now() - 24 * 60 * 60 * 1000;
          })
          .slice(0, 6)
          .map((event: { title: string; startDate: string; venue?: string }) => ({
            title: event.title,
            date: event.startDate,
            meta: event.venue ?? "",
          }));
        setEvents(list);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Upcoming events</h2>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarDays className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Koi upcoming event nahi hai.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <Card key={`${event.date}-${event.title}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                    📅
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.date)}
                      {event.meta ? ` · ${event.meta}` : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
