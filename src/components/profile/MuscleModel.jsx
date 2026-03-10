import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RANK_COLORS = {
  none: "#1e1e2e",
  wood: "#8B6914",
  bronze: "#CD7F32",
  silver: "#A8A8C0",
  gold: "#FFD700",
  platinum: "#B0E0E6",
  diamond: "#7DF9FF",
  champion: "#9B59B6",
  titan: "#E74C3C",
  olympian: "#FF6B35",
};

const RECOVERY_COLORS = {
  fresh: "#1e1e2e",
  light: "#2d5a1b",
  moderate: "#7a5c00",
  heavy: "#7a3000",
  sore: "#7a0000",
};

// Improved anatomical mannequin - front view
const FRONT_MUSCLES = {
  shoulders: {
    paths: [
      // Left shoulder
      "M 88 108 Q 78 100 80 118 Q 82 130 92 132 Q 96 120 96 112 Z",
      // Right shoulder
      "M 212 108 Q 222 100 220 118 Q 218 130 208 132 Q 204 120 204 112 Z",
    ],
    label: "Shoulders",
  },
  chest: {
    paths: [
      // Left pec
      "M 120 118 Q 118 110 130 106 Q 148 102 150 112 L 148 138 Q 134 142 122 136 Z",
      // Right pec
      "M 180 118 Q 182 110 170 106 Q 152 102 150 112 L 152 138 Q 166 142 178 136 Z",
    ],
    label: "Chest",
  },
  biceps: {
    paths: [
      // Left bicep
      "M 84 136 Q 80 130 84 128 Q 92 136 94 150 Q 94 164 90 168 Q 84 160 82 150 Z",
      // Right bicep
      "M 216 136 Q 220 130 216 128 Q 208 136 206 150 Q 206 164 210 168 Q 216 160 218 150 Z",
    ],
    label: "Biceps",
  },
  forearms: {
    paths: [
      // Left forearm
      "M 82 170 Q 78 165 80 172 Q 82 188 84 200 Q 88 208 90 200 Q 92 188 92 172 Z",
      // Right forearm
      "M 218 170 Q 222 165 220 172 Q 218 188 216 200 Q 212 208 210 200 Q 208 188 208 172 Z",
    ],
    label: "Forearms",
  },
  abs: {
    paths: [
      // Upper abs
      "M 136 140 Q 150 136 164 140 L 164 160 Q 150 156 136 160 Z",
      // Mid abs
      "M 136 162 Q 150 158 164 162 L 164 180 Q 150 176 136 180 Z",
      // Lower abs
      "M 138 182 Q 150 178 162 182 L 160 198 Q 150 200 140 198 Z",
    ],
    label: "Abs",
  },
  quads: {
    paths: [
      // Left quad
      "M 122 215 Q 118 210 126 208 Q 140 206 146 210 L 144 272 Q 136 274 126 268 Q 118 252 118 235 Z",
      // Right quad
      "M 178 215 Q 182 210 174 208 Q 160 206 154 210 L 156 272 Q 164 274 174 268 Q 182 252 182 235 Z",
    ],
    label: "Quads",
  },
  calves: {
    paths: [
      // Left calf
      "M 122 284 Q 118 280 124 278 Q 132 276 138 280 L 136 328 Q 130 332 124 328 Q 118 314 118 300 Z",
      // Right calf
      "M 178 284 Q 182 280 176 278 Q 168 276 162 280 L 164 328 Q 170 332 176 328 Q 182 314 182 300 Z",
    ],
    label: "Calves",
  },
};

// Back view muscles
const BACK_MUSCLES = {
  traps: {
    paths: [
      "M 132 88 Q 150 80 168 88 Q 164 106 150 110 Q 136 106 132 88 Z",
    ],
    label: "Traps",
  },
  shoulders: {
    paths: [
      "M 88 108 Q 78 100 80 118 Q 82 130 92 132 Q 96 120 96 112 Z",
      "M 212 108 Q 222 100 220 118 Q 218 130 208 132 Q 204 120 204 112 Z",
    ],
    label: "Rear Delts",
  },
  lats: {
    paths: [
      "M 114 118 Q 112 112 120 112 Q 136 114 144 118 L 140 172 Q 128 172 118 164 Q 112 150 112 134 Z",
      "M 186 118 Q 188 112 180 112 Q 164 114 156 118 L 160 172 Q 172 172 182 164 Q 188 150 188 134 Z",
    ],
    label: "Lats",
  },
  back: {
    paths: [
      "M 138 114 Q 150 110 162 114 L 160 172 Q 150 174 140 172 Z",
    ],
    label: "Middle Back",
  },
  forearms: {
    paths: [
      "M 82 170 Q 78 165 80 172 Q 82 188 84 200 Q 88 208 90 200 Q 92 188 92 172 Z",
      "M 218 170 Q 222 165 220 172 Q 218 188 216 200 Q 212 208 210 200 Q 208 188 208 172 Z",
    ],
    label: "Forearms",
  },
  glutes: {
    paths: [
      "M 124 208 Q 120 204 126 202 Q 140 200 150 204 L 150 222 Q 140 228 128 224 Q 120 218 120 210 Z",
      "M 176 208 Q 180 204 174 202 Q 160 200 150 204 L 150 222 Q 160 228 172 224 Q 180 218 180 210 Z",
    ],
    label: "Glutes",
  },
  hamstrings: {
    paths: [
      "M 122 228 Q 118 222 126 222 Q 140 220 146 224 L 144 278 Q 136 280 126 274 Q 118 258 118 242 Z",
      "M 178 228 Q 182 222 174 222 Q 160 220 154 224 L 156 278 Q 164 280 174 274 Q 182 258 182 242 Z",
    ],
    label: "Hamstrings",
  },
  calves: {
    paths: [
      "M 122 284 Q 118 280 124 278 Q 132 276 138 280 L 136 328 Q 130 332 124 328 Q 118 314 118 300 Z",
      "M 178 284 Q 182 280 176 278 Q 168 276 162 280 L 164 328 Q 170 332 176 328 Q 182 314 182 300 Z",
    ],
    label: "Calves",
  },
};

