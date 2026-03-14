import React from "react";
import { motion } from "framer-motion";

function NumInput({ label, placeholder, value, onChange, unit, emoji }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{emoji} {label}</p>
      <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
        <input
          type="number"
          step="0.1"
          placeholder={placeholder}
          value={value || ""}
          onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          className="flex-1 h-12 bg-transparent px-4 text-base font-semibold focus:outline-none"
        />
        <span className="px-4 text-sm text-muted-foreground font-medium">{unit}</span>
      </div>
    </div>
  );
}

export default function SlideMeasurements({ answers, update, updateMany }) {
  const isImperial = answers.weight_unit === "lbs";

  // Display values converted for UI
  const displayHeight = answers.height_cm
    ? isImperial
      ? +(answers.height_cm / 2.54).toFixed(1) // cm → inches
      : answers.height_cm
    : null;

  const displayWeight = answers.weight_kg
    ? isImperial
      ? +(answers.weight_kg * 2.20462).toFixed(1) // kg → lbs
      : answers.weight_kg
    : null;

  // Store always in metric internally
  const handleHeightChange = (val) => {
    if (!val) { update("height_cm", null); return; }
    const cm = isImperial ? +(val * 2.54).toFixed(1) : val;
    update("height_cm", cm);
  };

  const handleWeightChange = (val) => {
    if (!val) { update("weight_kg", null); return; }
    const kg = isImperial ? +(val / 2.20462).toFixed(2) : val;
    update("weight_kg", kg);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 4</p>
        <h2 className="text-3xl font-black mb-1">Body measurements 📏</h2>
        <p className="text-muted-foreground text-sm mb-2">Used for macro calculation and progress tracking.</p>
        <p className="text-xs text-primary/80 font-medium mb-8">
          Entering in {isImperial ? "Imperial (in / lbs)" : "Metric (cm / kg)"}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <NumInput
          label="Height" placeholder={isImperial ? "69" : "175"} emoji="📐"
          unit={isImperial ? "in" : "cm"}
          value={displayHeight}
          onChange={handleHeightChange}
        />
        <NumInput
          label="Weight" placeholder={isImperial ? "165" : "75"} emoji="⚖️"
          unit={isImperial ? "lbs" : "kg"}
          value={displayWeight}
          onChange={handleWeightChange}
        />

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4 font-medium">Optional extras</p>
          <div className="space-y-3">
            <NumInput
              label="Body Fat %" placeholder="15" emoji="📊"
              unit="%"
              value={answers.body_fat_pct}
              onChange={v => update("body_fat_pct", v)}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}