import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const RANK_COLORS = {
  none: null,
  wood: "#8B5E3C",
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
  fresh: null,
  light: "#2d5a1b",
  moderate: "#7a5c00",
  heavy: "#7a3000",
  sore: "#7a0000",
};

const MUSCLE_LABELS = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps",
  forearms: "Forearms", abs: "Abs", quads: "Quads", calves: "Calves",
  traps: "Traps", lats: "Lats", back: "Back", glutes: "Glutes", hamstrings: "Hamstrings",
};

function getOverlayColor(muscle, muscleRanks, recoveryData, showRecovery) {
  if (showRecovery) {
    const level = recoveryData[muscle];
    return RECOVERY_COLORS[level] || null;
  }
  const rank = muscleRanks[muscle] || "none";
  return RANK_COLORS[rank] || null;
}

// Shared body base color
const BASE = "#d0d4e0";
const BASE_DARK = "#b0b4c0";
const STROKE = "#8890a0";
const LINE = "#9099aa";

function FrontBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const [hovered, setHovered] = useState(null);

  const mp = (muscle) => {
    const color = getOverlayColor(muscle, muscleRanks, recoveryData, showRecovery);
    return {
      fill: color ? color : "transparent",
      fillOpacity: color ? (hovered === muscle ? 0.85 : 0.65) : 0,
      stroke: hovered === muscle ? "rgba(255,255,255,0.6)" : "transparent",
      strokeWidth: 1,
      className: "cursor-pointer transition-all duration-150",
      onMouseEnter: () => setHovered(muscle),
      onMouseLeave: () => setHovered(null),
      onClick: () => onMuscleClick(muscle),
    };
  };

  return (
    <svg viewBox="0 0 120 340" className="w-full h-full">
      <defs>
        <filter id="bodyGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* === HEAD === */}
      <ellipse cx="60" cy="18" rx="11" ry="13" fill={BASE} stroke={STROKE} strokeWidth="0.8"/>
      {/* Hair */}
      <path d="M 50 12 Q 52 5 60 4 Q 68 5 70 12 Q 66 8 60 8 Q 54 8 50 12 Z" fill={BASE_DARK} stroke="none"/>
      {/* Face details */}
      <ellipse cx="55" cy="17" rx="1.5" ry="1" fill={STROKE} fillOpacity="0.5"/>
      <ellipse cx="65" cy="17" rx="1.5" ry="1" fill={STROKE} fillOpacity="0.5"/>
      <path d="M 56 22 Q 60 24 64 22" stroke={STROKE} strokeWidth="0.6" fill="none" strokeOpacity="0.5"/>

      {/* === NECK === */}
      <rect x="55" y="29" width="10" height="9" rx="3" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* === TORSO BASE === */}
      {/* Shoulders/clavicle area */}
      <path d="M 32 40 Q 30 44 30 50 L 34 56 Q 42 52 50 50 L 55 38 Q 52 36 44 36 Q 37 36 32 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 88 40 Q 90 44 90 50 L 86 56 Q 78 52 70 50 L 65 38 Q 68 36 76 36 Q 83 36 88 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>

      {/* Main torso */}
      <path d="M 34 56 Q 32 70 32 90 Q 32 112 34 128 Q 36 144 38 158 Q 40 168 42 176 L 50 180 L 70 182 L 78 182 L 78 188 L 82 190 L 82 182 L 90 182 L 98 180 Q 80 174 80 174" fill="none"/>
      <path d="M 34 56 Q 31 70 31 90 Q 31 112 34 130 L 36 158 Q 38 168 40 178 L 45 182 L 50 184 L 70 186 L 82 186 L 90 184 L 95 182 L 100 178 Q 100 168 102 158 L 106 130 Q 109 112 109 90 Q 109 70 106 56 L 88 40 Q 80 36 60 36 Q 40 36 32 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.8"/>

      {/* Torso muscle lines */}
      {/* Pec line */}
      <path d="M 42 60 Q 52 72 60 72 Q 68 72 78 60" stroke={LINE} strokeWidth="0.7" fill="none" strokeOpacity="0.6"/>
      {/* Sternum */}
      <line x1="60" y1="56" x2="60" y2="130" stroke={LINE} strokeWidth="0.5" strokeOpacity="0.5"/>
      {/* Ab lines horizontal */}
      <path d="M 48 110 Q 60 112 72 110" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 47 122 Q 60 124 73 122" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 47 134 Q 60 136 73 134" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 47 146 Q 60 148 73 146" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      {/* Oblique lines */}
      <path d="M 42 108 Q 44 130 44 158" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.4"/>
      <path d="M 78 108 Q 76 130 76 158" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.4"/>

      {/* === ARMS === */}
      {/* Upper arm left */}
      <path d="M 30 52 Q 24 56 22 68 Q 20 82 21 96 Q 22 108 26 118 L 34 116 Q 32 104 32 90 Q 32 76 34 62 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Upper arm right */}
      <path d="M 90 52 Q 96 56 98 68 Q 100 82 99 96 Q 98 108 94 118 L 86 116 Q 88 104 88 90 Q 88 76 86 62 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Forearm left */}
      <path d="M 22 98 Q 20 112 20 126 Q 20 140 22 152 Q 24 160 26 166 L 34 164 Q 32 154 32 140 Q 32 126 34 114 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Forearm right */}
      <path d="M 98 98 Q 100 112 100 126 Q 100 140 98 152 Q 96 160 94 166 L 86 164 Q 88 154 88 140 Q 88 126 86 114 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Hands */}
      <ellipse cx="23" cy="172" rx="5" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="97" cy="172" rx="5" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* === LEGS === */}
      {/* Hip area */}
      <path d="M 40 184 L 38 200 Q 38 208 40 212 L 55 214 L 55 186 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 80 184 L 82 200 Q 82 208 80 212 L 65 214 L 65 186 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Left thigh */}
      <path d="M 36 212 Q 32 224 32 244 Q 32 268 34 286 L 56 288 Q 56 268 56 248 Q 56 228 54 214 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Right thigh */}
      <path d="M 84 212 Q 88 224 88 244 Q 88 268 86 286 L 64 288 Q 64 268 64 248 Q 64 228 66 214 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Knee caps */}
      <ellipse cx="44" cy="292" rx="10" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="76" cy="292" rx="10" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      {/* Left shin */}
      <path d="M 34 298 Q 32 314 33 328 Q 34 340 38 348 L 52 348 Q 54 338 54 326 Q 54 312 52 298 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Right shin */}
      <path d="M 86 298 Q 88 314 87 328 Q 86 340 82 348 L 68 348 Q 66 338 66 326 Q 66 312 68 298 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      {/* Feet */}
      <ellipse cx="44" cy="353" rx="11" ry="5" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="76" cy="353" rx="11" ry="5" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* Leg lines */}
      <path d="M 44 214 Q 44 248 44 286" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.4"/>
      <path d="M 76 214 Q 76 248 76 286" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.4"/>

      {/* === MUSCLE OVERLAYS === */}
      {/* SHOULDERS */}
      <ellipse cx="30" cy="55" rx="9" ry="10" {...mp("shoulders")} transform="rotate(-10, 30, 55)"/>
      <ellipse cx="90" cy="55" rx="9" ry="10" {...mp("shoulders")} transform="rotate(10, 90, 55)"/>

      {/* CHEST - left */}
      <path d="M 38 58 Q 34 68 34 80 Q 36 90 42 94 Q 52 98 60 96 L 60 58 Q 50 54 38 58 Z" {...mp("chest")}/>
      {/* CHEST - right */}
      <path d="M 82 58 Q 86 68 86 80 Q 84 90 78 94 Q 68 98 60 96 L 60 58 Q 70 54 82 58 Z" {...mp("chest")}/>

      {/* ABS */}
      <path d="M 47 98 Q 47 108 48 110 L 60 112 L 72 110 Q 73 108 73 98 Q 67 94 60 94 Q 53 94 47 98 Z" {...mp("abs")}/>
      <path d="M 47 112 L 47 124 L 60 126 L 73 124 L 73 112 L 60 112 Z" {...mp("abs")}/>
      <path d="M 47 124 L 47 136 L 60 138 L 73 136 L 73 124 L 60 124 Z" {...mp("abs")}/>
      <path d="M 47 136 L 47 150 L 60 152 L 73 150 L 73 136 L 60 136 Z" {...mp("abs")}/>

      {/* BICEPS */}
      <path d="M 22 68 Q 20 82 21 96 Q 22 108 26 116 L 34 114 Q 32 102 32 88 Q 32 74 34 62 Q 28 62 22 68 Z" {...mp("biceps")}/>
      <path d="M 98 68 Q 100 82 99 96 Q 98 108 94 116 L 86 114 Q 88 102 88 88 Q 88 74 86 62 Q 92 62 98 68 Z" {...mp("biceps")}/>

      {/* FOREARMS */}
      <path d="M 20 100 Q 19 116 20 130 Q 21 146 24 158 L 32 156 Q 30 142 30 128 Q 30 114 32 100 Z" {...mp("forearms")}/>
      <path d="M 100 100 Q 101 116 100 130 Q 99 146 96 158 L 88 156 Q 90 142 90 128 Q 90 114 88 100 Z" {...mp("forearms")}/>

      {/* QUADS */}
      <path d="M 34 214 Q 30 230 30 250 Q 30 272 34 288 L 46 288 Q 44 270 44 250 Q 44 230 46 214 Z" {...mp("quads")}/>
      <path d="M 46 214 Q 48 228 48 250 Q 48 272 46 288 L 56 288 Q 58 268 58 248 Q 56 228 56 214 Z" {...mp("quads")}/>
      <path d="M 64 214 Q 64 228 64 248 Q 62 268 64 288 L 74 288 Q 72 272 72 250 Q 72 228 74 214 Z" {...mp("quads")}/>
      <path d="M 74 214 Q 76 228 76 250 Q 76 270 76 288 L 86 288 Q 90 272 90 250 Q 90 230 86 214 Z" {...mp("quads")}/>

      {/* CALVES */}
      <path d="M 32 300 Q 30 316 32 330 Q 34 344 38 350 L 52 350 Q 54 340 54 326 Q 54 312 52 300 Z" {...mp("calves")}/>
      <path d="M 68 300 Q 66 316 68 330 Q 70 344 76 350 L 88 350 Q 90 340 90 326 Q 90 312 88 300 Z" {...mp("calves")}/>

      {/* Hover label */}
      {hovered && (
        <g>
          <rect x="20" y="167" width="80" height="16" rx="4" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
          <text x="60" y="178" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" letterSpacing="0.5">
            {MUSCLE_LABELS[hovered] || hovered}
          </text>
        </g>
      )}
    </svg>
  );
}

