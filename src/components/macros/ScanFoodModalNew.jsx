import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import UnifiedScanner from "@/components/scanner/UnifiedScanner";
import { CameraManager } from "@/components/scanner/CameraManager";
import { useNavigate } from "react-router-dom";

/**
 * Scan Food Modal
 * - Unified barcode + nutrition label detection
 * - Auto-detects both types simultaneously
 * - Routes to FoodPreview after successful scan
 */
export default function ScanFoodModal({ onClose }) {
  const [mode, setMode] = useState("scanning"); // scanning | error
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraManagerRef = useRef(new CameraManager());
  const navigate = useNavigate();

  // Start camera on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        await cameraManagerRef.current.start(videoRef.current, "environment");
      } catch (e) {
        setErrorMsg("Camera access denied. Please allow camera permissions.");
        setMode("error");
      }
    };
    startCamera();

    return () => cameraManagerRef.current.stop();
  }, []);

  const handleFoodFound = (foodData) => {
    cameraManagerRef.current.stop();
    // Navigate to preview page with food data
    navigate("/FoodPreview", { state: { food: foodData }, replace: false });
    onClose();
  };

  const handleError = (msg) => {
    setErrorMsg(msg);
    setMode("error");
  };

  const handleRetry = () => {
    setErrorMsg("");
    setMode("choice");
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={onClose}>
      <div
        className="flex-1 flex flex-col bg-background rounded-t-3xl mt-8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border shrink-0">
          <h2 className="text-sm font-bold">Scan Food</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            {/* Unified scanner */}
            {mode === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UnifiedScanner
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  cameraManager={cameraManagerRef.current}
                  onFound={handleFoodFound}
                  onError={handleError}
                />
              </motion.div>
            )}

            {/* Error state */}
            {mode === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-12">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm font-semibold">Scan Failed</p>
                <p className="text-xs text-muted-foreground text-center">{errorMsg}</p>
                <Button variant="outline" onClick={handleRetry} className="rounded-xl px-6">
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}