import React from "react";
import { motion } from "framer-motion";

export default function SlideWeekStart({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 10</p>
        <h2 className="text-3xl font-black mb-1">First day of week 📆</h2>
        <p className="text-muted-foreground text-sm mb-10">Affects your calendar, scheduling and weekly analytics.</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: "monday", label: "Monday", emoji: "💼", desc: "Standard business week" },
          { id: "sunday", label: "Sunday", emoji: "☀️", desc: "Classic calendar week" },
        ].map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => update("week_start", o.id)}
            className={`flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 transition-all
              ${answers.week_start === o.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"}`}
          >
            <span className="text-5xl">{o.emoji}</span>
            <p className="font-black text-lg">{o.label}</p>
            <p className="text-xs text-muted-foreground text-center px-2">{o.desc}</p>
            {answers.week_start === o.id && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}