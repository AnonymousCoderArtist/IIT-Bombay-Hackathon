"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Moon, Sun, Monitor, LogOut, BellRing, Settings, Sparkles, KeyRound, Trash2, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
  const [publicProfile, setPublicProfile] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [pushPublicKey, setPushPublicKey] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [account, setAccount] = useState<{
    authProvider: string;
    email: string;
    name: string;
    image: string | null;
    googleConfigured: boolean;
  } | null>(null);

  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiHasKey, setAiHasKey] = useState(false);
  const [aiKeySuffix, setAiKeySuffix] = useState("");
  const [aiSaving, setAiSaving] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestMsg, setAiTestMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    fetch("/api/users/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.account) setAccount(json.account);
        const settings = json.settings;
        if (!settings) return;

        if (settings.notificationPrefs) {
          setNotificationPrefs((prev) => ({ ...prev, ...settings.notificationPrefs }));
        }
        if (typeof settings.emailOptIn === "boolean") {
          setEmailOptIn(settings.emailOptIn);
        }
        if (typeof settings.publicProfile === "boolean") {
          setPublicProfile(settings.publicProfile);
        }
        if (settings.pushSubscription) {
          setPushEnabled(true);
        }
        if (settings.theme) {
          setTheme(settings.theme);
        }
        if (settings.ai) {
          setAiProvider(settings.ai.provider === "gemini" ? "gemini" : "openai");
          setAiBaseUrl(settings.ai.baseUrl ?? "");
          setAiModel(settings.ai.model ?? "");
          setAiHasKey(Boolean(settings.ai.hasKey));
          setAiKeySuffix(settings.ai.keySuffix ?? "");
        } else {
          setAiHasKey(false);
          setAiKeySuffix("");
        }
      })
      .catch(() => undefined);

    fetch("/api/push/subscribe")
      .then((res) => res.json())
      .then((json) => {
        setPushConfigured(Boolean(json.configured));
        setPushPublicKey(json.vapidPublicKey ?? "");
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

  async function handleAiSave() {
    if (!aiModel.trim()) {
      toast.error("Model select karo");
      return;
    }
    if (aiProvider === "openai" && !aiBaseUrl.trim()) {
      toast.error("Base URL daalo (jaise https://api.openai.com/v1)");
      return;
    }
    if (!aiApiKey.trim() && !aiHasKey) {
      toast.error("API key daalo — pehli baar configure kar rahe ho");
      return;
    }
    setAiSaving(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai: {
            provider: aiProvider,
            baseUrl: aiProvider === "gemini" ? "" : aiBaseUrl.trim(),
            model: aiModel.trim(),
            apiKey: aiApiKey.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Save fail hua");
        return;
      }
      if (aiApiKey.trim()) setAiKeySuffix(aiApiKey.trim().slice(-4));
      setAiApiKey("");
      setAiHasKey(true);
      setAiTestMsg(null);
      toast.success(`${aiProvider === "gemini" ? "Gemini" : "AI provider"} save ho gaya`);
    } finally {
      setAiSaving(false);
    }
  }

  async function handleAiTest() {
    if (!aiModel.trim()) {
      toast.error("Model select karo");
      return;
    }
    if (aiProvider === "openai" && !aiBaseUrl.trim()) {
      toast.error("Base URL daalo");
      return;
    }
    setAiTesting(true);
    setAiTestMsg(null);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          baseUrl: aiProvider === "gemini" ? undefined : aiBaseUrl.trim(),
          model: aiModel.trim(),
          apiKey: aiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      setAiTestMsg({ ok: res.ok, text: data.message ?? (res.ok ? "Connected" : "Failed") });
    } catch {
      setAiTestMsg({ ok: false, text: "Test service unreachable" });
    } finally {
      setAiTesting(false);
    }
  }

  async function handleAiRemove() {
    setAiSaving(true);
    try {
      await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: null }),
      });
      setAiProvider("openai");
      setAiBaseUrl("");
      setAiModel("");
      setAiApiKey("");
      setAiHasKey(false);
      setAiKeySuffix("");
      setAiTestMsg(null);
      toast.success("AI provider remove ho gaya");
    } finally {
      setAiSaving(false);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function handlePushToggle(checked: boolean) {
    setPushBusy(true);
    try {
      if (!checked) {
        await fetch("/api/push/subscribe", { method: "DELETE" });
        setPushEnabled(false);
        toast.success("Push notifications disabled");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Is browser me push supported nahi hai");
        return;
      }

      if (!pushConfigured) {
        toast.error("VAPID keys set nahi hain — admin se setup karwao");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission deny ho gayi");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Subscribe fail hua");
        return;
      }

      setPushEnabled(true);
      toast.success("Push notifications enabled");
    } finally {
      setPushBusy(false);
    }
  }

  async function handleTestPush() {
    setPushBusy(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Test push fail hua");
        return;
      }
      toast.success(data.message ?? "Push bhej di gayi");
    } finally {
      setPushBusy(false);
    }
  }

  function togglePublicProfile(checked: boolean) {
    setPublicProfile(checked);
    saveSettings({ publicProfile: checked });
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
      <PageHeader
        icon={<Settings className="size-5" />}
        title="Settings"
        subtitle="Manage your account, appearance and preferences."
      />

        <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
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
                variant={mounted && theme === "light" ? "default" : "outline"}
                onClick={() => changeTheme("light")}
              >
                <Sun className="size-4" />
                Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                onClick={() => changeTheme("dark")}
              >
                <Moon className="size-4" />
                Dark
              </Button>
              <Button
                variant={mounted && (!theme || theme === "system") ? "default" : "outline"}
                onClick={() => changeTheme("system")}
              >
                <Monitor className="size-4" />
                System
              </Button>
              <span className="ml-2 self-center text-sm text-muted-foreground">
                Currently: {mounted ? resolvedTheme : "…"}
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected accounts</CardTitle>
              <CardDescription>
                Apne account se linked sign-in methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {account?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() ?? account?.email?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{account?.name ?? "Account"}</p>
                    <p className="text-xs text-muted-foreground">{account?.email ?? ""}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                  {account?.authProvider === "google" ? "Google" : "Email + Password"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Google sign-in</p>
                  <p className="text-xs text-muted-foreground">
                    {account?.googleConfigured
                      ? account?.authProvider === "google"
                        ? "Is account se Google login linked hai."
                        : "Google login se sign in karke is email ko link kar sakte ho."
                      : "Google OAuth configure nahi hai — admin se GOOGLE_CLIENT_ID/SECRET set karwao."}
                  </p>
                </div>
                {account?.googleConfigured ? (
                  <Badge variant={account?.authProvider === "google" ? "default" : "outline"}>
                    {account?.authProvider === "google" ? "Linked" : "Not linked"}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not configured</Badge>
                )}
              </div>
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

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-medium">Push notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {pushConfigured
                      ? "Browser me native notifications (Web Push)"
                      : "VAPID keys set nahi — admin se setup karwao"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {pushEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestPush}
                      disabled={pushBusy}
                    >
                      <BellRing className="size-4" />
                      Test push
                    </Button>
                  )}
                  <Switch
                    checked={pushEnabled}
                    onCheckedChange={(checked) => void handlePushToggle(checked)}
                    disabled={pushBusy}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI provider
              </CardTitle>
              <CardDescription>
                Apna AI provider lagao — <b>Gemini</b> (sirf API key + model select) ya koi bhi{" "}
                <b>OpenAI-compatible</b> endpoint (OpenAI, Groq, OpenRouter, Together, etc.). Iska
                use AI assistant, lecture notes generation aur audio transcription me hoga. API key
                sirf tumhare account me save hoti hai, kabhi server se wapas nahi bheji jaati.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiHasKey && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                  <KeyRound className="size-4 text-primary" />
                  <span className="text-muted-foreground">
                    {aiProvider === "gemini" ? "Gemini" : "OpenAI-compatible"} configured
                    {aiKeySuffix ? ` — key ends in ${aiKeySuffix}` : ""}. Naya key daalo to replace
                    hoga.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Provider</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={aiProvider === "gemini" ? "default" : "outline"}
                    onClick={() => {
                      setAiProvider("gemini");
                      setAiTestMsg(null);
                    }}
                    className="justify-start"
                  >
                    <Sparkles className="size-4" />
                    Gemini
                    <span className="ml-auto text-xs opacity-70">sirf API key chahiye</span>
                  </Button>
                  <Button
                    type="button"
                    variant={aiProvider === "openai" ? "default" : "outline"}
                    onClick={() => {
                      setAiProvider("openai");
                      setAiTestMsg(null);
                    }}
                    className="justify-start"
                  >
                    <PlugZap className="size-4" />
                    OpenAI-compatible
                    <span className="ml-auto text-xs opacity-70">base URL + key</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ai-model">
                  {aiProvider === "gemini" ? "Gemini model" : "Model name"}
                </Label>
                {aiProvider === "gemini" ? (
                  <Select value={aiModel} onValueChange={(v) => v && setAiModel(v)}>
                    <SelectTrigger id="ai-model" className="w-full">
                      <SelectValue placeholder="Model select karo" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEMINI_MODELS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="ai-model"
                    placeholder="gpt-4o-mini / llama-3.1-70b / deepseek-chat"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                  />
                )}
              </div>

              {aiProvider === "openai" && (
                <div className="space-y-1.5">
                  <Label htmlFor="ai-base-url">Base URL</Label>
                  <Input
                    id="ai-base-url"
                    type="url"
                    placeholder="https://api.openai.com/v1"
                    value={aiBaseUrl}
                    onChange={(e) => setAiBaseUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="ai-key">API key</Label>
                <Input
                  id="ai-key"
                  type="password"
                  placeholder={aiHasKey ? "Naya key daalo (optional)" : "sk-... / AIza..."}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleAiSave} disabled={aiSaving}>
                  {aiSaving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Save provider
                </Button>
                <Button variant="outline" onClick={handleAiTest} disabled={aiTesting}>
                  {aiTesting ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
                  Test connection
                </Button>
                {aiHasKey && (
                  <Button variant="destructive" onClick={handleAiRemove} disabled={aiSaving}>
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
              {aiTestMsg && (
                <p
                  className={`text-sm ${
                    aiTestMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                  }`}
                >
                  {aiTestMsg.ok ? "Connection OK — " : "Test fail — "}
                  {aiTestMsg.text}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Kaunsi cheezein dusre users ko dikhengi, control karo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Public profile</p>
                  <p className="text-xs text-muted-foreground">
                    Profile (naam, department, skills) dusre students aur faculty ko dikhe.
                  </p>
                </div>
                <Switch checked={publicProfile} onCheckedChange={togglePublicProfile} />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium">Data</p>
                <p className="text-xs text-muted-foreground">
                  Apna data delete karna ho to &quot;Danger zone&quot; tab me jao. Download koi option abhi
                  nahi hai.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log out</CardTitle>
              <CardDescription>Is device se apne account se sign out karo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                Log out
              </Button>
            </CardContent>
          </Card>

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
