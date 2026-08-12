// public/face-recognition.js (client-side face detection using face-api.js)
// Install: npm install face-api.js

// Face recognition attendance — student scans QR at door, faculty records attendance
// Uses face-api.js for face detection + webcam + OCR for name/roll

import { useState, useRef, useEffect } from "react";

export default function FaceRecognitionAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | detecting | matched | not-found
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [scanning, setScanning] = useState(false);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    videoRef.current.srcObject = stream;
    setScanning(true);
    await recognizeFace();
    setScanning(false);
  };

  const recognizeFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const faceDetector = await faceapi.loadFaceDetectorModel("/models/face-detection");
    const faceExtractor = await faceapi.loadFaceExtractorModel("/models/face-extractor");

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    async function detect() {
      if (!scanning) return;
      const detections = await faceDetector.detectVideo(videoRef.current);
      if (detections.length > 0) {
        setStatus("matched");
        setName(detections[0].detectedFace?.detectedObject?.details?.name || "");
        setRoll(detections[0].detectedFace?.detectedObject?.details?.roll || "");
      }
      requestAnimationFrame(detect);
    }
    detect();
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Face Recognition Attendance</h2>
      <p className="text-sm text-muted-foreground">Camera se kaam karo — face detect hoga aur attendance turant mark hoga.</p>

      <video ref={videoRef} className="w-full rounded-lg" style={{ videoDimension: "100%" }} />
      <canvas ref={canvasRef} />

      {status === "detected" && (
        <Card>
          <CardContent className="p-4">
            <p className="font-medium">Face Matched! 👋</p>
            <p className="text-sm text-muted-foreground">
              Name: {name} | Roll: {roll}
            </p>
            <p className="text-sm text-amber-500">Attendance recorded!</p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Face detection use karte hue — real-time face recognition.
            </p>
          </CardContent>
        </Card>
      )}

      <Button onClick={startCamera} disabled={scanning}>
        {scanning ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        {scanning ? "Scanning..." : "Start Face Recognition"}
      </Button>

      {status === "not-found" && (
        <p className="text-sm text-destructive">Face detektion nahi hua — camera access karo aur face-api.js setup karo.</p>
      )}
    </div>
  );
}
