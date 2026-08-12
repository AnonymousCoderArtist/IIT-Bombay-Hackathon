"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Loader2, Search, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  semester?: number;
  rollNumber?: string;
  createdAt: string;
};

const roleBadge = {
  student: "bg-blue-500/10 text-blue-500",
  faculty: "bg-emerald-500/10 text-emerald-500",
  coordinator: "bg-purple-500/10 text-purple-500",
  admin: "bg-amber-500/10 text-amber-500",
} as const;

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadUsers(q = query, role = roleFilter) {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role !== "all") params.set("role", role);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    const delay = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, roleFilter, session]);

  async function updateRole(id: string, role: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    if (!res.ok) {
      toast.error("Role update fail ho gaya");
      return;
    }
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    toast.success("Role update ho gaya");
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast.error("Status update fail ho gaya");
      return;
    }
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status } : u)));
    toast.success("Status update ho gaya");
  }

  async function deleteUser(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Delete fail ho gaya");
        return;
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User delete ho gaya");
    } finally {
      setDeletingId(null);
    }
  }

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage roles and access across the campus.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or roll number..."
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="coordinator">Coordinators</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="size-10 text-muted-foreground" />
            <p className="font-medium">Koi user nahi mila</p>
            <p className="text-sm text-muted-foreground">Search ko tweak karke try karo.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y pt-0">
            {users.map((user) => (
              <div key={user._id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-40 flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <p className="hidden text-xs text-muted-foreground md:block">
                  {user.department || "—"}
                  {user.semester ? ` · Sem ${user.semester}` : ""}
                </p>

                <Badge className={roleBadge[user.role as keyof typeof roleBadge] ?? ""}>
                  {user.role}
                </Badge>

                <Badge
                  variant={user.status === "active" ? "outline" : "secondary"}
                  className="capitalize"
                >
                  {user.status}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                    <Shield className="size-3.5" />
                    Manage
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Change role</DropdownMenuLabel>
                      {["student", "faculty", "coordinator", "admin"].map((r) => (
                        <DropdownMenuItem
                          key={r}
                          className="capitalize"
                          onSelect={() => updateRole(user._id, r)}
                        >
                          {r}
                          {user.role === r && " ✓"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      {["active", "pending", "blocked"].map((s) => (
                        <DropdownMenuItem
                          key={s}
                          className="capitalize"
                          onSelect={() => updateStatus(user._id, s)}
                        >
                          {s}
                          {user.status === s && " ✓"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete {user.name}?</DialogTitle>
                      <DialogDescription>
                        Yeh action revert nahi ho sakta. User ka data permanently remove ho
                        jayega.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton>
                      <Button
                        variant="destructive"
                        onClick={() => deleteUser(user._id)}
                        disabled={deletingId === user._id}
                      >
                        {deletingId === user._id && <Loader2 className="size-4 animate-spin" />}
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
