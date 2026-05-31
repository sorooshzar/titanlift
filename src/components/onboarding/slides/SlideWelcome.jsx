import React from "react";
import { motion } from "framer-motion";
import { Zap, BarChart2, Flame } from "lucide-react";

const features = [
  { icon: Zap, label: "Smart workout tracking" },
  { icon: BarChart2, label: "Muscle rank progression" },
  { icon: Flame, label: "Macro & nutrition tracking" },
];

export default function SlideWelcome({ onNext }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14 text-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-2xl shadow-primary/20"
      >
        <span className="text-5xl select-none">⚡</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="text-4xl font-black mb-3 leading-tight">
          Welcome to<br />
          <span className="text-primary">Olympus</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-xs mx-auto">
          Rise to the top. Build strength,<br />discipline, and greatness.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs space-y-3 mb-10"
      >
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 text-left">
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full max-w-xs space-y-2"
      >
        <button
          onClick={onNext}
          className="w-full h-14 rounded-2xl bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          Let's Go ⚡
        </button>
        <p className="text-xs text-muted-foreground pt-1">Takes about 2 minutes to set up</p>
      </motion.div>
    </div>
  );
}