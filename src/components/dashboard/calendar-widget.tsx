import { useEffect, useRef, useState } from "react";

type CalendarEvent = {
  title: string;
  date: string;
  time: string;
  type: "event" | "deadline" | "session";
  isUpcoming?: boolean;
};

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock upcoming events for demonstration
    const mockEvents: CalendarEvent[] = [
      { title: "Mood Indigo Festival", date: "2026-08-20", time: "10:00 AM", type: "event", isUpcoming: true },
      { title: "DBMS Assignment Due", date: "2026-08-22", time: "3:00 PM", type: "deadline", isUpcoming: true },
      { title: "Attendance Session", date: "2026-08-24", time: "9:00 AM", type: "session", isUpcoming: true },
      { title: "Placement Talk", date: "2026-08-30", time: "2:00 PM", type: "event", isUpcoming: true },
      { title: "Research Seminar", date: "2026-09-05", time: "11:00 AM", type: "event", isUpcoming: true },
      { title: "Exam", date: "2026-09-15", time: "9:00 AM", type: "event", isUpcoming: true },
      { title: "Assignment: React", date: "2026-08-28", time: "5:00 PM", type: "deadline", isUpcoming: true },
    ];
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const getEventIcon = (type: string) => {
    if (type === "event") return <span className="text-primary">📅</span>;
    if (type === "deadline") return <span className="text-amber-500">⚠️</span>;
    return <span className="text-blue-500">🏫</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Upcoming Events</h2>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-3">
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((evt) => (
            <Card key={evt.date}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">{getEventIcon(evt.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{evt.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(evt.date)} · {formatTime(evt.time)}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{evt.type === "deadline" ? "Due" : "Upcoming"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
