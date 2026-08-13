"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Briefcase,
  User,
  Settings,
  Bell,
  Users,
  ScrollText,
  Megaphone,
  Sparkles,
  FileWarning,
  BookOpen,
  Mic,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roleLinks = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: CalendarDays },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/materials", label: "Materials", icon: BookOpen },
    { href: "/lecture-notes", label: "Lecture Notes", icon: Mic },
    { href: "/assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/events", label: "Events", icon: Megaphone },
    { href: "/placements", label: "Placements", icon: Briefcase },
    { href: "/clubs", label: "Clubs", icon: Sparkles },
    { href: "/notices", label: "Notices", icon: FileWarning },
  ],
  faculty: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: CalendarDays },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/materials", label: "Materials", icon: BookOpen },
    { href: "/lecture-notes", label: "Lecture Notes", icon: Mic },
    { href: "/assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/notices", label: "Notices", icon: FileWarning },
    { href: "/events", label: "Events", icon: Megaphone },
    { href: "/placements", label: "Placements", icon: Briefcase },
    { href: "/clubs", label: "Clubs", icon: Sparkles },
  ],
  coordinator: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "Events", icon: Megaphone },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/placements", label: "Placements", icon: Briefcase },
    { href: "/clubs", label: "Clubs", icon: Sparkles },
    { href: "/notices", label: "Notices", icon: FileWarning },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/academics", label: "Academics", icon: BookOpen },
    { href: "/events", label: "Events", icon: Megaphone },
    { href: "/placements", label: "Placements", icon: Briefcase },
    { href: "/clubs", label: "Clubs", icon: Sparkles },
    { href: "/notices", label: "Notices", icon: FileWarning },
    { href: "/admin/logs", label: "Activity Logs", icon: ScrollText },
  ],
};

const bottomLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LayoutDashboard }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-linear-to-r from-primary/15 to-primary/5 text-foreground"
          : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-4 transition-all duration-200",
          active ? "text-primary" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
        )}
      />
      {label}
    </Link>
  );
}

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "student") as keyof typeof roleLinks;

  return (
    <aside
      className={cn(
        "w-60 shrink-0 border-r border-border bg-sidebar",
        mobile ? "flex h-full flex-col" : "hidden md:flex md:flex-col"
      )}
    >
      <div className={cn(mobile ? "flex h-full flex-col" : "sticky top-0 flex h-screen flex-col")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
          <span className="relative flex size-9 items-center justify-center bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-heading text-base font-bold tracking-tight">
            Smart<span className="text-primary">Campus</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {roleLinks[role].map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-3">
          {bottomLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <span className="flex size-8 shrink-0 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
              {(session?.user?.name ?? "U")
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium capitalize text-foreground">{role}</p>
              <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
