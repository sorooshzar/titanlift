import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RANK_COLORS = {
  none: "hsl(var(--secondary))",
  wood: "#6B4C11",
  bronze: "#CD7F32",
  silver: "#9B9BB0",
  gold: "#FFD700",
  platinum: "#7EC8D4",
  diamond: "#4DD8FF",
  champion: "#9B59B6",
  titan: "#E74C3C",
  olympian: "#FF6B35",
};

const RECOVERY_COLORS = {
  fresh: "hsl(var(--secondary))",
  light: "#1e4d10",
  moderate: "#5a4300",
  heavy: "#5a2200",
  sore: "#5a0000",
};

function getColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery) {
    const level = recoveryData[muscle];
    return RECOVERY_COLORS[level] || RECOVERY_COLORS.fresh;
  }
  const rank = muscleRanks[muscle] || "none";
  return RANK_COLORS[rank];
}

function MuscleView({ view, muscleRanks, recoveryData, showRecovery }) {
  const [hovered, setHovered] = useState(null);

  const bodyFill = "hsl(var(--muted))";
  const skinTone = "hsl(var(--secondary))";
  const stroke = "hsl(var(--border))";

  const c = (muscle) => getColor(muscle, muscleRanks, recoveryData, showRecovery);
  const h = (muscle) => hovered === muscle;
  const op = (muscle) => {
    const col = c(muscle);
    if (col === "hsl(var(--secondary))" || col === "hsl(var(--muted))") return 0.5;
    return h(muscle) ? 1 : 0.82;
  };
  const sw = (muscle) => h(muscle) ? 1.5 : 0.5;
  const sc = (muscle) => h(muscle) ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.15)";

  const mp = (muscle) => ({
    fill: c(muscle),
    stroke: sc(muscle),
    strokeWidth: sw(muscle),
    opacity: op(muscle),
    className: "transition-all duration-150 cursor-pointer",
    onMouseEnter: () => setHovered(muscle),
    onMouseLeave: () => setHovered(null),
    onTouchStart: () => setHovered(p => p === muscle ? null : muscle),
  });

  const LABELS = {
    chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
    forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
    traps: "Traps", lats: "Lats", back: "Mid Back", glutes: "Glutes",
    hamstrings: "Hamstrings",
  };

  return (
    <div className="relative flex justify-center">
      <svg viewBox="0 0 200 380" className="w-full" style={{ maxHeight: 360, maxWidth: 180 }}>
        {view === "front" ? (
          <>
            {/* === FRONT VIEW === */}
            {/* Body base */}
            <ellipse cx="100" cy="26" rx="14" ry="16" fill={skinTone} stroke={stroke} strokeWidth="1" />
            {/* Neck */}
            <rect x="93" y="38" width="14" height="12" rx="4" fill={skinTone} stroke={stroke} strokeWidth="0.5" />
            {/* Torso */}
            <path d="M 68 50 Q 62 54 60 72 L 58 130 Q 57 140 60 148 L 65 182 Q 68 195 72 200 L 78 202 L 78 210 L 122 210 L 122 202 L 128 200 Q 132 195 135 182 L 140 148 Q 143 140 142 130 L 140 72 Q 138 54 132 50 Q 120 44 100 44 Q 80 44 68 50 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            {/* Arms */}
            <path d="M 60 52 Q 50 56 48 72 Q 46 88 47 106 Q 48 122 52 132 L 58 130 L 60 72 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 140 52 Q 150 56 152 72 Q 154 88 153 106 Q 152 122 148 132 L 142 130 L 140 72 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            {/* Forearms */}
            <path d="M 46 108 Q 44 120 44 132 Q 44 146 46 158 Q 48 166 52 170 L 56 168 Q 54 152 54 138 Q 54 124 56 110 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 154 108 Q 156 120 156 132 Q 156 146 154 158 Q 152 166 148 170 L 144 168 Q 146 152 146 138 Q 146 124 144 110 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            {/* Legs */}
            <path d="M 72 210 L 68 310 Q 68 330 70 344 L 80 344 Q 82 330 82 310 L 84 222 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 128 210 L 132 310 Q 132 330 130 344 L 120 344 Q 118 330 118 310 L 116 222 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            {/* Feet */}
            <ellipse cx="74" cy="348" rx="9" ry="5" fill={skinTone} stroke={stroke} strokeWidth="0.8" />
            <ellipse cx="126" cy="348" rx="9" ry="5" fill={skinTone} stroke={stroke} strokeWidth="0.8" />

            {/* CHEST */}
            <path d="M 72 58 Q 68 62 66 74 L 68 96 Q 72 104 82 108 Q 90 110 98 108 L 98 72 Q 90 60 72 58 Z" {...mp("chest")} />
            <path d="M 128 58 Q 132 62 134 74 L 132 96 Q 128 104 118 108 Q 110 110 102 108 L 102 72 Q 110 60 128 58 Z" {...mp("chest")} />
            {/* SHOULDERS */}
            <path d="M 60 52 Q 52 54 50 64 Q 48 74 52 80 Q 56 86 62 84 L 66 70 Q 64 58 60 52 Z" {...mp("shoulders")} />
            <path d="M 140 52 Q 148 54 150 64 Q 152 74 148 80 Q 144 86 138 84 L 134 70 Q 136 58 140 52 Z" {...mp("shoulders")} />
            {/* BICEPS */}
            <path d="M 52 82 Q 48 88 48 100 Q 48 112 52 120 L 58 118 Q 56 106 56 94 Q 56 86 58 80 Z" {...mp("biceps")} />
            <path d="M 148 82 Q 152 88 152 100 Q 152 112 148 120 L 142 118 Q 144 106 144 94 Q 144 86 142 80 Z" {...mp("biceps")} />
            {/* FOREARMS */}
            <path d="M 46 110 Q 44 122 44 134 Q 44 148 47 158 L 54 156 Q 52 144 52 132 Q 52 120 54 110 Z" {...mp("forearms")} />
            <path d="M 154 110 Q 156 122 156 134 Q 156 148 153 158 L 146 156 Q 148 144 148 132 Q 148 120 146 110 Z" {...mp("forearms")} />
            {/* ABS */}
            <path d="M 84 110 Q 82 116 82 124 L 84 140 Q 90 144 100 144 Q 110 144 116 140 L 118 124 Q 118 116 116 110 Q 108 106 100 106 Q 92 106 84 110 Z" {...mp("abs")} />
            <path d="M 83 142 Q 82 150 82 158 L 84 174 Q 90 178 100 178 Q 110 178 116 174 L 118 158 Q 118 150 117 142 Q 108 138 100 138 Q 92 138 83 142 Z" {...mp("abs")} />
            <path d="M 84 176 Q 83 182 84 190 L 86 200 Q 92 204 100 204 Q 108 204 114 200 L 116 190 Q 117 182 116 176 Q 108 172 100 172 Q 92 172 84 176 Z" {...mp("abs")} />
            {/* QUADS */}
            <path d="M 72 212 Q 68 220 68 240 Q 68 268 70 288 L 76 292 Q 80 272 80 250 Q 80 228 80 214 Z" {...mp("quads")} />
            <path d="M 80 214 Q 82 224 82 244 Q 82 268 80 292 L 90 296 Q 94 272 94 248 Q 94 224 90 214 Z" {...mp("quads")} />
            <path d="M 120 214 Q 118 224 118 244 Q 118 268 120 292 L 110 296 Q 106 272 106 248 Q 106 224 110 214 Z" {...mp("quads")} />
            <path d="M 128 212 Q 132 220 132 240 Q 132 268 130 288 L 124 292 Q 120 272 120 250 Q 120 228 120 214 Z" {...mp("quads")} />
            {/* CALVES */}
            <path d="M 68 296 Q 66 308 67 322 Q 68 334 72 342 L 80 342 Q 82 330 82 318 Q 82 306 80 294 Z" {...mp("calves")} />
            <path d="M 132 296 Q 134 308 133 322 Q 132 334 128 342 L 120 342 Q 118 330 118 318 Q 118 306 120 294 Z" {...mp("calves")} />
          </>
        ) : (
          <>
            {/* === BACK VIEW === */}
            {/* Body base */}
            <ellipse cx="100" cy="26" rx="14" ry="16" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <rect x="93" y="38" width="14" height="12" rx="4" fill={skinTone} stroke={stroke} strokeWidth="0.5" />
            <path d="M 68 50 Q 62 54 60 72 L 58 130 Q 57 140 60 148 L 65 182 Q 68 195 72 200 L 78 202 L 78 210 L 122 210 L 122 202 L 128 200 Q 132 195 135 182 L 140 148 Q 143 140 142 130 L 140 72 Q 138 54 132 50 Q 120 44 100 44 Q 80 44 68 50 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 60 52 Q 50 56 48 72 Q 46 88 47 106 Q 48 122 52 132 L 58 130 L 60 72 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 140 52 Q 150 56 152 72 Q 154 88 153 106 Q 152 122 148 132 L 142 130 L 140 72 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 46 108 Q 44 120 44 132 Q 44 146 46 158 Q 48 166 52 170 L 56 168 Q 54 152 54 138 Q 54 124 56 110 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 154 108 Q 156 120 156 132 Q 156 146 154 158 Q 152 166 148 170 L 144 168 Q 146 152 146 138 Q 146 124 144 110 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 72 210 L 68 310 Q 68 330 70 344 L 80 344 Q 82 330 82 310 L 84 222 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <path d="M 128 210 L 132 310 Q 132 330 130 344 L 120 344 Q 118 330 118 310 L 116 222 Z" fill={skinTone} stroke={stroke} strokeWidth="1" />
            <ellipse cx="74" cy="348" rx="9" ry="5" fill={skinTone} stroke={stroke} strokeWidth="0.8" />
            <ellipse cx="126" cy="348" rx="9" ry="5" fill={skinTone} stroke={stroke} strokeWidth="0.8" />

            {/* TRAPS */}
            <path d="M 72 50 Q 80 46 100 44 Q 120 46 128 50 Q 122 62 114 66 Q 108 70 100 70 Q 92 70 86 66 Q 78 62 72 50 Z" {...mp("traps")} />
            {/* REAR SHOULDERS */}
            <path d="M 60 52 Q 52 54 50 64 Q 48 74 52 80 Q 56 86 62 84 L 66 70 Q 64 58 60 52 Z" {...mp("shoulders")} />
            <path d="M 140 52 Q 148 54 150 64 Q 152 74 148 80 Q 144 86 138 84 L 134 70 Q 136 58 140 52 Z" {...mp("shoulders")} />
            {/* TRICEPS */}
            <path d="M 52 82 Q 48 88 48 100 Q 48 112 52 120 L 58 118 Q 56 106 56 94 Q 56 86 58 80 Z" {...mp("triceps")} />
            <path d="M 148 82 Q 152 88 152 100 Q 152 112 148 120 L 142 118 Q 144 106 144 94 Q 144 86 142 80 Z" {...mp("triceps")} />
            {/* FOREARMS BACK */}
            <path d="M 46 110 Q 44 122 44 134 Q 44 148 47 158 L 54 156 Q 52 144 52 132 Q 52 120 54 110 Z" {...mp("forearms")} />
            <path d="M 154 110 Q 156 122 156 134 Q 156 148 153 158 L 146 156 Q 148 144 148 132 Q 148 120 146 110 Z" {...mp("forearms")} />
            {/* LATS */}
            <path d="M 64 74 Q 60 86 60 106 Q 60 124 64 138 L 78 148 Q 80 140 80 120 Q 80 100 78 82 Z" {...mp("lats")} />
            <path d="M 136 74 Q 140 86 140 106 Q 140 124 136 138 L 122 148 Q 120 140 120 120 Q 120 100 122 82 Z" {...mp("lats")} />
            {/* MID BACK */}
            <path d="M 78 80 Q 82 76 100 74 Q 118 76 122 80 L 120 148 Q 108 152 100 152 Q 92 152 80 148 Z" {...mp("back")} />
            {/* LOWER BACK */}
            <path d="M 80 150 Q 84 148 100 148 Q 116 148 120 150 L 118 180 Q 108 184 100 184 Q 92 184 82 180 Z" {...mp("back")} />
            {/* GLUTES */}
            <path d="M 76 200 Q 72 196 70 204 Q 68 214 70 222 Q 72 230 80 234 L 98 236 L 98 210 Q 90 208 76 200 Z" {...mp("glutes")} />
            <path d="M 124 200 Q 128 196 130 204 Q 132 214 130 222 Q 128 230 120 234 L 102 236 L 102 210 Q 110 208 124 200 Z" {...mp("glutes")} />
            {/* HAMSTRINGS */}
            <path d="M 70 236 Q 68 248 68 264 Q 68 282 70 296 L 82 296 Q 82 278 82 260 Q 82 242 80 236 Z" {...mp("hamstrings")} />
            <path d="M 80 236 Q 82 246 84 262 Q 86 280 86 298 L 96 296 Q 96 278 94 260 Q 92 244 90 236 Z" {...mp("hamstrings")} />
            <path d="M 120 236 Q 118 246 116 262 Q 114 280 114 298 L 104 296 Q 104 278 106 260 Q 108 244 110 236 Z" {...mp("hamstrings")} />
            <path d="M 130 236 Q 132 248 132 264 Q 132 282 130 296 L 118 296 Q 118 278 118 260 Q 118 242 120 236 Z" {...mp("hamstrings")} />
            {/* CALVES BACK */}
            <path d="M 68 298 Q 66 310 67 324 Q 68 336 72 344 L 80 344 Q 82 332 82 320 Q 82 308 80 298 Z" {...mp("calves")} />
            <path d="M 132 298 Q 134 310 133 324 Q 132 336 128 344 L 120 344 Q 118 332 118 320 Q 118 308 120 298 Z" {...mp("calves")} />
          </>
        )}

        {/* Tooltip */}
        {hovered && (
          <g>
            <rect x="60" y="188" width="80" height="20" rx="4"
              fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth="0.8" />
            <text x="100" y="201" textAnchor="middle"
              fill="hsl(var(--foreground))" fontSize="8.5" fontWeight="700">
              {LABELS[hovered] || hovered}
              {!showRecovery && (muscleRanks[hovered] && muscleRanks[hovered] !== "none")
                ? ` · ${muscleRanks[hovered].charAt(0).toUpperCase() + muscleRanks[hovered].slice(1)}`
                : ""}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");

  return (
    <div className="relative">
      <div className="flex justify-center gap-2 mb-2">
        <button onClick={() => setView("front")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${view === "front" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
          Front
        </button>
        <button onClick={() => setView("back")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${view === "back" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
          Back
        </button>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={(e) => { e.currentTarget._sx = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].clientX - (e.currentTarget._sx || 0);
          if (Math.abs(diff) > 40) setView(diff > 0 ? "front" : "back");
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={view}
            initial={{ opacity: 0, x: view === "front" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === "front" ? 20 : -20 }}
            transition={{ duration: 0.15 }}>
            <MuscleView view={view} muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} />
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-1">Swipe or tap to switch view</p>
    </div>
  );
}