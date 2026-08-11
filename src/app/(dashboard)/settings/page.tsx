"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changing, setChanging] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    assignment: true,
    attendance: true,
    event: true,
    placement: true,
  });
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/users/settings")
      .then((res) => res.json())
      .then((json) => {
        const settings = json.settings;
        if (!settings) return;

        if (settings.notificationPrefs) {
          setNotificationPrefs((prev) => ({ ...prev, ...settings.notificationPrefs }));
        }
        if (typeof settings.emailOptIn === "boolean") {
          setEmailOptIn(settings.emailOptIn);
        }
        if (settings.theme) {
          setTheme(settings.theme);
        }
      })
      .catch(() => undefined);
  }, [setTheme]);

  function saveSettings(patch: Record<string, unknown>) {
    fetch("/api/users/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => undefined);
  }

  function changeTheme(next: string) {
    setTheme(next);
    saveSettings({ theme: next });
  }

  function togglePref(key: string, checked: boolean) {
    setNotificationPrefs((prev) => ({ ...prev, [key]: checked }));
    saveSettings({ notificationPrefs: { [key]: checked } });
  }

  function toggleEmail(checked: boolean) {
    setEmailOptIn(checked);
    saveSettings({ emailOptIn: checked });
  }

  function updatePassword(field: string, value: string) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChanging(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not change password");
        return;
      }

      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setChanging(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not delete account");
        return;
      }

      toast.success("Account deleted");
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, appearance and preferences.</p>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Pick how Smart Campus looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => changeTheme("light")}
              >
                <Sun className="size-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => changeTheme("dark")}
              >
                <Moon className="size-4" />
                Dark
              </Button>
              <Button
                variant={(!theme || theme === "system") ? "default" : "outline"}
                onClick={() => changeTheme("system")}
              >
                <Monitor className="size-4" />
                System
              </Button>
              <span className="ml-2 self-center text-sm text-muted-foreground">
                Currently: {resolvedTheme}
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong password you do not use elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="max-w-sm space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current">Current password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => updatePassword("currentPassword", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new">New password</Label>
                  <Input
                    id="new"
                    type="password"
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) => updatePassword("newPassword", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => updatePassword("confirmPassword", e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={changing}>
                  {changing && <Loader2 className="size-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["assignment", "Assignments"],
                  ["attendance", "Attendance"],
                  ["event", "Events"],
                  ["placement", "Placements"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified about {label.toLowerCase()} updates
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs[key]}
                    onCheckedChange={(checked) => togglePref(key, checked)}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-medium">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates in your inbox</p>
                </div>
                <Switch checked={emailOptIn} onCheckedChange={toggleEmail} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Delete account</CardTitle>
              <CardDescription>
                This permanently deletes your account and all your data. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
