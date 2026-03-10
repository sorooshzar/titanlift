import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RANK_COLORS = {
  none: "#2a2a2a",
  wood: "#8B6914",
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
  champion: "#9B59B6",
  titan: "#E74C3C",
  olympian: "#FF6B35",
};

const RECOVERY_COLORS = {
  fresh: "#2a2a2a",
  light: "#4a7a3a",
  moderate: "#c9a820",
  heavy: "#e06020",
  sore: "#d03030",
};

// SVG muscle paths for front view
const FRONT_MUSCLES = {
  chest: {
    paths: [
      "M 115 115 Q 130 105 150 110 L 150 140 Q 135 145 115 135 Z",
      "M 185 115 Q 170 105 150 110 L 150 140 Q 165 145 185 135 Z",
    ],
    label: "Chest",
    cx: 150, cy: 125,
  },
  shoulders: {
    paths: [
      "M 100 100 Q 105 85 120 90 L 115 120 Q 100 115 100 100 Z",
      "M 200 100 Q 195 85 180 90 L 185 120 Q 200 115 200 100 Z",
    ],
    label: "Shoulders",
    cx: 150, cy: 92,
  },
  biceps: {
    paths: [
      "M 95 120 Q 100 115 108 118 L 105 160 Q 95 158 92 145 Z",
      "M 205 120 Q 200 115 192 118 L 195 160 Q 205 158 208 145 Z",
    ],
    label: "Biceps",
    cx: 100, cy: 138,
  },
  forearms: {
    paths: [
      "M 92 158 Q 98 155 105 160 L 100 200 Q 90 198 88 180 Z",
      "M 208 158 Q 202 155 195 160 L 200 200 Q 210 198 212 180 Z",
    ],
    label: "Forearms",
    cx: 95, cy: 178,
  },
  abs: {
    paths: [
      "M 132 142 L 150 140 L 150 200 L 132 198 Z",
      "M 168 142 L 150 140 L 150 200 L 168 198 Z",
    ],
    label: "Abs",
    cx: 150, cy: 170,
  },
  quads: {
    paths: [
      "M 125 205 Q 135 200 148 202 L 145 270 Q 130 268 122 245 Z",
      "M 175 205 Q 165 200 152 202 L 155 270 Q 170 268 178 245 Z",
    ],
    label: "Quads",
    cx: 150, cy: 235,
  },
  calves: {
    paths: [
      "M 125 280 Q 132 275 140 278 L 138 330 Q 128 328 123 310 Z",
      "M 175 280 Q 168 275 160 278 L 162 330 Q 172 328 177 310 Z",
    ],
    label: "Calves",
    cx: 150, cy: 305,
  },
};

const BACK_MUSCLES = {
  traps: {
    paths: [
      "M 130 90 Q 150 80 170 90 L 168 110 Q 150 105 132 110 Z",
    ],
    label: "Traps",
    cx: 150, cy: 98,
  },
  shoulders: {
    paths: [
      "M 100 100 Q 105 85 120 90 L 118 120 Q 100 115 100 100 Z",
      "M 200 100 Q 195 85 180 90 L 182 120 Q 200 115 200 100 Z",
    ],
    label: "Rear Delts",
    cx: 150, cy: 92,
  },
  lats: {
    paths: [
      "M 115 115 Q 130 110 145 115 L 140 170 Q 120 165 115 140 Z",
      "M 185 115 Q 170 110 155 115 L 160 170 Q 180 165 185 140 Z",
    ],
    label: "Lats",
    cx: 150, cy: 140,
  },
  back: {
    paths: [
      "M 135 110 Q 150 108 165 110 L 163 170 Q 150 168 137 170 Z",
    ],
    label: "Back",
    cx: 150, cy: 140,
  },
  glutes: {
    paths: [
      "M 125 195 Q 140 188 150 190 L 150 215 Q 135 218 122 210 Z",
      "M 175 195 Q 160 188 150 190 L 150 215 Q 165 218 178 210 Z",
    ],
    label: "Glutes",
    cx: 150, cy: 205,
  },
  hamstrings: {
    paths: [
      "M 123 218 Q 135 215 148 218 L 145 280 Q 130 278 122 255 Z",
      "M 177 218 Q 165 215 152 218 L 155 280 Q 170 278 178 255 Z",
    ],
    label: "Hamstrings",
    cx: 150, cy: 248,
  },
  calves: {
    paths: [
      "M 125 285 Q 132 280 140 283 L 138 330 Q 128 328 123 310 Z",
      "M 175 285 Q 168 280 160 283 L 162 330 Q 172 328 177 310 Z",
    ],
    label: "Calves",
    cx: 150, cy: 308,
  },
};

