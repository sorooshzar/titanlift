import React, { useState, useRef } from "react";
import { Camera, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * Nutrition Label Scanner Component
 * - Captures nutrition label image
 * - Uses OCR and structured extraction
 * - Manual capture (user must frame label clearly)
 */
export default function LabelScanner({ videoRef, canvasRef, cameraManager, onFound, onError, onBack }) {
  const [scanning, setScanning] = useState(false);

  const handleCapture = async () => {
    setScanning(true);
    try {
      const dataUrl = cameraManager.captureFrame(canvasRef.current);
      if (!dataUrl) {
        onError("Failed to capture image");
        setScanning(false);
        return;
      }

      const file = dataURLtoFile(dataUrl);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Use LLM + OCR to extract nutrition label data
      const foodData = await base44.integrations.Core.InvokeLLM({
        prompt: `This image shows a nutrition label. Extract ALL nutrition information.
        Per serving size and convert to per 100g if needed.
        Include: food name, brand, serving size, serving unit, calories, protein, carbs, fat, fiber, sugar, sodium.
        Return as structured JSON.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            brand: { type: "string" },
            serving_size: { type: "number" },
            serving_unit: { type: "string" },
            calories_per_100g: { type: "number" },
            protein_per_100g: { type: "number" },
            carbs_per_100g: { type: "number" },
            fat_per_100g: { type: "number" },
            fiber_per_100g: { type: "number" },
            sugar_per_100g: { type: "number" },
            sodium_per_100g: { type: "number" },
          },
          required: ["name", "calories_per_100g"],
        },
      });

      if (foodData.name && foodData.calories_per_100g) {
        onFound({ ...foodData, is_custom: true });
      } else {
        onError("Could not extract nutrition information. Try again with better lighting.");
      }
    } catch (e) {
      onError("Failed to process nutrition label. Check lighting and try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-muted-foreground text-center">
        Frame the nutrition label clearly — include serving size and all nutrients
      </p>

      {/* Camera with label frame guide */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Nutrition label frame overlay — taller vertical frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-primary rounded-lg" style={{ width: "75%", height: "80%" }} />
        </div>

        {/* Processing state */}
        {scanning && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="flex gap-2">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="px-3 h-12 rounded-2xl text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <Button 
          onClick={handleCapture} 
          disabled={scanning} 
          className="flex-1 h-12 rounded-2xl text-sm font-bold gap-2"
        >
          <Camera className="w-4 h-4" />
          {scanning ? "Processing..." : "Capture"}
        </Button>
      </div>
    </div>
  );
}

function dataURLtoFile(dataUrl) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], "scan.jpg", { type: mime });
}