import React, { useState } from "react";
import { X, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFoodIcon } from "./foodIcons";
import QuantityPicker from "./QuantityPicker";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FF9500";

function NutrientBar({ label, value, goal, color }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{Math.round(value)}{label.includes("Cal") ? "" : "g"}</span>
      {goal > 0 && <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(pct)}%</span>}
    </div>
  );
}

export default function FoodDetailModal({
  food, macroGoals, dailyTotals, mealType, date, onClose, onAdd,
  editEntryId, initialQty, onUpdate
}) {
  const [quantity, setQuantity] = useState(initialQty || food.serving_size || 100);
  const [showQtyPicker, setShowQtyPicker] = useState(false);

  const factor = quantity / 100;

  const contributed = {
    calories: Math.round((food.calories_per_100g || 0) * factor),
    protein: Math.round((food.protein_per_100g || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * factor * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * factor * 10) / 10,
    fiber: Math.round((food.fiber_per_100g || 0) * factor * 10) / 10,
  };

  const remaining = {
    calories: Math.max((macroGoals?.calories || 2000) - (dailyTotals?.calories || 0), 0),
    protein: Math.max((macroGoals?.protein || 150) - (dailyTotals?.protein || 0), 0),
    carbs: Math.max((macroGoals?.carbs || 200) - (dailyTotals?.carbs || 0), 0),
    fat: Math.max((macroGoals?.fat || 65) - (dailyTotals?.fat || 0), 0),
  };

  const buildData = () => ({
    date, meal_type: mealType, food_name: food.name, food_id: food.id,
    quantity, unit: "g",
    calories: contributed.calories,
    protein: contributed.protein,
    carbs: contributed.carbs,
    fat: contributed.fat,
  });

  const handleAdd = () => { onAdd(buildData()); onClose(); };
  const handleUpdate = () => { onUpdate(editEntryId, buildData()); };

  const handleQtyConfirm = ({ qty }) => {
    setQuantity(Math.round(qty));
    setShowQtyPicker(false);
  };

  const icon = getFoodIcon(food.name);
  const isEditMode = !!editEntryId;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
        <div
          className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border overflow-y-auto"
          style={{ maxHeight: "90vh" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 px-5 pt-5 pb-3 border-b border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h3 className="font-bold text-base leading-tight">{food.name}</h3>
                  {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quantity row — tap to open picker */}
            <button
              onClick={() => setShowQtyPicker(true)}
              className="flex items-center gap-2 mt-3 w-full bg-secondary rounded-xl px-3 py-2 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-2xl font-bold">{quantity}</span>
              <span className="text-sm text-muted-foreground">g</span>
              <Edit2 className="w-3 h-3 text-muted-foreground ml-1" />
              <div className="flex-1 grid grid-cols-4 gap-1 text-center ml-2">
                {[
                  { label: "P", val: `${contributed.protein}g`, color: PROTEIN_COLOR },
                  { label: "C", val: `${contributed.carbs}g`, color: CARBS_COLOR },
                  { label: "F", val: `${contributed.fat}g`, color: FAT_COLOR },
                  { label: "🔥", val: `${contributed.calories}`, color: KCAL_COLOR },
                ].map(m => (
                  <div key={m.label}>
                    <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.label}</p>
                    <p className="text-xs font-bold">{m.val}</p>
                  </div>
                ))}
              </div>
            </button>
          </div>

          <div className="px-5 pb-6 space-y-5 mt-4">
            {/* Contribution to remaining macros */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Contribution to Remaining Macros
              </h4>
              <div className="space-y-2.5">
                <NutrientBar label="Protein" value={contributed.protein} goal={remaining.protein} color={PROTEIN_COLOR} />
                <NutrientBar label="Carbs" value={contributed.carbs} goal={remaining.carbs} color={CARBS_COLOR} />
                <NutrientBar label="Fat" value={contributed.fat} goal={remaining.fat} color={FAT_COLOR} />
                <NutrientBar label="Calories" value={contributed.calories} goal={remaining.calories} color={KCAL_COLOR} />
              </div>
            </div>

            {/* Nutrition facts per 100g */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Nutrition per 100g
              </h4>
              <div className="bg-secondary/40 rounded-xl p-3 space-y-2">
                {[
                  { label: "Calories", value: food.calories_per_100g || 0, unit: "🔥", color: KCAL_COLOR },
                  { label: "Protein", value: food.protein_per_100g || 0, unit: "g", color: PROTEIN_COLOR },
                  { label: "Carbs", value: food.carbs_per_100g || 0, unit: "g", color: CARBS_COLOR },
                  { label: "Fat", value: food.fat_per_100g || 0, unit: "g", color: FAT_COLOR },
                  { label: "Fiber", value: food.fiber_per_100g || 0, unit: "g", color: "#8B5CF6" },
                ].map(n => (
                  <div key={n.label} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: n.color }}>{n.label}</span>
                    <span className="text-xs font-semibold">{n.value}{n.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micronutrients */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                Estimated Micronutrients
              </h4>
              <p className="text-[10px] text-muted-foreground mb-2">% of daily reference intake per serving</p>
              <div className="space-y-2">
                {[
                  { label: "Vitamin C", pct: Math.min(Math.round((food.fiber_per_100g || 0) * factor * 3), 100) },
                  { label: "Iron", pct: Math.min(Math.round((food.protein_per_100g || 0) * factor * 0.8), 100) },
                  { label: "Calcium", pct: Math.min(Math.round((food.fat_per_100g || 0) * factor * 0.5), 100) },
                  { label: "Potassium", pct: Math.min(Math.round((food.carbs_per_100g || 0) * factor * 0.4), 100) },
                  { label: "Vitamin D", pct: Math.min(Math.round((food.fat_per_100g || 0) * factor * 0.3), 100) },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{m.label}</span>
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground/50 rounded-full" style={{ width: `${m.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{m.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground/50 mt-2">* Estimates are approximate</p>
            </div>
          </div>

          {/* Action button */}
          {(onAdd || isEditMode) && (
            <div className="sticky bottom-0 px-5 pb-5 pt-2 bg-card border-t border-border/50">
              {isEditMode ? (
                <Button onClick={handleUpdate} className="w-full h-12 rounded-xl font-semibold gap-2">
                  <Check className="w-4 h-4" />
                  Update Amount
                </Button>
              ) : (
                <Button onClick={handleAdd} className="w-full h-12 rounded-xl font-semibold gap-2" style={{ backgroundColor: KCAL_COLOR }}>
                  <Check className="w-4 h-4" />
                  Add to {mealType || "Log"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantity picker slide-up */}
      {showQtyPicker && (
        <QuantityPicker
          food={food}
          initialQty={quantity}
          initialUnit="g"
          onConfirm={handleQtyConfirm}
          onClose={() => setShowQtyPicker(false)}
        />
      )}
    </>
  );
}