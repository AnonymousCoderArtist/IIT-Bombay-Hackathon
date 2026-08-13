"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, CheckCheck, Loader2, FileText, CalendarCheck, Megaphone, Briefcase, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

const typeConfig = {
  assignment: { icon: FileText, label: "Assignment", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  attendance: { icon: CalendarCheck, label: "Attendance", className: "bg-emerald-500/10 text-emerald-500" },
  event: { icon: Megaphone, label: "Event", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  placement: { icon: Briefcase, label: "Placement", className: "bg-amber-500/10 text-amber-500" },
  alert: { icon: AlertTriangle, label: "Alert", className: "bg-red-500/10 text-red-500" },
  system: { icon: Info, label: "System", className: "bg-muted text-muted-foreground" },
} as const;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((json) => {
        setNotifications(json.notifications ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Sab read kar diya");
      }
    } finally {
      setMarkingAll(false);
    }
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<Bell className="size-5" />}
        title="Notifications"
        subtitle={
          unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up."
        }
        actions={
          unread > 0 && (
            <Button variant="outline" onClick={markAllRead} disabled={markingAll}>
              {markingAll ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
              Mark all read
            </Button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
        <EmptyState
          icon={Bell}
          title="Koi notification nahi"
          description="Deadlines, events aur placements ki updates yahan dikhengi."
        />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type as keyof typeof typeConfig] ?? typeConfig.system;
            const Icon = config.icon;

            return (
              <Link
                key={notification._id}
                href={notification.link ?? "#"}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`block rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated ${
                  notification.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <span className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
