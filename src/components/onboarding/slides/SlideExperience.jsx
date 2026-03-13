import React from "react";
import { motion } from "framer-motion";

const LEVELS = [
  { id: "beginner",     label: "Beginner",     emoji: "🌱", desc: "Less than 1 year of consistent training" },
  { id: "intermediate", label: "Intermediate", emoji: "⚡", desc: "1–3 years of structured training" },
  { id: "advanced",     label: "Advanced",     emoji: "🔥", desc: "3+ years, strong foundation & knowledge" },
];

export default function SlideExperience({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 2</p>
        <h2 className="text-3xl font-black mb-1">Your experience level 🏆</h2>
        <p className="text-muted-foreground text-sm mb-8">Helps calibrate benchmarks and progress rates.</p>
      </motion.div>

      <div className="space-y-4">
        {LEVELS.map((l, i) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => update("experience_level", l.id)}
            className={`w-full flex items-center gap-5 px-5 py-5 rounded-2xl border-2 transition-all text-left
              ${answers.experience_level === l.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-4xl">{l.emoji}</span>
            <div>
              <p className="font-bold text-base">{l.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
            </div>
            {answers.experience_level === l.id && (
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