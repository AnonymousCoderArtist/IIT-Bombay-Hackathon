"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Plus, Users, Sparkles } from "lucide-react";
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

type Club = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  memberCount: number;
  isMember: boolean;
};

export default function ClubsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "student";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  function load() {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((json) => {
        setClubs(json.clubs ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggle(club: Club) {
    setToggling(club._id);
    try {
      const res = await fetch(`/api/clubs/${club._id}`, {
        method: club.isMember ? "DELETE" : "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not update membership");
        return;
      }

      setClubs((prev) =>
        prev.map((c) =>
          c._id === club._id
            ? { ...c, isMember: !club.isMember, memberCount: data.memberCount }
            : c
        )
      );
      toast.success(club.isMember ? "Club leave kar diya" : "Club join ho gaya!");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clubs</h1>
          <p className="text-muted-foreground">
            {role === "admin" || role === "coordinator" || role === "faculty"
              ? "Manage campus clubs and memberships."
              : "Join clubs and be part of campus life."}
          </p>
        </div>
        {(role === "admin" || role === "coordinator" || role === "faculty") && (
          <CreateClubDialog onCreated={load} />
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : clubs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Sparkles className="size-10 text-muted-foreground" />
            <p className="font-medium">Abhi koi club nahi</p>
            <p className="text-sm text-muted-foreground">
              Campus clubs yahan dikhenge aur aap unse jud sakte ho.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clubs.map((club) => (
            <Card key={club._id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{club.name}</p>
                    {club.category && (
                      <Badge variant="outline" className="mt-1">
                        {club.category}
                      </Badge>
                    )}
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    <Users className="size-3" />
                    {club.memberCount}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {club.description || "No description yet."}
                </p>

                {role === "student" ? (
                  <Button
                    variant={club.isMember ? "outline" : "default"}
                    className="w-full"
                    disabled={toggling === club._id}
                    onClick={() => toggle(club)}
                  >
                    {toggling === club._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : club.isMember ? (
                      "Leave club"
                    ) : (
                      "Join club"
                    )}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {club.memberCount} member{club.memberCount === 1 ? "" : "s"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateClubDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not create club");
        return;
      }

      toast.success("Club ban gaya!");
      setOpen(false);
      setForm({ name: "", description: "", category: "" });
      onCreated();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New club
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a club</DialogTitle>
          <DialogDescription>
            Ek naya campus club register karo jisse students join kar sakein.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Club name</Label>
            <Input
              id="name"
              placeholder="Coding Club"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Technical / Cultural / Sports"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Club kya karta hai, kiske liye hai..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="size-4 animate-spin" />}
              Create club
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
