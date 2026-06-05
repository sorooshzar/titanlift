import React, { useEffect, useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

/**
 * Barcode Scanner Component
 * - Displays camera feed with wide horizontal barcode frame
 * - Auto-detects barcodes via API
 * - Fallback manual capture button
 */
export default function BarcodeScanner({ videoRef, canvasRef, cameraManager, onFound, onError }) {
  const [scanning, setScanning] = useState(false);
  const [detectedCode, setDetectedCode] = useState(null);
  const scanIntervalRef = useRef(null);

  // Start barcode detection loop
  useEffect(() => {
    if (!videoRef.current || !cameraManager.isActive()) return;

    const detectBarcode = async () => {
      try {
        const dataUrl = cameraManager.captureFrame(canvasRef.current);
        if (!dataUrl) return;

        // Upload frame to detect barcode
        const file = dataURLtoFile(dataUrl);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Use LLM to detect barcode number
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: "Extract the barcode number/UPC from this product image. Return only the numeric barcode code, or null if no barcode is visible.",
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              barcode: { type: ["string", "null"] },
            },
          },
        });

        if (result.barcode && result.barcode.length >= 8) {
          setDetectedCode(result.barcode);
          await lookupBarcode(result.barcode);
        }
      } catch (e) {
        // Silent fail — keep scanning
      }
    };

    scanIntervalRef.current = setInterval(detectBarcode, 1500);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [videoRef, cameraManager, canvasRef]);

  const lookupBarcode = async (barcode) => {
    setScanning(true);
    try {
      // Query Open Food Facts API for barcode
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
        onError("Product not found in database. Try manual entry or another scan.");
      }
    } catch (e) {
      onError("Failed to look up barcode. Check your connection and try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleManualCapture = async () => {
    const dataUrl = cameraManager.captureFrame(canvasRef.current);
    if (!dataUrl) return;
    await lookupBarcode(null); // Fallback: process as image
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-muted-foreground text-center">
        Point camera at the barcode — it will auto-scan
      </p>

      {/* Camera with wide horizontal barcode frame */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Barcode scanning overlay — wide horizontal frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-primary rounded-lg" style={{ width: "85%", height: "35%" }} />
          {/* Corner markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5">
            <div className="relative w-full h-16">
              <div className="absolute top-0 left-0 w-6 h-6 border-2 border-primary border-b-0 border-r-0" />
              <div className="absolute top-0 right-0 w-6 h-6 border-2 border-primary border-b-0 border-l-0" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-2 border-primary border-t-0 border-r-0" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-2 border-primary border-t-0 border-l-0" />
            </div>
          </div>
        </div>

        {/* Scanning indicator */}
        {scanning && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Detected indicator */}
        {detectedCode && (
          <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
            ✓ Barcode detected
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Manual capture fallback */}
      <Button onClick={handleManualCapture} disabled={scanning} className="w-full h-12 rounded-2xl text-sm font-bold gap-2">
        <Camera className="w-4 h-4" />
        {scanning ? "Processing..." : "Manual Capture"}
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