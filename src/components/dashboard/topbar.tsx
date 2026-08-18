"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, Monitor, Moon, Sun, User, Settings } from "lucide-react";
import FilledBellIcon from "@/components/ui/filled-bell-icon";
import LogoutIcon from "@/components/ui/logout-icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/dashboard/command-search";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Change theme" className="relative">
            {mounted && resolvedTheme === "dark" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          {options.map((option) => {
            const Icon = option.icon;
            const active = mounted && resolvedTheme === option.value;
            return (
              <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
                <Icon className={cn("size-4", active && "text-primary")} />
                {option.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUnread(data.unreadCount ?? 0);
      })
      .catch(() => undefined);

    const es = new EventSource("/api/notifications/stream");
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { unreadCount: number };
        if (!cancelled) setUnread(data.unreadCount);
      } catch {
        // ignore malformed frames
      }
    };
    es.onerror = () => {
      if (!cancelled) es.close();
    };

    return () => {
      cancelled = true;
      es.close();
    };
  }, []);

  async function handleSignOut() {
    await signOut({ redirect: false });
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  const initials = (session?.user?.name ?? "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="group/btn md:hidden transition-transform duration-200 hover:scale-105 hover:bg-muted"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5 transition-transform duration-200 group-hover/btn:scale-110" />
      </Button>

      <CommandSearch />

      <div className="ml-auto flex items-center gap-1.5">
        {mounted && <ThemeToggle />}

        <Link
          href="/notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <FilledBellIcon size={20} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg px-1.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Avatar className="size-8">
                  {session?.user?.image ? (
                    <AvatarImage src={session.user.image} alt={session.user.name ?? "User"} />
                  ) : (
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden max-w-28 truncate sm:block">{session?.user?.name}</span>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <p className="truncate">{session?.user?.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {session?.user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/profile" />}>
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogoutIcon size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
