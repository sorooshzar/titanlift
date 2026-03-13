import React from "react";
import { motion } from "framer-motion";

export default function SlideBio({ answers, update }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 3</p>
        <h2 className="text-3xl font-black mb-1">About you 🧬</h2>
        <p className="text-muted-foreground text-sm mb-8">Used for calorie and metabolic calculations.</p>
      </motion.div>

      {/* Sex */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
        <p className="text-sm font-semibold mb-3">Biological sex</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "male",   label: "Male",   emoji: "♂️" },
            { id: "female", label: "Female", emoji: "♀️" },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => update("sex", s.id)}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-semibold text-sm transition-all
                ${answers.sex === s.id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <span className="text-xl">{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Age */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <p className="text-sm font-semibold mb-3">Age 🎂</p>
        <input
          type="number"
          min={10}
          max={100}
          placeholder="e.g. 25"
          value={answers.age || ""}
          onChange={e => update("age", e.target.value ? parseInt(e.target.value) : null)}
          className="w-full h-14 rounded-2xl bg-secondary border-0 px-5 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </motion.div>
    </div>
  );
}