import React from "react";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    key: "weight_unit",
    label: "Weight",
    emoji: "⚖️",
    options: [
      { id: "kg",  label: "Kilograms", sub: "kg" },
      { id: "lbs", label: "Pounds",    sub: "lbs" },
    ],
  },
  {
    key: "distance_unit",
    label: "Distance",
    emoji: "🛣️",
    options: [
      { id: "km", label: "Kilometres", sub: "km" },
      { id: "mi", label: "Miles",      sub: "mi" },
    ],
  },
  {
    key: "length_unit",
    label: "Height / Length",
    emoji: "📏",
    options: [
      { id: "cm",   label: "Centimetres", sub: "cm" },
      { id: "ft_in", label: "Feet & Inches", sub: "ft / in" },
    ],
  },
];

export default function SlideUnits({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 4</p>
        <h2 className="text-3xl font-black mb-1">Unit preferences 📐</h2>
        <p className="text-muted-foreground text-sm mb-8">Choose per measurement type. Applies globally across the app.</p>
      </motion.div>

      <div className="space-y-6">
        {CATEGORIES.map((cat, ci) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1 }}
          >
            <p className="text-sm font-bold mb-2">{cat.emoji} {cat.label}</p>
            <div className="grid grid-cols-2 gap-3">
              {cat.options.map(o => {
                const selected = answers[cat.key] === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => update(cat.key, o.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl border-2 transition-all
                      ${selected ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                  >
                    <p className="font-black text-base">{o.sub}</p>
                    <p className="text-xs text-muted-foreground">{o.label}</p>
                    {selected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-1">
                        <span className="text-white text-[10px]">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}