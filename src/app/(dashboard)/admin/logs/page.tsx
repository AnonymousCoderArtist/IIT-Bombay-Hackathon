"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Log = {
  _id: string;
  action: string;
  targetResource?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
};

const actionLabels: Record<string, string> = {
  login: "Login",
  register: "Register",
  create_event: "Created event",
  create_placement: "Posted placement",
  create_assignment: "Created assignment",
  apply_placement: "Applied to placement",
  register_event: "Registered for event",
  mark_attendance: "Marked attendance",
  update_user: "Updated user",
  delete_user: "Deleted user",
};

export default function AdminLogsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((res) => res.json())
      .then((json) => {
        setLogs(json.logs ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (session?.user && session.user.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          A recent trail of important actions on the platform.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ScrollText className="size-10 text-muted-foreground" />
            <p className="font-medium">Abhi tak koi activity nahi</p>
            <p className="text-sm text-muted-foreground">
              Jaise hi users kuch karenge, logs yahan dikhenge.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y pt-0">
            {logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 py-4">
                <div className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {log.userId?.name ?? "Unknown user"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {actionLabels[log.action] ?? log.action.replace(/_/g, " ")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.userId?.email ?? "—"} · {log.targetResource || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                  {log.userId?.role && (
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {log.userId.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
