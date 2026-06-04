import React, { useState, useRef } from "react";
import { X, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ProfilePictureModal({ onClose, onSuccess }) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture_url: uploadedFile.file_url });
      onSuccess?.(uploadedFile.file_url);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 0);
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Camera access denied. Please allow camera permission.");
    }
  };

  const takeSelfie = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    setUploading(true);
    try {
      const ctx = canvasRef.current.getContext("2d");
      const video = videoRef.current;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvasRef.current.toBlob(async (blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const uploadedFile = await base44.integrations.Core.UploadFile({ file });
        await base44.auth.updateMe({ profile_picture_url: uploadedFile.file_url });
        stopCamera();
        onSuccess?.(uploadedFile.file_url);
        onClose();
      }, "image/jpeg", 0.9);
    } catch (error) {
      console.error("Selfie capture failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:p-4 p-0"
      onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t sm:border border-border/50 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {!showCamera ? (
          <div className="p-6 space-y-4">
            {/* iOS drag handle */}
            <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-2" />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Profile Picture</h2>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-secondary rounded-xl py-4 text-sm font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Choose Image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-4 text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
                Take Selfie
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold">Take Selfie</h2>
              <button onClick={() => stopCamera()} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-2xl bg-black flex-1 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => stopCamera()}
                className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={takeSelfie}
                disabled={uploading}
                className="flex-1">
                {uploading ? "Saving..." : "Capture"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}