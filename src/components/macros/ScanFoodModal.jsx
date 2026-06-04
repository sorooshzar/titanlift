import React, { useState, useRef, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ImprovedBarcodeScanner from "@/components/scanner/ImprovedBarcodeScanner";
import LabelScanner from "@/components/scanner/LabelScanner";
import { CameraManager } from "@/components/scanner/CameraManager";

/**
 * Scan Food Modal
 * - Opens directly to barcode scanner (no choice screen)
 * - User can switch to nutrition label scanning from bottom button
 * - Keeps both flows completely separate
 */
export default function ScanFoodModal({ onClose }) {
  const [mode, setMode] = useState("barcode"); // barcode | label | error
  const [errorMsg, setErrorMsg] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraManagerRef = useRef(new CameraManager());

  // Initialize camera immediately on mount
  // VIDEO ELEMENT IS NOW ALWAYS MOUNTED BELOW, SO videoRef WILL BE READY
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsInitializing(true);
        // Video element is now persistently mounted, so ref will exist
        await cameraManagerRef.current.start(videoRef.current, "environment");
        setIsInitializing(false);
      } catch (e) {
        setErrorMsg("Camera access denied. Please allow camera permissions.");
        setMode("error");
        setIsInitializing(false);
      }
    };
    
    // Give DOM time to mount the video element first
    const timeout = setTimeout(initCamera, 100);
    
    return () => {
      clearTimeout(timeout);
      cameraManagerRef.current.stop();
    };
  }, []);

  const handleSwitchToLabel = async () => {
    // Ensure camera is still active when switching
    if (!cameraManagerRef.current.isActive()) {
      try {
        await cameraManagerRef.current.start(videoRef.current, "environment");
      } catch (e) {
        setErrorMsg("Failed to access camera");
        setMode("error");
        return;
      }
    }
    setMode("label");
  };

  const handleBackToBarcode = async () => {
    // Ensure camera is still active when switching back
    if (!cameraManagerRef.current.isActive()) {
      try {
        await cameraManagerRef.current.start(videoRef.current, "environment");
      } catch (e) {
        setErrorMsg("Failed to access camera");
        setMode("error");
        return;
      }
    }
    setMode("barcode");
  };

  const handleLabelFound = () => {
    // Label scanning found data, close modal
    onClose();
  };

  const handleError = (msg) => {
    setErrorMsg(msg);
    setMode("error");
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

        {/* PERSISTENT VIDEO ELEMENT - Always mounted, never destroyed */}
        <div className="flex-1 relative bg-black rounded-t-3xl overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          
          {/* Overlays on top of persistent video */}
          <div className="absolute inset-0 flex flex-col">
            <AnimatePresence mode="wait">
              {/* Loading state */}
              {isInitializing && mode === "barcode" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 p-4 bg-black/50"
                >
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Opening camera...</p>
                </motion.div>
              )}

              {/* Barcode scanner overlay */}
              {mode === "barcode" && !isInitializing && (
                <motion.div key="barcode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                  <ImprovedBarcodeScanner
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    cameraManager={cameraManagerRef.current}
                    onClose={onClose}
                    onSwitchToLabel={handleSwitchToLabel}
                  />
                </motion.div>
              )}

              {/* Label scanner overlay */}
              {mode === "label" && (
                <motion.div key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-4 justify-center">
                  <LabelScanner
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    cameraManager={cameraManagerRef.current}
                    onFound={handleLabelFound}
                    onError={handleError}
                    onBack={handleBackToBarcode}
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
                  className="flex-1 flex flex-col items-center justify-center gap-4 p-4 bg-black/80"
                >
                  <AlertCircle className="w-10 h-10 text-destructive" />
                  <div className="text-center">
                    <p className="text-sm font-semibold mb-1">Error</p>
                    <p className="text-xs text-muted-foreground">{errorMsg}</p>
                  </div>
                  <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}