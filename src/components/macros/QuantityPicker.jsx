import React, { useState } from "react";
import { X, ChevronLeft } from "lucide-react";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

// "serving" uses food.serving_size as the base unit
const BASE_UNITS = ["serving", "cup", "tsp", "tbsp", "fl oz", "ml", "oz", "lb", "g"];

const UNIT_TO_G = {
  cup: 240, tsp: 5, tbsp: 15, "fl oz": 30, ml: 1, oz: 28.35, lb: 453.6, g: 1,
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function computeContributed(food, qty, unit) {
  let qtyInG;
  if (unit === "serving") {
    qtyInG = qty * (food.serving_size || 100);
  } else {
    qtyInG = qty * (UNIT_TO_G[unit] || 1);
  }
  const factor = qtyInG / 100;
  return {
    qtyInG,
    calories: Math.round((food.calories_per_100g || 0) * factor),
    protein: Math.round((food.protein_per_100g || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * factor * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * factor * 10) / 10,
  };
}

// Step 2: Choose meal modal
function MealChooser({ food, contributed, qtyInG, unit, onChoose, onBack }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-end justify-center">
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-bold">{food.name}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(qtyInG)}g — 🔥{contributed.calories} &nbsp;
              <span style={{ color: PROTEIN_COLOR }}>P{contributed.protein}</span> &nbsp;
              <span style={{ color: CARBS_COLOR }}>C{contributed.carbs}</span> &nbsp;
              <span style={{ color: FAT_COLOR }}>F{contributed.fat}</span>
            </p>
          </div>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Add to which meal?</p>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map(meal => (
            <button
              key={meal}
              onClick={() => onChoose(meal.toLowerCase())}
              className="h-12 rounded-xl font-semibold text-sm bg-secondary hover:bg-secondary/70 transition-colors capitalize"
            >
              {meal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuantityPicker({ food, initialQty, initialUnit, onDone, onLog, onClose }) {
  // Default to 1 serving
  const defaultUnit = "serving";
  const defaultQty = "1";

  const [unit, setUnit] = useState(initialUnit || defaultUnit);
  const [display, setDisplay] = useState(initialQty ? String(initialQty) : defaultQty);
  const [showMealChooser, setShowMealChooser] = useState(false);

  const qty = parseFloat(display) || 0;
  const { qtyInG, ...contributed } = computeContributed(food, qty, unit);

  const press = (val) => {
    if (val === "⌫") {
      setDisplay(p => p.length > 1 ? p.slice(0, -1) : "0");
    } else if (val === ".") {
      if (!display.includes(".")) setDisplay(p => p + ".");
    } else {
      setDisplay(p => p === "0" ? val : p + val);
    }
  };

  const KEYS = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

  const unitLabel = unit === "serving"
    ? `serving (${food.serving_size || 100}g)`
    : `${unit} (${Math.round(qtyInG)}g)`;

  if (showMealChooser) {
    return (
      <MealChooser
        food={food}
        contributed={contributed}
        qtyInG={qtyInG}
        unit={unit}
        onChoose={(meal) => onLog({ qty: qtyInG, unit, display, contributed, meal })}
        onBack={() => setShowMealChooser(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with colored dots */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PROTEIN_COLOR }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CARBS_COLOR }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FAT_COLOR }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: KCAL_COLOR }} />
          </div>
          <p className="text-sm font-bold truncate max-w-[200px]">{food.name}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display + macro preview */}
        <div className="px-5 pb-2">
          <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-4xl font-bold tracking-tight">{display}</span>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">{unitLabel}</p>
              <p className="text-xs mt-0.5">
                <span style={{ color: KCAL_COLOR }}>🔥{contributed.calories}</span>
                {" "}
                <span style={{ color: PROTEIN_COLOR }}>P{contributed.protein}</span>
                {" "}
                <span style={{ color: CARBS_COLOR }}>C{contributed.carbs}</span>
                {" "}
                <span style={{ color: FAT_COLOR }}>F{contributed.fat}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Unit selector */}
        <div className="px-5 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {BASE_UNITS.map(u => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  unit === u
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-1 px-3 pb-2">
          {KEYS.map(k => (
            <button
              key={k}
              onClick={() => press(k)}
              className={`h-12 rounded-xl text-lg font-semibold transition-colors ${
                k === "⌫" ? "bg-secondary/60 text-muted-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Done / Log buttons */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-5">
          <button
            onClick={() => onDone({ qty: qtyInG, unit, display, contributed })}
            className="h-12 rounded-xl font-semibold text-sm bg-foreground text-background transition-colors hover:opacity-90"
          >
            Done
          </button>
          <button
            onClick={() => setShowMealChooser(true)}
            className="h-12 rounded-xl font-semibold text-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: KCAL_COLOR, color: "#000" }}
          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}