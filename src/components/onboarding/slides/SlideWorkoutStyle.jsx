import React from "react";
import { motion } from "framer-motion";

const OPTIONS = [
  { id: "strength",      label: "Strength Training", emoji: "🏋️", desc: "Heavy compound lifts" },
  { id: "bodybuilding",  label: "Bodybuilding",       emoji: "💪", desc: "Hypertrophy focused" },
  { id: "powerlifting",  label: "Powerlifting",       emoji: "🥇", desc: "Squat, bench, deadlift" },
  { id: "calisthenics",  label: "Calisthenics",       emoji: "🤸", desc: "Bodyweight mastery" },
  { id: "mixed",         label: "Mixed Training",     emoji: "⚡", desc: "Variety and balance" },
];

export default function SlideWorkoutStyle({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Optional</p>
        <h2 className="text-3xl font-black mb-1">Workout style 🎽</h2>
        <p className="text-muted-foreground text-sm mb-8">Helps with future program suggestions. You can skip this.</p>
      </motion.div>

      <div className="space-y-3">
        {OPTIONS.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => update("workout_style", o.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left
              ${answers.workout_style === o.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-2xl">{o.emoji}</span>
            <div>
              <p className="font-bold text-sm">{o.label}</p>
              <p className="text-xs text-muted-foreground">{o.desc}</p>
            </div>
            {answers.workout_style === o.id && (
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