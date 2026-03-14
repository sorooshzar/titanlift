import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import LabelScanner from "@/components/scanner/LabelScanner";
import { CameraManager } from "@/components/scanner/CameraManager";
import { useNavigate } from "react-router-dom";

/**
 * Scan Food Modal
 * - Unified entry point for barcode and label scanning
 * - Stable camera session across modes
 * - Routes to FoodPreview after successful scan
 */
export default function ScanFoodModal({ onClose }) {
  const [mode, setMode] = useState("choice"); // choice | barcode | label | scanning | error
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraManagerRef = useRef(new CameraManager());
  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    return () => cameraManagerRef.current.stop();
  }, []);

  const startBarcodeMode = async () => {
    setErrorMsg("");
    setMode("barcode");
    try {
      await cameraManagerRef.current.start(videoRef.current, "environment");
    } catch (e) {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setMode("error");
    }
  };

  const startLabelMode = async () => {
    setErrorMsg("");
    setMode("label");
    try {
      // Camera already running if switching modes — just update display
      if (!cameraManagerRef.current.isActive()) {
        await cameraManagerRef.current.start(videoRef.current, "environment");
      }
    } catch (e) {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setMode("error");
    }
  };

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
            {/* Choice screen */}
            {mode === "choice" && (
              <motion.div key="choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3 pt-4">
                <p className="text-center text-xs text-muted-foreground mb-6">Choose how to scan your food</p>
                <button
                  onClick={startBarcodeMode}
                  className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Scan Barcode</p>
                    <p className="text-xs text-muted-foreground">Auto-detect product barcode</p>
                  </div>
                </button>
                <button
                  onClick={startLabelMode}
                  className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Scan Nutrition Label</p>
                    <p className="text-xs text-muted-foreground">Take photo of nutrition facts</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Barcode scanner */}
            {mode === "barcode" && (
              <motion.div key="barcode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BarcodeScanner
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  cameraManager={cameraManagerRef.current}
                  onFound={handleFoodFound}
                  onError={handleError}
                />
              </motion.div>
            )}

            {/* Label scanner */}
            {mode === "label" && (
              <motion.div key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LabelScanner
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