import React, { useState } from "react";
import Model from "@jpedro002/react-body-highlighter";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Rank system: index+1 = frequency passed to library
const RANK_ORDER = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "champion", "titan", "olympian"];
const RANK_COLORS  = ["#8B5E3C", "#CD7F32", "#9B9BB0", "#FFD700", "#7EC8D4", "#4DD8FF", "#9B59B6", "#E74C3C", "#FF6B35"];

// Recovery system: index+1 = frequency
const RECOVERY_ORDER  = ["light", "moderate", "heavy", "sore"];
const RECOVERY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

// Our app muscle name → library muscle slug(s)
const APP_TO_LIB_FRONT = {
  chest:      ["chest"],
  shoulders:  ["front-deltoids"],
  biceps:     ["biceps"],
  triceps:    ["triceps"],
  forearms:   ["forearm"],
  abs:        ["abs"],
  quads:      ["quadriceps"],
  calves:     ["calves"],
};
const APP_TO_LIB_BACK = {
  traps:      ["trapezius"],
  shoulders:  ["back-deltoids"],
  lats:       ["upper-back"],
  back:       ["lower-back"],
  triceps:    ["triceps"],
  forearms:   ["forearm"],
  glutes:     ["gluteal"],
  hamstrings: ["hamstring"],
  calves:     ["calves"],
};

// Library muscle slug → our app muscle name
const LIB_TO_APP = {
  "chest":          "chest",
  "front-deltoids": "shoulders",
  "back-deltoids":  "shoulders",
  "biceps":         "biceps",
  "triceps":        "triceps",
  "forearm":        "forearms",
  "abs":            "abs",
  "quadriceps":     "quads",
  "calves":         "calves",
  "trapezius":      "traps",
  "upper-back":     "lats",
  "lower-back":     "back",
  "gluteal":        "glutes",
  "hamstring":      "hamstrings",
};

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
  traps: "Traps", lats: "Lats", back: "Lower Back", glutes: "Glutes", hamstrings: "Hamstrings",
};

function buildData(muscleRanks, recoveryData, showRecovery, viewMap) {
  const entries = [];
  for (const [appMuscle, libMuscles] of Object.entries(viewMap)) {
    let frequency = 0;
    if (showRecovery) {
      const rec = recoveryData[appMuscle];
      frequency = rec ? RECOVERY_ORDER.indexOf(rec) + 1 : 0;
    } else {
      const rank = muscleRanks[appMuscle];
      frequency = rank ? RANK_ORDER.indexOf(rank) + 1 : 0;
    }
    if (frequency > 0) {
      for (const lib of libMuscles) {
        entries.push({ name: appMuscle, muscles: [lib], frequency });
      }
    }
  }
  return entries;
}

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");
  const [clickedMuscle, setClickedMuscle] = useState(null);
  const navigate = useNavigate();

  const viewMap = view === "front" ? APP_TO_LIB_FRONT : APP_TO_LIB_BACK;
  const data = buildData(muscleRanks, recoveryData, showRecovery, viewMap);
  const highlightedColors = showRecovery ? RECOVERY_COLORS : RANK_COLORS;

  const handleClick = ({ muscle }) => {
    const appMuscle = LIB_TO_APP[muscle];
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
            <Model
              data={data}
              highlightedColors={highlightedColors}
              bodyColor="#3a3a3a"
              type={view === "front" ? "anterior" : "posterior"}
              onClick={handleClick}
              style={{ width: "11rem" }}
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