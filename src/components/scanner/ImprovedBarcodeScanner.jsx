import React, { useEffect, useState, useRef } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

/**
 * Improved Barcode Scanner
 * - Continuous automatic detection
 * - Fast product lookup
 * - Visual feedback on detection
 * - Result screen with complete nutrition data
 */
export default function ImprovedBarcodeScanner({ videoRef, canvasRef, cameraManager, onClose }) {
  const [state, setState] = useState("scanning"); // scanning | detected | loading | result | notfound
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [productData, setProductData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const scanIntervalRef = useRef(null);
  const hasDetectedRef = useRef(false);

  // Start barcode detection loop
  useEffect(() => {
    if (!videoRef.current || !cameraManager.isActive()) return;

    const detectBarcode = async () => {
      if (hasDetectedRef.current) return; // Prevent duplicate detection

      try {
        const dataUrl = cameraManager.captureFrame(canvasRef.current);
        if (!dataUrl) return;

        const file = dataURLtoFile(dataUrl);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Detect barcode in image
        const result = await base44.integrations.Core.InvokeLLM({
          prompt:
            "Extract the barcode number/UPC from this product image. Return only the numeric barcode code, or null if no barcode is visible.",
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              barcode: { type: ["string", "null"] },
            },
          },
        });

        if (result.barcode && result.barcode.length >= 8) {
          hasDetectedRef.current = true;
          setScannedBarcode(result.barcode);
          setState("detected");
          // Auto-trigger lookup
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
    setState("loading");
    try {
      // Try Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const food = {
          name: product.product_name || "Unknown Product",
          brand: product.brands || "",
          calories_per_100g: product.nutriments?.["energy-kcal_100g"] || 0,
          protein_per_100g: product.nutriments?.["proteins_100g"] || 0,
          carbs_per_100g: product.nutriments?.["carbohydrates_100g"] || 0,
          fat_per_100g: product.nutriments?.["fat_100g"] || 0,
          fiber_per_100g: product.nutriments?.["fiber_100g"] || 0,
          sugar_per_100g: product.nutriments?.["sugars_100g"] || 0,
          sodium_per_100g: product.nutriments?.["sodium_100g"] || 0,
          serving_size: 100,
          serving_unit: "g",
          image_url: product.image_front_url || product.image_url || null,
          barcode: barcode,
          is_custom: true,
        };
        setProductData(food);
        setState("result");
      } else {
        setState("notfound");
      }
    } catch (e) {
      setState("notfound");
    }
  };

  const navigate = useNavigate();

  const handleLogFood = () => {
    navigate("/FoodPreview", {
      state: { food: productData },
      replace: false,
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Camera view */}
      {state !== "result" && state !== "notfound" && (
        <div className="flex-1 relative bg-black rounded-t-3xl overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          {/* Barcode scanning frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`border-2 rounded-lg transition-colors ${
                state === "detected" ? "border-green-500" : "border-primary"
              }`}
              style={{ width: "85%", height: "35%" }}
            />
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

          {/* Status indicators */}
          {state === "detected" && (
            <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              ✓ Barcode detected
            </div>
          )}

          {state === "loading" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          <p className="absolute bottom-4 left-4 right-4 text-xs text-white/70 text-center">
            Point camera at barcode — automatic detection enabled
          </p>
        </div>
      )}

      {/* Result screen */}
      {state === "result" && productData && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Product image */}
          {productData.image_url && (
            <div className="w-full h-48 bg-secondary rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={productData.image_url}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product info */}
          <div>
            <h2 className="text-lg font-bold">{productData.name}</h2>
            {productData.brand && <p className="text-sm text-muted-foreground">{productData.brand}</p>}
          </div>

          {/* Nutrition panel */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Per 100g</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="text-lg font-bold">{Math.round(productData.calories_per_100g)}</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-lg font-bold">{(productData.protein_per_100g || 0).toFixed(1)}g</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-lg font-bold">{(productData.carbs_per_100g || 0).toFixed(1)}g</p>
              </div>
              <div className="bg-secondary rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="text-lg font-bold">{(productData.fat_per_100g || 0).toFixed(1)}g</p>
              </div>
            </div>

            {/* Micronutrients */}
            {(productData.fiber_per_100g || productData.sugar_per_100g || productData.sodium_per_100g) && (
              <div className="space-y-2 pt-2">
                {productData.fiber_per_100g > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fiber</span>
                    <span className="font-semibold">{productData.fiber_per_100g.toFixed(1)}g</span>
                  </div>
                )}
                {productData.sugar_per_100g > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sugar</span>
                    <span className="font-semibold">{productData.sugar_per_100g.toFixed(1)}g</span>
                  </div>
                )}
                {productData.sodium_per_100g > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sodium</span>
                    <span className="font-semibold">{(productData.sodium_per_100g * 1000).toFixed(0)}mg</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not found screen */}
      {state === "notfound" && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <div className="text-center">
            <p className="font-semibold mb-2">Food not found</p>
            <p className="text-xs text-muted-foreground">
              This barcode is not in our database. Try scanning the nutrition label instead.
            </p>
          </div>
        </div>
      )}

      {/* Footer buttons */}
      <canvas ref={canvasRef} className="hidden" />
      <div className="px-4 py-4 border-t border-border space-y-3 shrink-0">
        {state === "result" && (
          <Button onClick={handleLogFood} className="w-full h-12 rounded-2xl font-bold">
            Add to Log
          </Button>
        )}
        {(state === "notfound" || state === "scanning") && (
          <Button variant="outline" onClick={onClose} className="w-full h-12 rounded-2xl font-bold">
            Cancel
          </Button>
        )}
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