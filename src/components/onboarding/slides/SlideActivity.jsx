import React from "react";
import { motion } from "framer-motion";

const LEVELS = [
  { id: "sedentary",        label: "Sedentary",          emoji: "🪑", desc: "Desk job, little to no movement" },
  { id: "lightly_active",   label: "Lightly Active",     emoji: "🚶", desc: "Light walks, standing throughout day" },
  { id: "moderately_active",label: "Moderately Active",  emoji: "🚴", desc: "Regular movement, active job" },
  { id: "very_active",      label: "Very Active",        emoji: "🏃", desc: "Physical job or very active lifestyle" },
  { id: "athlete",          label: "Athlete",            emoji: "⚡", desc: "Training multiple times daily" },
];

export default function SlideActivity({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 5</p>
        <h2 className="text-3xl font-black mb-1">Daily activity level 🏃</h2>
        <p className="text-muted-foreground text-sm mb-8">Outside of workouts. Used to calculate your TDEE.</p>
      </motion.div>

      <div className="space-y-3">
        {LEVELS.map((l, i) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => update("activity_level", l.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left
              ${answers.activity_level === l.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-2xl">{l.emoji}</span>
            <div>
              <p className="font-bold text-sm">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.desc}</p>
            </div>
            {answers.activity_level === l.id && (
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