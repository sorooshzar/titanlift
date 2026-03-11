import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FRONT_IMG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/a139f9413_Screenshot2026-03-10200846-jukebox-bg-removed.png";
const BACK_IMG  = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/961747e0d_Backmusle-jukebox-bg-removed.png";

// viewBox matches the image dimensions (621 × 908)
const W = 621;
const H = 908;

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

function getColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery) return RECOVERY_COLORS[recoveryData[muscle]] || null;
  return RANK_COLORS[muscleRanks[muscle]] || null;
}

function useMp(muscleRanks, recoveryData, showRecovery, onMuscleClick) {
  const [hovered, setHovered] = useState(null);
  const mp = (muscle) => {
    const color = getColor(muscle, muscleRanks, recoveryData, showRecovery);
    const isHov = hovered === muscle;
    return {
      fill: color || "white",
      fillOpacity: color ? (isHov ? 0.75 : 0.55) : (isHov ? 0.30 : 0),
      stroke: isHov ? "rgba(255,255,255,0.9)" : "none",
      strokeWidth: 3,
      style: { cursor: "pointer", transition: "all 0.15s" },
      onMouseEnter: () => setHovered(muscle),
      onMouseLeave: () => setHovered(null),
      onTouchStart: (e) => { e.stopPropagation(); setHovered(muscle); },
      onTouchEnd: (e) => { e.stopPropagation(); setHovered(null); onMuscleClick(muscle); },
      onClick: () => onMuscleClick(muscle),
    };
  };
  return { mp, hovered };
}

function FrontBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const { mp, hovered } = useMp(muscleRanks, recoveryData, showRecovery, onMuscleClick);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <image href={FRONT_IMG} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid meet" />

      {/* ── SHOULDERS ── */}
      <ellipse cx="168" cy="268" rx="68" ry="58" {...mp("shoulders")} transform="rotate(-15,168,268)" />
      <ellipse cx="453" cy="268" rx="68" ry="58" {...mp("shoulders")} transform="rotate(15,453,268)" />

      {/* ── CHEST (left & right pec) ── */}
      <path d="M 200 240 Q 170 270 172 330 Q 178 362 230 375 Q 260 380 310 378 L 310 240 Q 262 228 200 240 Z" {...mp("chest")} />
      <path d="M 420 240 Q 450 270 448 330 Q 442 362 390 375 Q 360 380 310 378 L 310 240 Q 358 228 420 240 Z" {...mp("chest")} />

      {/* ── ABS ── */}
      <path d="M 252 376 Q 242 416 244 454 Q 246 490 252 524 Q 262 560 310 564 Q 358 560 368 524 Q 374 490 376 454 Q 378 416 368 376 Q 344 368 310 368 Q 276 368 252 376 Z" {...mp("abs")} />

      {/* ── BICEPS ── */}
      {/* left outer upper arm */}
      <path d="M 106 278 Q 86 320 88 374 Q 90 406 108 424 L 156 416 Q 142 392 140 358 Q 138 318 148 278 Z" {...mp("biceps")} />
      {/* right outer upper arm */}
      <path d="M 515 278 Q 535 320 533 374 Q 531 406 513 424 L 465 416 Q 479 392 481 358 Q 483 318 473 278 Z" {...mp("biceps")} />

      {/* ── FOREARMS ── */}
      <path d="M 80 426 Q 64 470 68 516 Q 72 546 88 562 L 140 554 Q 128 530 126 500 Q 124 466 132 432 Z" {...mp("forearms")} />
      <path d="M 541 426 Q 557 470 553 516 Q 549 546 533 562 L 481 554 Q 493 530 495 500 Q 497 466 489 432 Z" {...mp("forearms")} />

      {/* ── QUADS ── */}
      {/* left leg */}
      <path d="M 176 596 Q 162 644 164 696 Q 166 742 178 778 L 272 778 Q 278 744 276 698 Q 274 646 268 596 Z" {...mp("quads")} />
      {/* right leg */}
      <path d="M 353 596 Q 347 646 345 698 Q 343 744 349 778 L 443 778 Q 455 742 457 696 Q 459 644 445 596 Z" {...mp("quads")} />

      {/* ── CALVES ── */}
      <path d="M 182 796 Q 172 832 174 858 Q 178 878 194 886 L 264 886 Q 274 874 274 852 Q 272 826 264 798 Z" {...mp("calves")} />
      <path d="M 357 798 Q 349 826 347 852 Q 347 874 357 886 L 427 886 Q 443 878 447 858 Q 449 832 439 796 Z" {...mp("calves")} />

      {/* Hover label */}
      {hovered && (
        <g>
          <rect x="175" y="16" width="272" height="42" rx="10" fill="rgba(0,0,0,0.80)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <text x="311" y="44" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" letterSpacing="0.5">
            {MUSCLE_LABELS[hovered]}
          </text>
        </g>
      )}
    </svg>
  );
}

function BackBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const { mp, hovered } = useMp(muscleRanks, recoveryData, showRecovery, onMuscleClick);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <image href={BACK_IMG} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid meet" />

      {/* ── TRAPS ── */}
      <path d="M 206 226 Q 226 208 310 206 Q 394 208 414 226 Q 396 286 362 306 Q 338 316 310 316 Q 282 316 258 306 Q 224 286 206 226 Z" {...mp("traps")} />

      {/* ── REAR SHOULDERS ── */}
      <ellipse cx="166" cy="276" rx="66" ry="56" {...mp("shoulders")} transform="rotate(-15,166,276)" />
      <ellipse cx="455" cy="276" rx="66" ry="56" {...mp("shoulders")} transform="rotate(15,455,276)" />

      {/* ── LATS ── */}
      <path d="M 148 316 Q 134 362 138 420 Q 142 466 158 500 L 256 510 Q 250 462 248 412 Q 246 360 254 316 Z" {...mp("lats")} />
      <path d="M 473 316 Q 487 362 483 420 Q 479 466 463 500 L 365 510 Q 371 462 373 412 Q 375 360 367 316 Z" {...mp("lats")} />

      {/* ── MID / UPPER BACK ── */}
      <path d="M 254 310 Q 270 300 310 298 Q 350 300 366 310 L 364 500 Q 344 514 310 516 Q 276 514 256 500 Z" {...mp("back")} />

      {/* ── LOWER BACK ── */}
      <path d="M 256 502 Q 276 516 310 518 Q 344 516 364 502 L 362 568 Q 346 590 310 594 Q 274 590 258 568 Z" {...mp("back")} />

      {/* ── TRICEPS ── */}
      <path d="M 100 282 Q 80 326 84 382 Q 88 414 106 430 L 154 420 Q 140 396 138 360 Q 136 320 148 282 Z" {...mp("triceps")} />
      <path d="M 521 282 Q 541 326 537 382 Q 533 414 515 430 L 467 420 Q 481 396 483 360 Q 485 320 473 282 Z" {...mp("triceps")} />

      {/* ── FOREARMS ── */}
      <path d="M 76 432 Q 60 474 64 520 Q 68 550 84 566 L 138 558 Q 124 534 122 504 Q 120 468 130 436 Z" {...mp("forearms")} />
      <path d="M 545 432 Q 561 474 557 520 Q 553 550 537 566 L 483 558 Q 497 534 499 504 Q 501 468 491 436 Z" {...mp("forearms")} />

      {/* ── GLUTES ── */}
      <path d="M 176 592 Q 166 636 170 672 Q 174 700 194 714 L 310 716 L 310 592 Z" {...mp("glutes")} />
      <path d="M 445 592 Q 455 636 451 672 Q 447 700 427 714 L 310 716 L 310 592 Z" {...mp("glutes")} />

      {/* ── HAMSTRINGS ── */}
      <path d="M 170 716 Q 160 758 162 800 Q 164 832 178 854 L 280 854 Q 284 828 282 796 Q 280 756 276 716 Z" {...mp("hamstrings")} />
      <path d="M 345 716 Q 341 756 339 796 Q 337 828 341 854 L 443 854 Q 457 832 459 800 Q 461 758 451 716 Z" {...mp("hamstrings")} />

      {/* ── CALVES ── */}
      <path d="M 178 858 Q 168 886 174 906 L 276 906 Q 280 886 278 858 Z" {...mp("calves")} />
      <path d="M 343 858 Q 341 886 345 906 L 447 906 Q 453 886 443 858 Z" {...mp("calves")} />

      {/* Hover label */}
      {hovered && (
        <g>
          <rect x="175" y="16" width="272" height="42" rx="10" fill="rgba(0,0,0,0.80)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <text x="311" y="44" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" letterSpacing="0.5">
            {MUSCLE_LABELS[hovered]}
          </text>
        </g>
      )}
    </svg>
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
            transition={{ duration: 0.15 }}
            className="w-48">
            {view === "front"
              ? <FrontBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={setClickedMuscle} />
              : <BackBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={setClickedMuscle} />
            }
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-1">Tap muscle to find exercises · Swipe to flip</p>

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
                className="w-full mt-2 text-xs text-muted-foreground py-1.5">Cancel</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}