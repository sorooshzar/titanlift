import React, { useState } from "react";
import { X } from "lucide-react";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FF9500";

const UNITS = ["cup", "tsp", "tbsp", "fl oz", "ml", "oz", "lb", "g"];

// Conversion to grams (approximate, based on water density for liquids)
const UNIT_TO_G = {
  cup: 240, tsp: 5, tbsp: 15, "fl oz": 30, ml: 1, oz: 28.35, lb: 453.6, g: 1,
};

export default function QuantityPicker({ food, initialQty = 100, initialUnit = "g", onConfirm, onClose, label = "Log" }) {
  const [unit, setUnit] = useState(initialUnit || "g");
  const [display, setDisplay] = useState(String(initialQty || 100));

  const qty = parseFloat(display) || 0;
  // Convert to grams for macro calculation
  const qtyInG = qty * (UNIT_TO_G[unit] || 1);
  const factor = qtyInG / 100;

  const contributed = {
    calories: Math.round((food.calories_per_100g || 0) * factor),
    protein: Math.round((food.protein_per_100g || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * factor * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * factor * 10) / 10,
  };

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

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
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
              <p className="text-sm font-semibold text-muted-foreground">{unit} ({Math.round(qtyInG)}g)</p>
              <p className="text-xs mt-0.5">
                <span style={{ color: KCAL_COLOR }}>🔥{contributed.calories}</span>
                {"  "}
                <span style={{ color: PROTEIN_COLOR }}>P{contributed.protein}</span>
                {"  "}
                <span style={{ color: CARBS_COLOR }}>C{contributed.carbs}</span>
                {"  "}
                <span style={{ color: FAT_COLOR }}>F{contributed.fat}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Unit selector */}
        <div className="px-5 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {UNITS.map(u => (
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-5">
          <button
            onClick={() => onConfirm({ qty: qtyInG, unit, display, contributed })}
            className="h-12 rounded-xl font-semibold text-sm border border-border hover:bg-secondary transition-colors"
          >
            Log 1
          </button>
          <button
            onClick={() => onConfirm({ qty: qtyInG, unit, display, contributed })}
            className="h-12 rounded-xl font-semibold text-sm text-primary-foreground transition-colors"
            style={{ backgroundColor: KCAL_COLOR }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}