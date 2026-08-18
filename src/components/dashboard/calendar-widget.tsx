"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
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
          .slice(0, 4)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <CalendarDays className="size-4" />
          </span>
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
              Campus calendar
            </p>
            <h2 className="font-heading text-lg tracking-tight">Upcoming events</h2>
          </div>
        </div>
      </div>

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
            <span className="flex size-11 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground">
              <CalendarDays className="size-5" />
            </span>
            <p className="text-sm text-muted-foreground">Koi upcoming event nahi hai.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {events.map((event) => (
            <Card key={`${event.date}-${event.title}`} className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated">
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      {formatDate(event.date)}
                      {event.meta && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5 truncate">
                            <MapPin className="size-3" />
                            {event.meta}
                          </span>
                        </>
                      )}
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
