import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Food Preview Page
 * - Display scanned food data before saving
 * - Allow user to review and edit
 * - Add to foods database or cancel
 */
export default function FoodPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const food = location.state?.food;

  if (!food) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">No food data found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleAddFood = async () => {
    setSaving(true);
    try {
      await base44.entities.Food.create({
        name: food.name,
        brand: food.brand || "",
        calories_per_100g: food.calories_per_100g || 0,
        protein_per_100g: food.protein_per_100g || 0,
        carbs_per_100g: food.carbs_per_100g || 0,
        fat_per_100g: food.fat_per_100g || 0,
        fiber_per_100g: food.fiber_per_100g || 0,
        serving_size: food.serving_size || 100,
        serving_unit: food.serving_unit || "g",
        is_custom: true,
      });
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      navigate("/Macros?tab=foods", { replace: true });
    } catch (e) {
      console.error("Failed to add food:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4 pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 border-b border-border/30 flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Food Preview</h1>
        <button
          onClick={handleCancel}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 mt-4">
        {/* Food name and brand */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Food Name</p>
          <p className="text-lg font-bold">{food.name}</p>
          {food.brand && <p className="text-xs text-muted-foreground mt-1">{food.brand}</p>}
        </div>

        {/* Macros per 100g */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Per 100g</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Calories", value: food.calories_per_100g, unit: "kcal", color: "#FFD700" },
              { label: "Protein", value: food.protein_per_100g, unit: "g", color: "#FF0055" },
              { label: "Carbs", value: food.carbs_per_100g, unit: "g", color: "#00AAFF" },
              { label: "Fat", value: food.fat_per_100g, unit: "g", color: "#00CC66" },
              { label: "Fiber", value: food.fiber_per_100g, unit: "g", color: "#8B5CF6" },
            ]
              .filter(m => m.value != null && m.value !== 0)
              .map(m => (
                <div key={m.label} className="bg-secondary/50 rounded-xl px-3 py-2">
                  <p className="text-[10px] font-semibold" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-sm font-bold">{(m.value || 0).toFixed(1)}{m.unit}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Serving info */}
        {(food.serving_size || food.serving_unit) && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Serving Size</p>
            <p className="text-base font-semibold">
              {food.serving_size || "100"} {food.serving_unit || "g"}
            </p>
          </div>
        )}

        {/* Micronutrients if available */}
        {(food.sugar_per_100g || food.sodium_per_100g) && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Micronutrients</p>
            <div className="space-y-2 text-sm">
              {food.sugar_per_100g && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sugar</span>
                  <span className="font-semibold">{(food.sugar_per_100g).toFixed(1)}g</span>
                </div>
              )}
              {food.sodium_per_100g && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sodium</span>
                  <span className="font-semibold">{(food.sodium_per_100g).toFixed(0)}mg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="sticky bottom-0 -mx-4 px-4 py-4 bg-background border-t border-border/30 flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 h-12 rounded-xl text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddFood}
            disabled={saving}
            className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Food
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}