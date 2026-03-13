import React from "react";
import { motion } from "framer-motion";

const GOALS = [
  { id: "build_muscle",       label: "Build Muscle",        emoji: "💪", desc: "Add size and strength" },
  { id: "lose_fat",           label: "Lose Fat",            emoji: "🔥", desc: "Cut body fat and lean out" },
  { id: "maintain",           label: "Maintain Weight",     emoji: "⚖️", desc: "Stay lean and consistent" },
  { id: "improve_strength",   label: "Improve Strength",    emoji: "🏋️", desc: "Hit new PRs" },
  { id: "improve_endurance",  label: "Improve Endurance",   emoji: "🏃", desc: "Build cardiovascular fitness" },
  { id: "general_fitness",    label: "General Fitness",     emoji: "✨", desc: "All-round health and wellness" },
];

export default function SlideGoal({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 1</p>
        <h2 className="text-3xl font-black mb-1">What's your main goal? 🎯</h2>
        <p className="text-muted-foreground text-sm mb-8">This personalises your macros and tracking.</p>
      </motion.div>

      <div className="space-y-3">
        {GOALS.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => update("goal", g.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left
              ${answers.goal === g.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-2xl">{g.emoji}</span>
            <div>
              <p className="font-bold text-sm">{g.label}</p>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
            </div>
            {answers.goal === g.id && (
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