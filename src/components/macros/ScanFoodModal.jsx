import React, { useState, useRef, useEffect } from "react";
import { X, Camera, ZoomIn, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanFoodModal({ onClose, onFoodFound }) {
  const [mode, setMode] = useState("choice"); // choice | barcode | label | scanning | result | error
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async (facingMode = "environment") => {
    stopCamera();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const startBarcodeMode = async () => {
    setMode("barcode");
    setScanning(false);
    setTimeout(() => startCamera("environment"), 100);
  };

  const startLabelMode = async () => {
    setMode("label");
    setScanning(false);
    setTimeout(() => startCamera("environment"), 100);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const dataURLtoFile = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], "scan.jpg", { type: mime });
  };

  const handleCapture = async () => {
    setScanning(true);
    const dataUrl = captureFrame();
    if (!dataUrl) { setScanning(false); return; }

    stopCamera();
    setMode("scanning");

    try {
      const file = dataURLtoFile(dataUrl);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const prompt = mode === "barcode"
        ? `This image shows a product barcode or product label. Extract the nutritional information and product name. Return the food data as JSON.`
        : `This is a food nutrition label. Extract ALL nutritional information per 100g (convert if needed). Return the food data as JSON.`;

      const foodData = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            brand: { type: "string" },
            calories_per_100g: { type: "number" },
            protein_per_100g: { type: "number" },
            carbs_per_100g: { type: "number" },
            fat_per_100g: { type: "number" },
            fiber_per_100g: { type: "number" },
            serving_size: { type: "number" },
          },
          required: ["name", "calories_per_100g"],
        },
      });

      setResult({ ...foodData, is_custom: true });
      setMode("result");
    } catch (e) {
      setErrorMsg("Could not extract food info. Try again with better lighting.");
      setMode("error");
    } finally {
      setScanning(false);
    }
  };

  const handleUseFood = () => {
    onFoodFound(result);
    onClose();
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
            {/* Choice */}
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
                    <p className="text-xs text-muted-foreground">Point camera at product barcode</p>
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
                    <p className="text-xs text-muted-foreground">Take photo of the nutrition facts label</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* Camera viewfinder */}
            {(mode === "barcode" || mode === "label") && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4">
                <p className="text-xs text-muted-foreground text-center">
                  {mode === "barcode" ? "Point camera at the barcode" : "Frame the nutrition label"}
                </p>
                <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  {/* Viewfinder overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`border-2 border-primary rounded-xl ${mode === "barcode" ? "w-3/4 h-16" : "w-4/5 h-3/5"}`} />
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={handleCapture} disabled={scanning} className="w-full h-12 rounded-2xl text-sm font-bold gap-2">
                  <Camera className="w-4 h-4" />
                  {scanning ? "Processing..." : "Capture"}
                </Button>
              </motion.div>
            )}

            {/* Scanning / AI processing */}
            {mode === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-semibold">Analysing with AI...</p>
                <p className="text-xs text-muted-foreground text-center">Extracting nutritional information</p>
              </motion.div>
            )}

            {/* Result */}
            {mode === "result" && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-bold text-green-500">Found!</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-base font-bold">{result.name}</p>
                    {result.brand && <p className="text-xs text-muted-foreground">{result.brand}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Calories", value: result.calories_per_100g, unit: "kcal", color: "#FFD700" },
                      { label: "Protein", value: result.protein_per_100g, unit: "g", color: "#FF0055" },
                      { label: "Carbs", value: result.carbs_per_100g, unit: "g", color: "#00AAFF" },
                      { label: "Fat", value: result.fat_per_100g, unit: "g", color: "#00CC66" },
                      { label: "Fiber", value: result.fiber_per_100g, unit: "g", color: "#8B5CF6" },
                    ].filter(f => f.value != null).map(f => (
                      <div key={f.label} className="bg-secondary/50 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-semibold" style={{ color: f.color }}>{f.label}</p>
                        <p className="text-sm font-bold">{Math.round(f.value || 0)}{f.unit}</p>
                        <p className="text-[9px] text-muted-foreground">per 100g</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setMode("choice")}>
                    Rescan
                  </Button>
                  <Button className="flex-1 rounded-xl" onClick={handleUseFood}>
                    Use This Food
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {mode === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-12">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="text-sm font-semibold">Scan Failed</p>
                <p className="text-xs text-muted-foreground text-center">{errorMsg}</p>
                <Button variant="outline" onClick={() => setMode("choice")} className="rounded-xl px-6">
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}