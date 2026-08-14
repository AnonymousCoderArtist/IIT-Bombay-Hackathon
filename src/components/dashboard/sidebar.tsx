"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import LayoutDashboardIcon from "@/components/ui/layout-dashboard-icon";
import ClockIcon from "@/components/ui/clock-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import BookIcon from "@/components/ui/book-icon";
import BrainCircuitIcon from "@/components/ui/brain-circuit-icon";
import AlarmClockPlusIcon from "@/components/ui/alarm-clock-plus-icon";
import ChartBarIcon from "@/components/ui/chart-bar-icon";
import MessageCircleIcon from "@/components/ui/message-circle-icon";
import FilledBellIcon from "@/components/ui/filled-bell-icon";
import GearIcon from "@/components/ui/gear-icon";
import CameraIcon from "@/components/ui/camera-icon";
import FocusIcon from "@/components/ui/focus-icon";
import GlobeIcon from "@/components/ui/globe-icon";
import ArrowBackUpIcon from "@/components/ui/arrow-back-up-icon";
import { User } from "lucide-react";

const roleLinks: Record<string, { href: string; label: string; icon: typeof LayoutDashboardIcon }[]> = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/attendance", label: "Attendance", icon: ClockIcon },
    { href: "/assignments", label: "Assignments", icon: FileDescriptionIcon },
    { href: "/materials", label: "Materials", icon: BookIcon },
    { href: "/lecture-notes", label: "Lecture Notes", icon: FocusIcon },
    { href: "/assistant", label: "AI Assistant", icon: BrainCircuitIcon },
    { href: "/events", label: "Events", icon: AlarmClockPlusIcon },
    { href: "/placements", label: "Placements", icon: ChartBarIcon },
    { href: "/clubs", label: "Clubs", icon: MessageCircleIcon },
    { href: "/notices", label: "Notices", icon: FilledBellIcon },
  ],
  faculty: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/attendance", label: "Attendance", icon: CameraIcon },
    { href: "/assignments", label: "Assignments", icon: FileDescriptionIcon },
    { href: "/materials", label: "Materials", icon: BookIcon },
    { href: "/lecture-notes", label: "Lecture Notes", icon: FocusIcon },
    { href: "/assistant", label: "AI Assistant", icon: BrainCircuitIcon },
    { href: "/notices", label: "Notices", icon: FilledBellIcon },
    { href: "/events", label: "Events", icon: AlarmClockPlusIcon },
    { href: "/placements", label: "Placements", icon: ChartBarIcon },
    { href: "/clubs", label: "Clubs", icon: MessageCircleIcon },
  ],
  coordinator: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/events", label: "Events", icon: AlarmClockPlusIcon },
    { href: "/assignments", label: "Assignments", icon: FileDescriptionIcon },
    { href: "/placements", label: "Placements", icon: ChartBarIcon },
    { href: "/clubs", label: "Clubs", icon: MessageCircleIcon },
    { href: "/notices", label: "Notices", icon: FilledBellIcon },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/admin/users", label: "Users", icon: GlobeIcon },
    { href: "/admin/academics", label: "Academics", icon: BookIcon },
    { href: "/events", label: "Events", icon: AlarmClockPlusIcon },
    { href: "/placements", label: "Placements", icon: ChartBarIcon },
    { href: "/clubs", label: "Clubs", icon: MessageCircleIcon },
    { href: "/notices", label: "Notices", icon: FilledBellIcon },
    { href: "/admin/logs", label: "Activity Logs", icon: ArrowBackUpIcon },
  ],
};

const bottomLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/notifications", label: "Notifications", icon: FilledBellIcon },
  { href: "/assistant", label: "AI Assistant", icon: BrainCircuitIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: ComponentType<{ size?: number | string; className?: string }> }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
        active
          ? "bg-linear-to-r from-primary/15 to-primary/5 text-foreground"
          : "text-muted-foreground hover:translate-x-1 hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "transition-all duration-200",
          active ? "text-primary" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
        )}
      />
      {label}
    </Link>
  );
}

function NavGroup({ label, links }: { label: string; links: { href: string; label: string; icon: ComponentType<{ size?: number | string; className?: string }> }[] }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </p>
      {links.map((link) => (
        <NavItem key={link.href} {...link} />
      ))}
    </div>
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
          <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="font-heading text-base tracking-tight">
            Smart<span className="text-primary">Campus</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
          <NavGroup label="Overview" links={roleLinks[role].slice(0, 2)} />
          <NavGroup label="Manage" links={roleLinks[role].slice(2)} />
        </nav>

        <div className="space-y-4 border-t border-border px-3 py-3">
          <NavGroup label="Account" links={bottomLinks} />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-extrabold text-primary-foreground">
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
