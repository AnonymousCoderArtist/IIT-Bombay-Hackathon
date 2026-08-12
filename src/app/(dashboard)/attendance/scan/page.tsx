"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ScanLine, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const DETECTOR: BarcodeDetector | null =
  typeof window !== "undefined" && "BarcodeDetector" in window
    ? new window.BarcodeDetector!({ formats: ["qr_code"] })
    : null;

type ScanState = "idle" | "scanning" | "success" | "error";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const [state, setState] = useState<ScanState>("idle");
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("");

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
  }

  useEffect(() => {
    return stopCamera;
  }, []);

  async function submitToken(token: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      const res = await fetch("/api/attendance/qr-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Check-in failed");
        submittedRef.current = false;
        return;
      }

      setState("success");
      setMessage(data.message ?? "Attendance marked!");
      if (data.alreadyMarked) {
        toast.info(data.message);
      } else {
        toast.success(data.message);
      }
      stopCamera();
      setTimeout(() => router.push("/attendance"), 1800);
    } catch {
      setState("error");
      setMessage("Check-in request fail ho gaya");
      submittedRef.current = false;
    }
  }

  async function startScan() {
    if (!DETECTOR) {
      toast.error("Is browser me QR scanning supported nahi hai — manual code use karo");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera access available nahi — manual code use karo");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("scanning");

      const loop = async () => {
        if (!videoRef.current || submittedRef.current) return;
        try {
          const codes = await DETECTOR.detect(videoRef.current);
          if (codes.length > 0 && codes[0].rawValue) {
            void submitToken(codes[0].rawValue);
            return;
          }
        } catch {
          // frame skip
        }
        loopRef.current = requestAnimationFrame(loop);
      };
      loopRef.current = requestAnimationFrame(loop);
    } catch {
      setState("error");
      setMessage("Camera permission denied");
    }
  }

  function stopScan() {
    stopCamera();
    setState("idle");
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = manualCode.trim();
    if (token.length < 10) {
      toast.error("Sahi code paste karo");
      return;
    }
    await submitToken(token);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Attendance Check-in</h1>
        <p className="text-muted-foreground">
          Faculty ka QR code scan karo (ya manual code paste karo) — attendance turant mark
          ho jayegi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`aspect-square w-full max-w-sm rounded-xl border bg-black ${
                state === "scanning" ? "block" : "hidden"
              }`}
            />

            {state === "success" && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <CheckCircle2 className="size-14 text-green-500" />
                <p className="text-lg font-semibold text-green-600">Attendance marked!</p>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            )}

            {state === "error" && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <XCircle className="size-14 text-destructive" />
                <p className="text-lg font-semibold text-destructive">Check-in fail</p>
                <p className="text-sm text-muted-foreground">{message}</p>
                <Button variant="outline" onClick={() => setState("idle")}>
                  Try again
                </Button>
              </div>
            )}

            {state === "idle" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <ScanLine className="size-14 text-muted-foreground" />
                <p className="font-medium">Camera se QR scan karo</p>
                <p className="text-sm text-muted-foreground">
                  {DETECTOR
                    ? "QR ko camera frame ke andar rakho — auto detect ho jayega."
                    : "Is browser me scan supported nahi — manual code option use karo."}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {state === "scanning" ? (
                <Button variant="destructive" onClick={stopScan}>
                  Stop camera
                </Button>
              ) : (
                <Button onClick={startScan} disabled={state === "success"}>
                  <ScanLine className="size-4" />
                  Start scanning
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="font-medium">Manual code entry</p>
            <p className="text-sm text-muted-foreground">
              Camera na chale toh faculty se code leke yahan paste karo.
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="manual-code">Check-in code</Label>
                <Input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste karo check-in code..."
                  className="font-mono text-xs"
                  disabled={state === "success"}
                />
              </div>
              <Button type="submit" disabled={state === "success" || manualCode.trim().length < 10}>
                {state === "success" ? <CheckCircle2 className="size-4" /> : <Loader2 className="size-4" />}
                Submit check-in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
