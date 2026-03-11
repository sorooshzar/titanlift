import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const IMAGE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/89392746b_Screenshot2026-03-10200846.jpg";

const RANK_COLORS = {
  none: null, wood: "#8B5E3C", bronze: "#CD7F32", silver: "#9B9BB0",
  gold: "#FFD700", platinum: "#7EC8D4", diamond: "#4DD8FF",
  champion: "#9B59B6", titan: "#E74C3C", olympian: "#FF6B35",
};

const RECOVERY_COLORS = {
  fresh: null, light: "#2d5a1b", moderate: "#7a5c00", heavy: "#7a3000", sore: "#7a0000",
};

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
  traps: "Traps", lats: "Lats", back: "Back", glutes: "Glutes", hamstrings: "Hamstrings",
};

function getOverlayColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery) return RECOVERY_COLORS[recoveryData[muscle]] || null;
  return RANK_COLORS[muscleRanks[muscle]] || null;
}

function useMuscleProps(muscleRanks, recoveryData, showRecovery, onMuscleClick) {
  const [hovered, setHovered] = useState(null);
  const mp = (muscle) => {
    const color = getOverlayColor(muscle, muscleRanks, recoveryData, showRecovery);
    const isHov = hovered === muscle;
    return {
      fill: color || (isHov ? "white" : "transparent"),
      fillOpacity: color ? (isHov ? 0.72 : 0.52) : (isHov ? 0.18 : 0),
      stroke: isHov ? "rgba(255,255,255,0.7)" : "none",
      strokeWidth: 2.5,
      style: { cursor: "pointer", transition: "all 0.15s" },
      onMouseEnter: () => setHovered(muscle),
      onMouseLeave: () => setHovered(null),
      onTouchStart: () => setHovered(muscle),
      onTouchEnd: () => { setHovered(null); onMuscleClick(muscle); },
      onClick: () => onMuscleClick(muscle),
    };
  };
  return { mp, hovered };
}

// Viewbox matches one half of the image: ~512 × 536
const VB = "0 0 512 536";

function FrontBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const { mp, hovered } = useMuscleProps(muscleRanks, recoveryData, showRecovery, onMuscleClick);

  return (
    <div className="relative w-full" style={{ paddingBottom: "104.7%" }}>
      {/* Image – show left half */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <img src={IMAGE_URL} alt="Front body"
          draggable={false}
          style={{ position: "absolute", top: 0, left: 0, width: "200%", height: "auto", userSelect: "none" }}
        />
      </div>

      {/* Clickable muscle overlays */}
      <svg className="absolute inset-0 w-full h-full" viewBox={VB} style={{ pointerEvents: "none" }}>
        <g style={{ pointerEvents: "all" }}>
          {/* SHOULDERS */}
          <ellipse cx="118" cy="168" rx="56" ry="48" {...mp("shoulders")} transform="rotate(-18,118,168)" />
          <ellipse cx="394" cy="168" rx="56" ry="48" {...mp("shoulders")} transform="rotate(18,394,168)" />

          {/* CHEST */}
          <path d="M 148 148 Q 120 178 126 230 Q 138 260 256 262 L 256 148 Q 206 136 148 148 Z" {...mp("chest")} />
          <path d="M 364 148 Q 392 178 386 230 Q 374 260 256 262 L 256 148 Q 306 136 364 148 Z" {...mp("chest")} />

          {/* ABS */}
          <path d="M 196 260 Q 190 316 194 362 Q 204 394 256 398 Q 308 394 318 362 Q 322 316 316 260 Z" {...mp("abs")} />

          {/* BICEPS */}
          <path d="M 62 164 Q 46 206 50 260 Q 54 292 76 308 L 122 290 Q 104 264 100 230 Q 96 194 106 164 Z" {...mp("biceps")} />
          <path d="M 450 164 Q 466 206 462 260 Q 458 292 436 308 L 390 290 Q 408 264 412 230 Q 416 194 406 164 Z" {...mp("biceps")} />

          {/* FOREARMS */}
          <path d="M 44 302 Q 34 342 38 382 Q 42 408 58 420 L 104 410 Q 92 386 90 358 Q 88 328 96 302 Z" {...mp("forearms")} />
          <path d="M 468 302 Q 478 342 474 382 Q 470 408 454 420 L 408 410 Q 420 386 422 358 Q 424 328 416 302 Z" {...mp("forearms")} />

          {/* QUADS left */}
          <path d="M 146 396 Q 134 438 138 478 Q 142 506 158 518 L 252 518 Q 252 490 250 460 Q 248 430 252 396 Z" {...mp("quads")} />
          {/* QUADS right */}
          <path d="M 260 396 Q 264 430 262 460 Q 260 490 260 518 L 354 518 Q 370 506 374 478 Q 378 438 366 396 Z" {...mp("quads")} />

          {/* CALVES */}
          <path d="M 148 520 Q 140 535 144 536 L 248 536 Q 250 534 248 520 Z" {...mp("calves")} />
          <path d="M 264 520 Q 262 534 264 536 L 368 536 Q 372 534 364 520 Z" {...mp("calves")} />
        </g>

        {/* Hover label */}
        {hovered && (
          <g>
            <rect x="156" y="14" width="200" height="34" rx="8" fill="rgba(0,0,0,0.82)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
            <text x="256" y="36" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" letterSpacing="0.5">
              {MUSCLE_LABELS[hovered] || hovered}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function BackBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const { mp, hovered } = useMuscleProps(muscleRanks, recoveryData, showRecovery, onMuscleClick);

  return (
    <div className="relative w-full" style={{ paddingBottom: "104.7%" }}>
      {/* Image – show right half */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <img src={IMAGE_URL} alt="Back body"
          draggable={false}
          style={{ position: "absolute", top: 0, left: "-100%", width: "200%", height: "auto", userSelect: "none" }}
        />
      </div>

      {/* Clickable muscle overlays */}
      <svg className="absolute inset-0 w-full h-full" viewBox={VB} style={{ pointerEvents: "none" }}>
        <g style={{ pointerEvents: "all" }}>
          {/* TRAPS */}
          <path d="M 180 128 Q 196 112 256 110 Q 316 112 332 128 Q 318 180 288 196 Q 272 204 256 204 Q 240 204 224 196 Q 194 180 180 128 Z" {...mp("traps")} />

          {/* REAR SHOULDERS */}
          <ellipse cx="114" cy="170" rx="58" ry="50" {...mp("shoulders")} transform="rotate(-18,114,170)" />
          <ellipse cx="398" cy="170" rx="58" ry="50" {...mp("shoulders")} transform="rotate(18,398,170)" />

          {/* LATS */}
          <path d="M 98 196 Q 86 236 90 284 Q 94 326 106 352 L 200 368 Q 198 330 194 290 Q 190 246 200 208 Z" {...mp("lats")} />
          <path d="M 414 196 Q 426 236 422 284 Q 418 326 406 352 L 312 368 Q 314 330 318 290 Q 322 246 312 208 Z" {...mp("lats")} />

          {/* MID BACK */}
          <path d="M 200 204 Q 218 196 256 194 Q 294 196 312 204 L 314 366 Q 296 380 256 382 Q 216 380 198 366 Z" {...mp("back")} />

          {/* LOWER BACK */}
          <path d="M 198 368 Q 218 380 256 382 Q 294 380 314 368 L 312 408 Q 294 428 256 430 Q 218 428 200 408 Z" {...mp("back")} />

          {/* TRICEPS */}
          <path d="M 56 162 Q 40 202 44 258 Q 48 292 68 310 L 114 292 Q 96 266 94 232 Q 92 196 102 162 Z" {...mp("triceps")} />
          <path d="M 456 162 Q 472 202 468 258 Q 464 292 444 310 L 398 292 Q 416 266 418 232 Q 420 196 410 162 Z" {...mp("triceps")} />

          {/* FOREARMS */}
          <path d="M 40 304 Q 30 344 34 384 Q 38 410 54 422 L 100 412 Q 88 388 86 360 Q 84 330 92 304 Z" {...mp("forearms")} />
          <path d="M 472 304 Q 482 344 478 384 Q 474 410 458 422 L 412 412 Q 424 388 426 360 Q 428 330 420 304 Z" {...mp("forearms")} />

          {/* GLUTES */}
          <path d="M 146 408 Q 134 444 138 476 Q 142 498 162 510 L 258 512 L 258 408 Z" {...mp("glutes")} />
          <path d="M 366 408 Q 378 444 374 476 Q 370 498 350 510 L 254 512 L 254 408 Z" {...mp("glutes")} />

          {/* HAMSTRINGS */}
          <path d="M 138 508 Q 132 530 134 536 L 252 536 Q 254 530 254 508 Z" {...mp("hamstrings")} />
          <path d="M 258 508 L 258 536 L 378 536 Q 380 530 374 508 Z" {...mp("hamstrings")} />

          {/* CALVES */}
          <path d="M 140 504 Q 134 520 136 528 L 244 528 Q 246 520 244 504 Z" {...mp("calves")} />
          <path d="M 268 504 L 266 528 L 376 528 Q 378 520 372 504 Z" {...mp("calves")} />
        </g>

        {/* Hover label */}
        {hovered && (
          <g>
            <rect x="156" y="14" width="200" height="34" rx="8" fill="rgba(0,0,0,0.82)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
            <text x="256" y="36" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" letterSpacing="0.5">
              {MUSCLE_LABELS[hovered] || hovered}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function MuscleModel({ muscleRanks = {}, recoveryData = {}, showRecovery = false }) {
  const [view, setView] = useState("front");
  const [clickedMuscle, setClickedMuscle] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* View toggle */}
      <div className="flex justify-center gap-2 mb-3">
        {["front", "back"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition-all ${view === v ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
            {v}
          </button>
        ))}
      </div>

      {/* Body figure */}
      <div
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
            {view === "front"
              ? <FrontBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={setClickedMuscle} />
              : <BackBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={setClickedMuscle} />
            }
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-1">Tap muscle to find exercises · Swipe to flip</p>

      {/* Muscle click popup */}
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
              <button onClick={() => { navigate(createPageUrl(`Lifts?tab=exercises&muscle=${clickedMuscle}`)); setClickedMuscle(null); }}
                className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold">
                Find exercises for {MUSCLE_LABELS[clickedMuscle]}
              </button>
              <button onClick={() => setClickedMuscle(null)}
                className="w-full mt-2 text-xs text-muted-foreground py-1.5">
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}