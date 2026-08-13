"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanFace, Upload } from "lucide-react";
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

type Mode = "camera" | "upload";

export default function FaceCaptureDialog({ title, description, trigger, loading, onCapture }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("camera");
  const [cameraOn, setCameraOn] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Sirf image file upload karo (JPG/PNG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image 10MB se bada nahi ho sakta");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function useUploadedImage() {
    if (!preview) return;
    setOpen(false);
    setPreview("");
    onCapture(preview);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setMode("camera");
          setPreview("");
          setError("");
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "camera" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("camera");
                setPreview("");
                setError("");
                if (!cameraOn) void startCamera();
              }}
            >
              <Camera className="size-4" />
              Camera
            </Button>
            <Button
              type="button"
              variant={mode === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMode("upload");
                stopCamera();
                setError("");
                fileRef.current?.click();
              }}
            >
              <Upload className="size-4" />
              Upload photo
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-xl border bg-black">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {mode === "upload" ? (
              preview ? (
                <img src={preview} alt="Selected face" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-white/70">
                  <Upload className="size-12" />
                  <p className="text-sm">{error || "Image select karo (JPG/PNG)"}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose file
                  </Button>
                </div>
              )
            ) : (
              <>
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
              </>
            )}
          </div>

          {mode === "camera" ? (
            <Button type="button" onClick={capture} disabled={!cameraOn || loading} className="w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              {loading ? "Processing..." : "Capture & continue"}
            </Button>
          ) : (
            <Button type="button" onClick={useUploadedImage} disabled={!preview || loading} className="w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {loading ? "Processing..." : "Use this photo"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
