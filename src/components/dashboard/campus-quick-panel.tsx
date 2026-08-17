"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ROLE_SUGGESTIONS: Record<string, { text: string; href: string; link: string }[]> = {
  student: [
    { text: "Assignments ka deadline tracking ke liye due dates pehle check karo.", href: "/assignments", link: "Due dates dekho" },
    { text: "QR pass milna chahiye — registrations page pe download karo.", href: "/events", link: "Event passes" },
    { text: "Profile pe skills aur resume update rakho placements ke liye.", href: "/profile", link: "Profile update" },
  ],
  faculty: [
    { text: "Aaj ki classes ke liye attendance session create karna mat bhoolo.", href: "/attendance", link: "Session banayein" },
    { text: "Submissions review pending hain — grades jald daalo.", href: "/assignments", link: "Review karein" },
    { text: "Study material upload karke students ki madad karo.", href: "/materials", link: "Upload karein" },
  ],
  coordinator: [
    { text: "Naye events publish karte raho registrations badhane ke liye.", href: "/events", link: "Event banayein" },
    { text: "Placement openings ko check karo aur fresh post karo.", href: "/placements", link: "Openings dekho" },
    { text: "Clubs ki announcements update karna yaad rakho.", href: "/clubs", link: "Clubs manage" },
  ],
  admin: [
    { text: "Naye users ke role aur status verify karo.", href: "/admin/users", link: "Users manage" },
    { text: "Activity logs pe sensitive actions ka audit karo.", href: "/admin/logs", link: "Logs dekho" },
    { text: "Departments aur courses up-to-date rakho.", href: "/admin/academics", link: "Academics" },
  ],
};

export function CampusQuickPanel() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "student") as keyof typeof ROLE_SUGGESTIONS;
  const suggestions = ROLE_SUGGESTIONS[role] ?? [];

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-card via-surface/40 to-surface/20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lightbulb className="size-3.5" />
            </span>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary">
              Suggestions
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
              >
                <p className="text-sm leading-snug text-muted-foreground">{suggestion.text}</p>
                <Link
                  href={suggestion.href}
                  className="mt-0.5 shrink-0 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                >
                  {suggestion.link}
                </Link>
              </div>
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
