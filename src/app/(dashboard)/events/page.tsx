"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Event = {
  _id: string;
  title: string;
  description?: string;
  venue?: string;
  startDate: string;
  registrationDeadline: string;
  seats: number;
  registeredCount: number;
  speakers: string[];
  status: string;
  isRegistered?: boolean;
};

export default function EventsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            {role === "admin" || role === "coordinator"
              ? "Manage campus events and registrations."
              : "Discover and register for campus events."}
          </p>
        </div>
        {(role === "admin" || role === "coordinator") && <CreateEventDialog />}
      </div>

      <EventList role={role} />
    </div>
  );
}

function EventList({ role }: { role: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((json) => {
        setEvents(json.events ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleRegister(eventId: string) {
    setRegisteringId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not register");
        return;
      }

      setQrData((prev) => ({ ...prev, [eventId]: data.qrDataUrl }));
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isRegistered: true } : e))
      );
      toast.success("Registered! Your QR pass is ready.");
    } finally {
      setRegisteringId(null);
    }
  }

  async function handleCancel(eventId: string) {
    try {
      const res = await fetch(`/api/events/${eventId}/cancel`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not cancel registration");
        return;
      }

      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, isRegistered: false } : e))
      );
      toast.success("Registration cancelled");
    } catch {
      toast.error("Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="font-medium">No events yet</p>
          <p className="text-sm text-muted-foreground">
            Upcoming campus events will show up here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => {
        const start = new Date(event.startDate);
        const isFull = event.seats > 0 && event.registeredCount >= event.seats;
        const isClosed = new Date(event.registrationDeadline) < new Date();
        const qrUrl = qrData[event._id];

        return (
          <Card key={event._id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    <Badge variant="outline" className="mr-1.5">
                      {event.status}
                    </Badge>
                    {start.toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {event.seats > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    <Users className="size-3" />
                    {event.registeredCount}/{event.seats}
                  </span>
                )}
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">
                {event.description || "No description provided."}
              </p>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                {event.venue && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {event.venue}
                  </p>
                )}
                {event.speakers.length > 0 && (
                  <p className="text-xs">Speakers: {event.speakers.join(", ")}</p>
                )}
              </div>

              {role === "student" ? (
                event.isRegistered ? (
                  <div className="space-y-3">
                    {qrUrl && (
                      <div className="flex justify-center rounded-lg bg-muted/40 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt={`QR pass for ${event.title}`}
                          className="size-40 rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCancel(event._id)}
                      >
                        Cancel registration
                      </Button>
                      {qrUrl && (
                        <a
                          href={qrUrl}
                          download={`${event.title.replace(/\s+/g, "-").toLowerCase()}-pass.png`}
                          className="flex flex-1 items-center justify-center rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          Download QR
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    disabled={isFull || isClosed || registeringId === event._id}
                    onClick={() => handleRegister(event._id)}
                  >
                    {registeringId === event._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Register"
                    )}
                    {isFull ? " — Full" : isClosed ? " — Closed" : ""}
                  </Button>
                )
              ) : (
                <p className="text-xs text-muted-foreground">
                  {event.registeredCount} registrations so far
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    startDate: "",
    registrationDeadline: "",
    seats: "",
    speakers: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          venue: form.venue,
          startDate: new Date(form.startDate),
          registrationDeadline: new Date(form.registrationDeadline),
          seats: form.seats ? Number(form.seats) : 0,
          speakers: form.speakers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not create event");
        return;
      }

      toast.success("Event created");
      setOpen(false);
      setForm({ title: "", description: "", venue: "", startDate: "", registrationDeadline: "", seats: "", speakers: "" });
      window.location.reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New event
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Set up a campus event with venue, seats and registration deadline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Tech Fest 2026"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="What is this event about?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="Main Auditorium"
                value={form.venue}
                onChange={(e) => update("venue", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                min={0}
                placeholder="200"
                value={form.seats}
                onChange={(e) => update("seats", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Starts at</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Registration deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => update("registrationDeadline", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="speakers">Speakers (comma separated)</Label>
            <Input
              id="speakers"
              placeholder="Dr. Sharma, Prof. Iyer"
              value={form.speakers}
              onChange={(e) => update("speakers", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Create event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