function BackBody({ muscleRanks, recoveryData, showRecovery, onMuscleClick }) {
  const [hovered, setHovered] = useState(null);

  const mp = (muscle) => {
    const color = getOverlayColor(muscle, muscleRanks, recoveryData, showRecovery);
    return {
      fill: color ? color : "transparent",
      fillOpacity: color ? (hovered === muscle ? 0.85 : 0.65) : 0,
      stroke: hovered === muscle ? "rgba(255,255,255,0.6)" : "transparent",
      strokeWidth: 1,
      className: "cursor-pointer transition-all duration-150",
      onMouseEnter: () => setHovered(muscle),
      onMouseLeave: () => setHovered(null),
      onClick: () => onMuscleClick(muscle),
    };
  };

  return (
    <svg viewBox="0 0 120 340" className="w-full h-full">
      {/* HEAD */}
      <ellipse cx="60" cy="18" rx="11" ry="13" fill={BASE} stroke={STROKE} strokeWidth="0.8"/>
      {/* Hair back */}
      <path d="M 49 14 Q 50 5 60 4 Q 70 5 71 14 Q 66 9 60 9 Q 54 9 49 14 Z" fill={BASE_DARK} stroke="none"/>

      {/* NECK */}
      <rect x="55" y="29" width="10" height="9" rx="3" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* TORSO */}
      <path d="M 34 56 Q 31 70 31 90 Q 31 112 34 130 L 36 158 Q 38 168 40 178 L 45 182 L 50 184 L 70 186 L 80 184 L 95 182 L 100 178 Q 100 168 102 158 L 106 130 Q 109 112 109 90 Q 109 70 106 56 L 88 40 Q 80 36 60 36 Q 40 36 32 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.8"/>
      <path d="M 32 40 Q 30 44 30 50 L 34 56 Q 42 52 50 50 L 55 38 Q 52 36 44 36 Q 37 36 32 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 88 40 Q 90 44 90 50 L 86 56 Q 78 52 70 50 L 65 38 Q 68 36 76 36 Q 83 36 88 40 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>

      {/* Back muscle lines */}
      <line x1="60" y1="50" x2="60" y2="185" stroke={LINE} strokeWidth="0.6" strokeOpacity="0.5"/>
      <path d="M 36 80 Q 42 84 60 86 Q 78 84 84 80" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 36 100 Q 44 108 60 110 Q 76 108 84 100" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 38 130 Q 46 136 60 138 Q 74 136 82 130" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>
      <path d="M 38 155 Q 48 158 60 160 Q 72 158 82 155" stroke={LINE} strokeWidth="0.5" fill="none" strokeOpacity="0.5"/>

      {/* ARMS */}
      <path d="M 30 52 Q 24 56 22 68 Q 20 82 21 96 Q 22 108 26 118 L 34 116 Q 32 104 32 90 Q 32 76 34 62 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 90 52 Q 96 56 98 68 Q 100 82 99 96 Q 98 108 94 118 L 86 116 Q 88 104 88 90 Q 88 76 86 62 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 22 98 Q 20 112 20 126 Q 20 140 22 152 Q 24 160 26 166 L 34 164 Q 32 154 32 140 Q 32 126 34 114 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 98 98 Q 100 112 100 126 Q 100 140 98 152 Q 96 160 94 166 L 86 164 Q 88 154 88 140 Q 88 126 86 114 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <ellipse cx="23" cy="172" rx="5" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="97" cy="172" rx="5" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* LEGS */}
      <path d="M 36 212 Q 32 224 32 244 Q 32 268 34 286 L 56 288 Q 56 268 56 248 Q 56 228 54 214 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 84 212 Q 88 224 88 244 Q 88 268 86 286 L 64 288 Q 64 268 64 248 Q 64 228 66 214 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <ellipse cx="44" cy="292" rx="10" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="76" cy="292" rx="10" ry="7" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <path d="M 34 298 Q 32 314 33 328 Q 34 340 38 348 L 52 348 Q 54 338 54 326 Q 54 312 52 298 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <path d="M 86 298 Q 88 314 87 328 Q 86 340 82 348 L 68 348 Q 66 338 66 326 Q 66 312 68 298 Z" fill={BASE} stroke={STROKE} strokeWidth="0.7"/>
      <ellipse cx="44" cy="353" rx="11" ry="5" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>
      <ellipse cx="76" cy="353" rx="11" ry="5" fill={BASE} stroke={STROKE} strokeWidth="0.6"/>

      {/* === MUSCLE OVERLAYS === */}
      {/* TRAPS */}
      <path d="M 38 50 Q 44 46 60 44 Q 76 46 82 50 Q 76 60 68 64 Q 64 66 60 66 Q 56 66 52 64 Q 44 60 38 50 Z" {...mp("traps")}/>

      {/* REAR SHOULDERS */}
      <ellipse cx="30" cy="55" rx="9" ry="10" {...mp("shoulders")} transform="rotate(-10, 30, 55)"/>
      <ellipse cx="90" cy="55" rx="9" ry="10" {...mp("shoulders")} transform="rotate(10, 90, 55)"/>

      {/* LATS */}
      <path d="M 36 68 Q 32 80 32 100 Q 32 120 36 138 L 50 148 Q 52 138 52 114 Q 52 90 50 72 Z" {...mp("lats")}/>
      <path d="M 84 68 Q 88 80 88 100 Q 88 120 84 138 L 70 148 Q 68 138 68 114 Q 68 90 70 72 Z" {...mp("lats")}/>

      {/* MID/UPPER BACK */}
      <path d="M 50 70 Q 54 66 60 66 Q 66 66 70 70 L 68 148 Q 64 152 60 152 Q 56 152 52 148 Z" {...mp("back")}/>

      {/* LOWER BACK */}
      <path d="M 50 150 Q 56 148 60 148 Q 64 148 70 150 L 68 180 Q 64 184 60 184 Q 56 184 52 180 Z" {...mp("back")}/>

      {/* TRICEPS */}
      <path d="M 22 68 Q 20 82 21 96 Q 22 108 26 116 L 34 114 Q 32 102 32 88 Q 32 74 34 62 Q 28 62 22 68 Z" {...mp("triceps")}/>
      <path d="M 98 68 Q 100 82 99 96 Q 98 108 94 116 L 86 114 Q 88 102 88 88 Q 88 74 86 62 Q 92 62 98 68 Z" {...mp("triceps")}/>

      {/* FOREARMS */}
      <path d="M 20 100 Q 19 116 20 130 Q 21 146 24 158 L 32 156 Q 30 142 30 128 Q 30 114 32 100 Z" {...mp("forearms")}/>
      <path d="M 100 100 Q 101 116 100 130 Q 99 146 96 158 L 88 156 Q 90 142 90 128 Q 90 114 88 100 Z" {...mp("forearms")}/>

      {/* GLUTES */}
      <path d="M 36 186 Q 32 196 32 208 Q 32 220 36 230 L 60 234 L 60 186 Z" {...mp("glutes")}/>
      <path d="M 84 186 Q 88 196 88 208 Q 88 220 84 230 L 60 234 L 60 186 Z" {...mp("glutes")}/>

      {/* HAMSTRINGS */}
      <path d="M 32 232 Q 30 248 30 266 Q 30 282 34 292 L 56 292 Q 54 276 54 258 Q 54 240 56 232 Z" {...mp("hamstrings")}/>
      <path d="M 64 232 Q 66 240 66 258 Q 66 276 64 292 L 86 292 Q 90 282 90 266 Q 90 248 88 232 Z" {...mp("hamstrings")}/>

      {/* CALVES */}
      <path d="M 32 300 Q 30 316 32 330 Q 34 344 38 350 L 52 350 Q 54 340 54 326 Q 54 312 52 300 Z" {...mp("calves")}/>
      <path d="M 68 300 Q 66 316 68 330 Q 70 344 76 350 L 88 350 Q 90 340 90 326 Q 90 312 88 300 Z" {...mp("calves")}/>

      {/* Hover label */}
      {hovered && (
        <g>
          <rect x="20" y="167" width="80" height="16" rx="4" fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
          <text x="60" y="178" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" letterSpacing="0.5">
            {MUSCLE_LABELS[hovered] || hovered}
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

  const handleMuscleClick = (muscle) => {
    setClickedMuscle(muscle);
  };

  const handleFindExercises = () => {
    navigate(createPageUrl(`Lifts?tab=exercises&muscle=${clickedMuscle}`));
    setClickedMuscle(null);
  };

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
          <motion.div key={view} initial={{ opacity: 0, x: view === "front" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: view === "front" ? 20 : -20 }}
            transition={{ duration: 0.15 }} className="w-44">
            {view === "front"
              ? <FrontBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={handleMuscleClick}/>
              : <BackBody muscleRanks={muscleRanks} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleClick={handleMuscleClick}/>
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
              <button onClick={handleFindExercises}
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