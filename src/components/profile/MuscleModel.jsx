import React, { useState } from "react";
import Body from "@mjcdev/react-body-highlighter";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const RANK_ORDER = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "champion", "titan", "olympian"];
const RANK_COLORS = ["#8B5E3C", "#CD7F32", "#9B9BB0", "#FFD700", "#7EC8D4", "#4DD8FF", "#9B59B6", "#E74C3C", "#FF6B35"];

const RECOVERY_ORDER = ["light", "moderate", "heavy", "sore"];
const RECOVERY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

// App muscle → library slug
const APP_TO_SLUG = {
  chest:      "chest",
  shoulders:  "deltoids",
  biceps:     "biceps",
  triceps:    "triceps",
  forearms:   "forearm",
  abs:        "abs",
  quads:      "quadriceps",
  calves:     "calves",
  traps:      "trapezius",
  lats:       "upper-back",
  back:       "lower-back",
  glutes:     "gluteal",
  hamstrings: "hamstring",
};

const SLUG_TO_APP = Object.fromEntries(Object.entries(APP_TO_SLUG).map(([k, v]) => [v, k]));

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
  traps: "Traps", lats: "Lats", back: "Lower Back", glutes: "Glutes", hamstrings: "Hamstrings",
};

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");
  const [clickedMuscle, setClickedMuscle] = useState(null);
  const navigate = useNavigate();

  const data = Object.entries(APP_TO_SLUG).map(([appMuscle, slug]) => {
    if (showRecovery) {
      const rec = recoveryData[appMuscle];
      if (!rec) return null;
      const idx = RECOVERY_ORDER.indexOf(rec);
      return idx >= 0 ? { slug, intensity: idx + 1 } : null;
    } else {
      const rank = muscleRanks[appMuscle];
      if (!rank) return null;
      const idx = RANK_ORDER.indexOf(rank);
      return idx >= 0 ? { slug, intensity: idx + 1 } : null;
    }
  }).filter(Boolean);

  const colors = showRecovery ? RECOVERY_COLORS : RANK_COLORS;

  const handleClick = (part) => {
    const appMuscle = SLUG_TO_APP[part.slug];
    if (appMuscle) setClickedMuscle(appMuscle);
  };

  return (
    <div className="relative">
      {/* View toggle */}
      <div className="flex justify-center gap-2 mb-3">
        {["front", "back"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
              view === v ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
            }`}>
            {v}
          </button>
        ))}
      </div>

      {/* Model */}
      <div className="flex justify-center"
        onTouchStart={(e) => { e.currentTarget._sx = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].clientX - (e.currentTarget._sx || 0);
          if (Math.abs(diff) > 40) setView(diff > 0 ? "front" : "back");
        }}>
        <AnimatePresence mode="wait">
          <motion.div key={view}
            initial={{ opacity: 0, x: view === "front" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === "front" ? 20 : -20 }}
            transition={{ duration: 0.15 }}>
            <Body
              data={data}
              colors={colors}
              side={view}
              gender="male"
              scale={1.4}
              border="#2a2a2a"
              onBodyPartClick={handleClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-1">Tap muscle to find exercises · Swipe to flip</p>

      {/* Click popup */}
      <AnimatePresence>
        {clickedMuscle && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setClickedMuscle(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-2xl p-5 shadow-2xl w-64 text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">Muscle selected</p>
              <p className="text-lg font-bold mb-4">{MUSCLE_LABELS[clickedMuscle]}</p>
              <button
                onClick={() => { navigate(createPageUrl(`Lifts?tab=exercises&muscle=${clickedMuscle}`)); setClickedMuscle(null); }}
                className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold">
                Find exercises for {MUSCLE_LABELS[clickedMuscle]}
              </button>
              <button onClick={() => setClickedMuscle(null)}
                className="w-full mt-2 text-xs text-muted-foreground py-1.5">Cancel</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}