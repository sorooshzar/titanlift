import React, { useEffect, useState, useRef } from "react";
import { Camera, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * Unified Scanner Component
 * - Detects BOTH barcode and nutrition label simultaneously
 * - Auto-detects on interval, manual capture as fallback
 * - Single bounding box guide for both detection types
 */
export default function UnifiedScanner({ videoRef, canvasRef, cameraManager, onFound, onError }) {
  const [scanning, setScanning] = useState(false);
  const [detectedType, setDetectedType] = useState(null); // "barcode" | "label"
  const scanIntervalRef = useRef(null);

  // Start unified detection loop
  useEffect(() => {
    if (!videoRef.current || !cameraManager.isActive()) return;

    const detectFood = async () => {
      try {
        const dataUrl = cameraManager.captureFrame(canvasRef.current);
        if (!dataUrl) return;

        // Upload frame
        const file = dataURLtoFile(dataUrl);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Single LLM call checking for BOTH barcode and nutrition facts
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this image frame to detect either a product barcode or a Nutrition Facts panel.
          - If you detect a barcode, extract the numeric UPC/EAN code.
          - If you detect a Nutrition Facts table, extract the nutrition information (name, brand, serving size, calories, protein, carbs, fat, fiber per 100g).
          If neither is clearly visible, return "none".`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              detected: { type: "string", enum: ["barcode", "label", "none"] },
              barcode: { type: ["string", "null"] },
              label_data: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  brand: { type: "string" },
                  serving_size: { type: "number" },
                  calories_per_100g: { type: "number" },
                  protein_per_100g: { type: "number" },
                  carbs_per_100g: { type: "number" },
                  fat_per_100g: { type: "number" },
                  fiber_per_100g: { type: "number" },
                },
                required: ["name", "calories_per_100g"],
              },
            },
            required: ["detected"],
          },
        });

        // Handle detection results
        if (result.detected === "barcode" && result.barcode && result.barcode.length >= 8) {
          setDetectedType("barcode");
          await lookupBarcode(result.barcode);
        } else if (result.detected === "label" && result.label_data) {
          setDetectedType("label");
          onFound({ ...result.label_data, is_custom: true });
        }
      } catch (e) {
        // Silent fail — keep scanning
      }
    };

    scanIntervalRef.current = setInterval(detectFood, 2000);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [videoRef, cameraManager, canvasRef, onFound]);

  const lookupBarcode = async (barcode) => {
    setScanning(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const foodData = {
          name: product.product_name || "Unknown Product",
          brand: product.brands || "",
          calories_per_100g: product.nutriments?.["energy-kcal_100g"] || 0,
          protein_per_100g: product.nutriments?.["proteins_100g"] || 0,
          carbs_per_100g: product.nutriments?.["carbohydrates_100g"] || 0,
          fat_per_100g: product.nutriments?.["fat_100g"] || 0,
          fiber_per_100g: product.nutriments?.["fiber_100g"] || 0,
          serving_size: 100,
          is_custom: true,
        };
        onFound(foodData);
      } else {
        onError("Product not found in database. Try another scan or manual entry.");
      }
    } catch (e) {
      onError("Failed to look up barcode. Check your connection and try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleManualCapture = async () => {
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

      // Manual capture uses same detection logic
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image to detect either a product barcode or a Nutrition Facts panel.
        - If barcode: extract the numeric code.
        - If nutrition label: extract all nutrition information (name, brand, serving size, calories, protein, carbs, fat, fiber per 100g).
        Return structured data.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            detected: { type: "string", enum: ["barcode", "label", "none"] },
            barcode: { type: ["string", "null"] },
            label_data: {
              type: "object",
              properties: {
                name: { type: "string" },
                brand: { type: "string" },
                calories_per_100g: { type: "number" },
                protein_per_100g: { type: "number" },
                carbs_per_100g: { type: "number" },
                fat_per_100g: { type: "number" },
                fiber_per_100g: { type: "number" },
              },
              required: ["name", "calories_per_100g"],
            },
          },
          required: ["detected"],
        },
      });

      if (result.detected === "barcode" && result.barcode && result.barcode.length >= 8) {
        await lookupBarcode(result.barcode);
      } else if (result.detected === "label" && result.label_data) {
        onFound({ ...result.label_data, is_custom: true });
      } else {
        onError("Could not detect barcode or nutrition label. Try again with better lighting.");
      }
    } catch (e) {
      onError("Failed to process image. Try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-muted-foreground text-center">
        Align barcode or nutrition label — auto-detects both
      </p>

      {/* Camera with unified bounding box */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Unified scanning frame — works for both barcode and label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-primary rounded-lg" style={{ width: "80%", height: "60%" }} />
          {/* Corner markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-0 w-6 h-6 border-2 border-primary border-b-0 border-r-0" />
              <div className="absolute top-0 right-0 w-6 h-6 border-2 border-primary border-b-0 border-l-0" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-2 border-primary border-t-0 border-r-0" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-2 border-primary border-t-0 border-l-0" />
            </div>
          </div>
        </div>

        {/* Processing state */}
        {scanning && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Detection indicator */}
        {detectedType && (
          <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
            ✓ {detectedType === "barcode" ? "Barcode" : "Nutrition Label"} detected
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Manual capture button */}
      <Button
        onClick={handleManualCapture}
        disabled={scanning}
        className="w-full h-12 rounded-2xl text-sm font-bold gap-2"
      >
        <Camera className="w-4 h-4" />
        {scanning ? "Processing..." : "Analyze Now"}
      </Button>
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