// Body outline path
const BODY_OUTLINE = `
  M 150 32
  Q 162 32 167 44 Q 172 56 168 68 Q 165 78 158 82
  Q 172 86 184 96 Q 200 86 208 100 Q 216 118 212 150
  Q 210 168 206 184 L 202 212
  Q 196 208 188 206 Q 180 204 176 206
  L 180 224 Q 184 258 180 288
  Q 178 308 176 328 Q 174 338 170 344
  L 162 344 Q 158 340 158 330
  L 160 290 Q 162 272 158 254 Q 154 244 150 254
  Q 146 244 142 254 Q 138 272 140 290
  L 142 330 Q 142 340 138 344
  L 130 344 Q 126 338 124 328
  Q 122 308 120 288 Q 116 258 120 224
  L 124 206 Q 120 204 112 206 Q 104 208 98 212
  L 94 184 Q 90 168 88 150 Q 84 118 92 100 Q 100 86 116 96
  Q 128 86 142 82 Q 135 78 132 68 Q 128 56 133 44 Q 138 32 150 32 Z
`;

// Head shape
const HEAD_PATH = "M 150 10 Q 165 10 170 22 Q 174 32 168 38 Q 162 44 150 44 Q 138 44 132 38 Q 126 32 130 22 Q 135 10 150 10 Z";

function getColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery) {
    const level = recoveryData[muscle];
    return RECOVERY_COLORS[level] || RECOVERY_COLORS.fresh;
  }
  const rank = muscleRanks[muscle] || "none";
  return RANK_COLORS[rank];
}

function MuscleView({ muscles, muscleRanks, recoveryData, showRecovery }) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  return (
    <svg viewBox="60 5 180 355" className="w-full h-full" style={{ maxHeight: 380 }}>
      {/* Body fill */}
      <path d={BODY_OUTLINE} fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      {/* Head */}
      <ellipse cx="150" cy="26" rx="17" ry="18" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />

      {/* Muscle groups */}
      {Object.entries(muscles).map(([key, data]) =>
        data.paths.map((path, i) => {
          const color = getColor(key, muscleRanks, recoveryData, showRecovery);
          const isHovered = hoveredMuscle === key;
          return (
            <path
              key={`${key}-${i}`}
              d={path}
              fill={color}
              stroke={isHovered ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.2)"}
              strokeWidth={isHovered ? 1.5 : 0.5}
              opacity={color === "#1e1e2e" ? 0.6 : isHovered ? 1 : 0.85}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredMuscle(key)}
              onMouseLeave={() => setHoveredMuscle(null)}
              onTouchStart={() => setHoveredMuscle(key === hoveredMuscle ? null : key)}
            />
          );
        })
      )}

      {/* Tooltip */}
      {hoveredMuscle && muscles[hoveredMuscle] && (() => {
        // Find approximate center of first path via simple bbox estimate
        const rank = muscleRanks[hoveredMuscle] || "none";
        return (
          <g>
            <rect x="110" y="182" width="80" height="22" rx="5"
              fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text x="150" y="196" textAnchor="middle"
              fill="hsl(var(--foreground))" fontSize="9" fontWeight="700">
              {muscles[hoveredMuscle].label}
              {!showRecovery && rank !== "none" ? ` · ${rank.charAt(0).toUpperCase() + rank.slice(1)}` : ""}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");

  return (
    <div className="relative">
      {/* Toggle buttons */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={() => setView("front")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            view === "front" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
          }`}
        >Front</button>
        <button
          onClick={() => setView("back")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            view === "back" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
          }`}
        >Back</button>
      </div>

      {/* Model with swipe support */}
      <div
        className="relative overflow-hidden"
        onTouchStart={(e) => { e.currentTarget._startX = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].clientX - (e.currentTarget._startX || 0);
          if (Math.abs(diff) > 50) setView(diff > 0 ? "front" : "back");
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === "front" ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === "front" ? 30 : -30 }}
            transition={{ duration: 0.18 }}
            className="flex justify-center"
          >
            <MuscleView
              muscles={view === "front" ? FRONT_MUSCLES : BACK_MUSCLES}
              muscleRanks={muscleRanks}
              recoveryData={recoveryData}
              showRecovery={showRecovery}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-1">
        Swipe to rotate · Tap to identify
      </p>
    </div>
  );
}