const BODY_OUTLINE_FRONT = "M 150 30 Q 165 30 170 45 Q 175 58 170 70 Q 165 80 158 82 Q 175 85 185 95 Q 200 82 208 100 Q 215 120 210 155 Q 208 170 205 185 L 200 210 Q 195 205 188 202 Q 180 200 175 202 L 180 220 Q 185 260 180 290 Q 178 310 176 330 Q 174 340 170 345 L 162 345 Q 158 340 158 330 L 160 290 Q 162 270 158 250 Q 155 240 152 250 Q 150 260 148 250 Q 145 240 142 250 Q 138 270 140 290 L 142 330 Q 142 340 138 345 L 130 345 Q 126 340 124 330 Q 122 310 120 290 Q 115 260 120 220 L 125 202 Q 120 200 115 202 Q 108 205 100 210 L 95 185 Q 92 170 90 155 Q 85 120 92 100 Q 100 82 115 95 Q 125 85 142 82 Q 135 80 130 70 Q 125 58 130 45 Q 135 30 150 30 Z";

const BODY_OUTLINE_BACK = "M 150 30 Q 165 30 170 45 Q 175 58 170 70 Q 165 80 158 82 Q 175 85 185 95 Q 200 82 208 100 Q 215 120 210 155 Q 208 170 205 185 L 200 210 Q 195 205 188 202 Q 180 200 175 202 L 180 220 Q 185 260 180 290 Q 178 310 176 330 Q 174 340 170 345 L 162 345 Q 158 340 158 330 L 160 290 Q 162 270 158 250 Q 155 240 152 250 Q 150 260 148 250 Q 145 240 142 250 Q 138 270 140 290 L 142 330 Q 142 340 138 345 L 130 345 Q 126 340 124 330 Q 122 310 120 290 Q 115 260 120 220 L 125 202 Q 120 200 115 202 Q 108 205 100 210 L 95 185 Q 92 170 90 155 Q 85 120 92 100 Q 100 82 115 95 Q 125 85 142 82 Q 135 80 130 70 Q 125 58 130 45 Q 135 30 150 30 Z";

function getColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery && recoveryData[muscle]) {
    const level = recoveryData[muscle];
    return RECOVERY_COLORS[level] || RECOVERY_COLORS.fresh;
  }
  const rank = muscleRanks[muscle] || "none";
  return RANK_COLORS[rank] || RANK_COLORS.none;
}

function MuscleView({ muscles, outline, muscleRanks, recoveryData, showRecovery }) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  return (
    <svg viewBox="60 20 180 340" className="w-full h-full max-h-[400px]">
      {/* Body outline */}
      <path
        d={outline}
        fill="hsl(var(--secondary))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Muscle groups */}
      {Object.entries(muscles).map(([muscleKey, data]) =>
        data.paths.map((path, i) => (
          <path
            key={`${muscleKey}-${i}`}
            d={path}
            fill={getColor(muscleKey, muscleRanks, recoveryData, showRecovery)}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="0.5"
            opacity={hoveredMuscle === muscleKey ? 0.9 : 0.75}
            className="transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setHoveredMuscle(muscleKey)}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => setHoveredMuscle(muscleKey === hoveredMuscle ? null : muscleKey)}
          />
        ))
      )}
      
      {/* Hovered muscle label */}
      {hoveredMuscle && muscles[hoveredMuscle] && (
        <g>
          <rect
            x={muscles[hoveredMuscle].cx - 30}
            y={muscles[hoveredMuscle].cy - 24}
            width="60"
            height="18"
            rx="4"
            fill="hsl(var(--popover))"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
          />
          <text
            x={muscles[hoveredMuscle].cx}
            y={muscles[hoveredMuscle].cy - 12}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize="8"
            fontWeight="600"
          >
            {muscles[hoveredMuscle].label}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");

  return (
    <div className="relative">
      {/* View indicator */}
      <div className="flex justify-center gap-2 mb-2">
        <button
          onClick={() => setView("front")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            view === "front"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Front
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            view === "back"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Back
        </button>
      </div>

      {/* Swipeable muscle model */}
      <div
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          e.currentTarget._startX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0];
          const diff = touch.clientX - (e.currentTarget._startX || 0);
          if (Math.abs(diff) > 50) {
            setView(diff > 0 ? "front" : "back");
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === "front" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === "front" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center"
          >
            <MuscleView
              muscles={view === "front" ? FRONT_MUSCLES : BACK_MUSCLES}
              outline={view === "front" ? BODY_OUTLINE_FRONT : BODY_OUTLINE_BACK}
              muscleRanks={muscleRanks}
              recoveryData={recoveryData}
              showRecovery={showRecovery}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-[10px] text-muted-foreground mt-1">
        Swipe to rotate • Tap muscles for details
      </p>
    </div>
  );
}