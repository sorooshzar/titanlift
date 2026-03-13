import React from "react";
import { motion } from "framer-motion";

const OPTIONS = [
  { id: "macros",    label: "Track Macros",         emoji: "🥩", desc: "Calories, protein, carbs & fat" },
  { id: "calories",  label: "Track Calories Only",  emoji: "🔢", desc: "Simple calorie counting" },
  { id: "none",      label: "No Tracking",          emoji: "🙅", desc: "Just focus on training" },
];

export default function SlideNutrition({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 7</p>
        <h2 className="text-3xl font-black mb-1">Nutrition tracking 🥗</h2>
        <p className="text-muted-foreground text-sm mb-8">How do you want to approach your diet?</p>
      </motion.div>

      <div className="space-y-4">
        {OPTIONS.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => update("nutrition_tracking", o.id)}
            className={`w-full flex items-center gap-5 px-5 py-5 rounded-2xl border-2 transition-all text-left
              ${answers.nutrition_tracking === o.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-4xl">{o.emoji}</span>
            <div>
              <p className="font-bold text-base">{o.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
            </div>
            {answers.nutrition_tracking === o.id && (
              <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}