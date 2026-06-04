import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ImprovedBarcodeScanner from "@/components/scanner/ImprovedBarcodeScanner";
import LabelScanner from "@/components/scanner/LabelScanner";
import { CameraManager } from "@/components/scanner/CameraManager";

/**
 * Scan Food Modal
 * - Choice between Barcode or Nutrition Label
 * - Keeps both as completely separate flows
 */
export default function ScanFoodModal({ onClose }) {
  const [mode, setMode] = useState("choice"); // choice | barcode | label | error
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraManagerRef = useRef(new CameraManager());

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
      if (!cameraManagerRef.current.isActive()) {
        await cameraManagerRef.current.start(videoRef.current, "environment");
      }
    } catch (e) {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setMode("error");
    }
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
      <div className="flex-1 flex flex-col bg-background rounded-t-3xl mt-8 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border shrink-0">
          <h2 className="text-sm font-bold">Scan Food</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex flex-col">
          <AnimatePresence mode="wait">
            {/* Choice screen */}
            {mode === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-4 space-y-3 flex flex-col justify-center"
              >
                <p className="text-center text-xs text-muted-foreground mb-4">Choose how to scan your food</p>
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
              <motion.div key="barcode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <ImprovedBarcodeScanner
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  cameraManager={cameraManagerRef.current}
                  onClose={onClose}
                />
              </motion.div>
            )}

            {/* Label scanner */}
            {mode === "label" && (
              <motion.div key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <LabelScanner
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  cameraManager={cameraManagerRef.current}
                  onFound={() => onClose()}
                  onError={handleError}
                />
              </motion.div>
            )}

            {/* Error state */}
            {mode === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 p-4"
              >
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm font-semibold">Scan Failed</p>
                <p className="text-xs text-muted-foreground text-center">{errorMsg}</p>
                <Button variant="outline" onClick={handleRetry} className="rounded-xl px-6">
                  Back
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