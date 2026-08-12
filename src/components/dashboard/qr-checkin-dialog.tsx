"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function QrCheckInDialog({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(0);

  async function fetchToken() {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${sessionId}/checkin`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not generate QR");
        return;
      }
      setCode(data.code);
      setExpiresAt(data.expiresAt);
      const url = await QRCode.toDataURL(data.token, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setQrUrl(url);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [open]);

  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) fetchToken();
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <QrCode className="size-4" />
        QR check-in
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR check-in</DialogTitle>
          <DialogDescription>
            Students isse scan karke apni attendance mark karenge. QR 10 minute ke liye valid
            hai — timeout pe refresh karna.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : qrUrl ? (
            <div className="rounded-xl border bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR check-in code" width={240} height={240} />
            </div>
          ) : (
            <p className="py-16 text-sm text-muted-foreground">QR generate nahi hua.</p>
          )}

          <div className="w-full space-y-1.5">
            <Label htmlFor="checkin-code">Manual code (camera na chale toh paste karo)</Label>
            <div className="flex gap-2">
              <Input id="checkin-code" readOnly value={code} className="flex-1 font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(code).then(() => toast.success("Code copied"));
                }}
                aria-label="Copy check-in code"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {remaining > 0
              ? `Valid for ${minutes}:${seconds.toString().padStart(2, "0")}`
              : "Expired — QR refresh karo"}
          </p>

          <Button type="button" onClick={fetchToken} disabled={loading} className="w-full">
            Refresh QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
