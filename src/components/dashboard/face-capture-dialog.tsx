"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  title: string;
  description: string;
  trigger: React.ReactNode;
  loading?: boolean;
  onCapture: (image: string) => void;
};

export default function FaceCaptureDialog({ title, description, trigger, loading, onCapture }: Props) {
  const [open, setOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  useEffect(() => {
    return stopCamera;
  }, []);

  async function startCamera() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Is browser me camera supported nahi hai");
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = s;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      setError("Camera access nahi mila — permission allow karo");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    setOpen(false);
    onCapture(canvas.toDataURL("image/jpeg", 0.92));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          void startCamera();
        } else {
          stopCamera();
          setError("");
        }
      }}
    >
      <DialogTrigger render={<span />}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`aspect-square w-full ${cameraOn ? "block" : "hidden"}`}
            />
            {!cameraOn && (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-white/70">
                <ScanFace className="size-12" />
                <p className="text-sm">{error || "Camera starting..."}</p>
              </div>
            )}
          </div>

          <Button type="button" onClick={capture} disabled={!cameraOn || loading} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {loading ? "Processing..." : "Capture & continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
