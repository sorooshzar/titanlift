import React, { useState } from "react";
import { motion } from "framer-motion";

// Convert cm to feet+inches display
function cmToFtIn(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// Convert feet+inches to cm
function ftInToCm(feet, inches) {
  return +((feet * 12 + inches) * 2.54).toFixed(1);
}

function HeightInput({ valueCm, onChange, isImperial }) {
  const ftIn = valueCm ? cmToFtIn(valueCm) : { feet: "", inches: "" };
  const [localFt, setLocalFt] = useState(ftIn.feet !== "" ? String(ftIn.feet) : "");
  const [localIn, setLocalIn] = useState(ftIn.inches !== "" ? String(ftIn.inches) : "");

  const handleFtChange = (val) => {
    setLocalFt(val);
    const ft = parseInt(val) || 0;
    const ins = parseInt(localIn) || 0;
    if (val) onChange(ftInToCm(ft, ins));
  };

  const handleInChange = (val) => {
    setLocalIn(val);
    const ft = parseInt(localFt) || 0;
    const ins = parseInt(val) || 0;
    if (localFt) onChange(ftInToCm(ft, ins));
  };

  if (!isImperial) {
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">📐 Height</p>
        <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
          <input
            type="number" step="1" placeholder="175"
            value={valueCm || ""}
            onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            className="flex-1 h-12 bg-transparent px-4 text-base font-semibold focus:outline-none"
          />
          <span className="px-4 text-sm text-muted-foreground font-medium">cm</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">📐 Height</p>
      <div className="flex gap-2">
        <div className="flex items-center bg-secondary rounded-xl overflow-hidden flex-1">
          <input
            type="number" min="3" max="8" placeholder="5"
            value={localFt}
            onChange={e => handleFtChange(e.target.value)}
            className="flex-1 h-12 bg-transparent px-4 text-base font-semibold focus:outline-none"
          />
          <span className="px-3 text-sm text-muted-foreground font-medium">ft</span>
        </div>
        <div className="flex items-center bg-secondary rounded-xl overflow-hidden flex-1">
          <input
            type="number" min="0" max="11" placeholder="11"
            value={localIn}
            onChange={e => handleInChange(e.target.value)}
            className="flex-1 h-12 bg-transparent px-4 text-base font-semibold focus:outline-none"
          />
          <span className="px-3 text-sm text-muted-foreground font-medium">in</span>
        </div>
      </div>
    </div>
  );
}

function NumInput({ label, placeholder, value, onChange, unit, emoji }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{emoji} {label}</p>
      <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
        <input
          type="number" step="0.1" placeholder={placeholder}
          value={value || ""}
          onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          className="flex-1 h-12 bg-transparent px-4 text-base font-semibold focus:outline-none"
        />
        <span className="px-4 text-sm text-muted-foreground font-medium">{unit}</span>
      </div>
    </div>
  );
}

export default function SlideMeasurements({ answers, update }) {
  const isImperial = answers.weight_unit === "lbs";

  const displayWeight = answers.weight_kg
    ? isImperial ? +(answers.weight_kg * 2.20462).toFixed(1) : answers.weight_kg
    : null;

  const handleWeightChange = (val) => {
    if (!val) { update("weight_kg", null); return; }
    update("weight_kg", isImperial ? +(val / 2.20462).toFixed(2) : val);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 4</p>
        <h2 className="text-3xl font-black mb-1">Body measurements 📏</h2>
        <p className="text-muted-foreground text-sm mb-2">Used for macro calculation and progress tracking.</p>
        <p className="text-xs text-primary/80 font-medium mb-8">
          Entering in {isImperial ? "Imperial (ft/in · lbs)" : "Metric (cm · kg)"}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <HeightInput valueCm={answers.height_cm} onChange={v => update("height_cm", v)} isImperial={isImperial} />
        <NumInput
          label="Weight" placeholder={isImperial ? "165" : "75"} emoji="⚖️"
          unit={isImperial ? "lbs" : "kg"}
          value={displayWeight}
          onChange={handleWeightChange}
        />
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4 font-medium">Optional extras</p>
          <NumInput
            label="Body Fat %" placeholder="15" emoji="📊"
            unit="%"
            value={answers.body_fat_pct}
            onChange={v => update("body_fat_pct", v)}
          />
        </div>
      </motion.div>
    </div>
  );
}