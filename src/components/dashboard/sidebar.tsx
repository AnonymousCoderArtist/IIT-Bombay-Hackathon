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
} from "lucide-react";
import { cn } from "@/lib/utils";

const roleLinks = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: CalendarDays },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/materials", label: "Materials", icon: BookOpen },
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
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "student") as keyof typeof roleLinks;

  const links = [...roleLinks[role], ...bottomLinks];

  return (
    <aside
      className={cn(
        "w-60 shrink-0 border-r bg-card",
        mobile ? "flex h-full flex-col" : "hidden md:flex md:flex-col"
      )}
    >
      <div className={cn(mobile ? "flex h-full flex-col" : "sticky top-0 flex h-screen flex-col")}>
        <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          Smart Campus
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 text-xs text-muted-foreground">
          <p className="font-medium capitalize text-foreground">{role}</p>
          <p className="mt-0.5">{session?.user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
