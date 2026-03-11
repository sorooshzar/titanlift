import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FRONT_IMG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/a139f9413_Screenshot2026-03-10200846-jukebox-bg-removed.png";
const BACK_IMG  = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69af97ab684417936d1f4020/961747e0d_Backmusle-jukebox-bg-removed.png";

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

      {/* ── SHOULDERS – 50% smaller, up + inward ── */}
      <ellipse cx="196" cy="232" rx="36" ry="30" {...mp("shoulders")} transform="rotate(-15,196,232)" />
      <ellipse cx="425" cy="232" rx="36" ry="30" {...mp("shoulders")} transform="rotate(15,425,232)" />

      {/* ── CHEST – smaller, higher ── */}
      <path d="M 222 228 Q 205 248 208 292 Q 214 316 250 326 Q 278 332 310 330 L 310 228 Q 272 220 222 228 Z" {...mp("chest")} />
      <path d="M 398 228 Q 415 248 412 292 Q 406 316 370 326 Q 342 332 310 330 L 310 228 Q 348 220 398 228 Z" {...mp("chest")} />

      {/* ── ABS – smaller, higher ── */}
      <path d="M 268 330 Q 260 358 260 390 Q 260 422 264 454 Q 272 482 310 486 Q 348 482 356 454 Q 360 422 360 390 Q 360 358 352 330 Q 334 322 310 322 Q 286 322 268 330 Z" {...mp("abs")} />

      {/* ── BICEPS – straight (no outward bend), smaller, shorter, inward ── */}
      <path d="M 148 258 Q 140 288 142 330 Q 144 356 152 372 L 182 366 Q 174 348 172 322 Q 170 290 174 258 Z" {...mp("biceps")} />
      <path d="M 473 258 Q 481 288 479 330 Q 477 356 469 372 L 439 366 Q 447 348 449 322 Q 451 290 447 258 Z" {...mp("biceps")} />

      {/* ── FOREARMS – straight, smaller, inward, higher ── */}
      <path d="M 134 372 Q 126 402 128 432 Q 130 454 138 464 L 166 458 Q 158 442 156 418 Q 154 394 158 372 Z" {...mp("forearms")} />
      <path d="M 487 372 Q 495 402 493 432 Q 491 454 483 464 L 455 458 Q 463 442 465 418 Q 467 394 463 372 Z" {...mp("forearms")} />

      {/* ── QUADS – thinner, higher ── */}
      <path d="M 196 565 Q 190 604 192 646 Q 194 684 200 716 L 258 716 Q 262 686 260 646 Q 258 606 250 565 Z" {...mp("quads")} />
      <path d="M 371 565 Q 363 606 361 646 Q 359 686 363 716 L 421 716 Q 427 684 429 646 Q 431 604 425 565 Z" {...mp("quads")} />

      {/* ── CALVES – calf-shaped, moved up off feet ── */}
      <path d="M 198 718 Q 190 742 192 766 Q 196 786 210 794 L 252 794 Q 260 782 260 762 Q 258 740 252 718 Z" {...mp("calves")} />
      <path d="M 369 718 Q 363 740 361 762 Q 361 782 369 794 L 411 794 Q 425 786 429 766 Q 431 742 423 718 Z" {...mp("calves")} />

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
      <path d="M 220 220 Q 240 206 310 204 Q 380 206 400 220 Q 384 268 358 284 Q 336 294 310 294 Q 284 294 262 284 Q 236 268 220 220 Z" {...mp("traps")} />

      {/* ── REAR SHOULDERS – 50% smaller, up + inward ── */}
      <ellipse cx="196" cy="240" rx="34" ry="28" {...mp("shoulders")} transform="rotate(-15,196,240)" />
      <ellipse cx="425" cy="240" rx="34" ry="28" {...mp("shoulders")} transform="rotate(15,425,240)" />

      {/* ── LATS – smaller, more inward + upper ── */}
      <path d="M 170 296 Q 160 328 162 368 Q 164 398 172 420 L 236 426 Q 232 398 230 364 Q 228 328 236 296 Z" {...mp("lats")} />
      <path d="M 451 296 Q 461 328 459 368 Q 457 398 449 420 L 385 426 Q 389 398 391 364 Q 393 328 385 296 Z" {...mp("lats")} />

      {/* ── MID / UPPER BACK ── */}
      <path d="M 236 290 Q 256 280 310 278 Q 364 280 384 290 L 382 426 Q 364 438 310 440 Q 256 438 238 426 Z" {...mp("back")} />

      {/* ── LOWER BACK – smaller, higher ── */}
      <path d="M 264 438 Q 280 448 310 450 Q 340 448 356 438 L 354 490 Q 342 504 310 506 Q 278 504 266 490 Z" {...mp("back")} />

      {/* ── TRICEPS – straight, tighter ── */}
      <path d="M 136 252 Q 120 288 122 336 Q 124 362 136 376 L 168 368 Q 158 350 156 320 Q 154 284 162 252 Z" {...mp("triceps")} />
      <path d="M 485 252 Q 501 288 499 336 Q 497 362 485 376 L 453 368 Q 463 350 465 320 Q 467 284 459 252 Z" {...mp("triceps")} />

      {/* ── FOREARMS – straight, smaller ── */}
      <path d="M 108 378 Q 100 408 102 438 Q 104 460 112 470 L 142 464 Q 134 448 132 424 Q 130 400 134 378 Z" {...mp("forearms")} />
      <path d="M 513 378 Q 521 408 519 438 Q 517 460 509 470 L 479 464 Q 487 448 489 424 Q 491 400 487 378 Z" {...mp("forearms")} />

      {/* ── GLUTES – smaller, MUCH higher ── */}
      <path d="M 198 504 Q 188 530 190 554 Q 192 572 204 580 L 310 582 L 310 504 Z" {...mp("glutes")} />
      <path d="M 423 504 Q 433 530 431 554 Q 429 572 417 580 L 310 582 L 310 504 Z" {...mp("glutes")} />

      {/* ── HAMSTRINGS – smaller, higher ── */}
      <path d="M 196 582 Q 188 612 190 644 Q 192 670 200 688 L 270 688 Q 274 668 272 642 Q 270 614 264 582 Z" {...mp("hamstrings")} />
      <path d="M 357 582 Q 351 614 349 642 Q 347 668 351 688 L 421 688 Q 429 670 431 644 Q 433 612 425 582 Z" {...mp("hamstrings")} />

      {/* ── CALVES – smaller, higher, calf shaped ── */}
      <path d="M 200 690 Q 192 714 194 738 Q 198 758 210 766 L 256 766 Q 264 754 264 732 Q 262 710 256 690 Z" {...mp("calves")} />
      <path d="M 357 690 Q 351 710 349 732 Q 349 754 357 766 L 403 766 Q 415 758 419 738 Q 421 714 413 690 Z" {...mp("calves")} />

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
      <div className="flex justify-center gap-2 mb-3">
        {["front", "back"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1 rounded-full text-xs font-semibold capitalize transition-all ${view === v ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
            {v}
          </button>
        ))}
      </div>

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