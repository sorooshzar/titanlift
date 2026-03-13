import React from "react";
import { motion } from "framer-motion";

const OPTIONS = [
  { id: "2-3", label: "2–3 days",  emoji: "🌱", desc: "Beginner friendly, good recovery" },
  { id: "3-4", label: "3–4 days",  emoji: "💪", desc: "Solid intermediate schedule" },
  { id: "4-5", label: "4–5 days",  emoji: "🔥", desc: "High frequency, advanced" },
  { id: "5-6", label: "5–6 days",  emoji: "⚡", desc: "Elite training volume" },
];

export default function SlideFrequency({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 6</p>
        <h2 className="text-3xl font-black mb-1">Training frequency 📅</h2>
        <p className="text-muted-foreground text-sm mb-8">How many days per week do you plan to train?</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => update("workout_days_per_week", o.id)}
            className={`flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 transition-all
              ${answers.workout_days_per_week === o.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-3xl">{o.emoji}</span>
            <p className="font-black text-lg">{o.label}</p>
            <p className="text-[11px] text-muted-foreground text-center px-2">{o.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}