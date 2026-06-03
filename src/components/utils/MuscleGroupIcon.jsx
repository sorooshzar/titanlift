import React from "react";

/**
 * Clean, minimal SVG icons for each muscle group.
 * Theme-aware via currentColor — inherits text color from parent.
 * All icons are designed on a 24x24 grid.
 */

const icons = {
  // ─── Chest ────────────────────────────────────────────────────────────────
  "Upper Chest": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* Pec fan from clavicle down to sternum */}
      <path d="M3 6 C5 5 8 5.5 10 7 L12 12" />
      <path d="M21 6 C19 5 16 5.5 14 7 L12 12" />
      <line x1="5" y1="5.5" x2="19" y2="5.5" />
    </svg>
  ),
  "Mid/Low Chest": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8 C5 7 9 8 11 10 L12 14 L13 10 C15 8 19 7 21 8" />
      <path d="M8 14 Q12 18 16 14" />
    </svg>
  ),

  // ─── Back ─────────────────────────────────────────────────────────────────
  "Lats": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4 C4 8 3 12 5 16 L12 18 L19 16 C21 12 20 8 18 4" />
      <line x1="12" y1="4" x2="12" y2="18" />
    </svg>
  ),
  "Traps": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* Diamond-ish trapezius shape */}
      <path d="M12 3 L4 9 L8 18 L12 16 L16 18 L20 9 Z" />
    </svg>
  ),
  "Mid Back": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8 L12 6 L18 8" />
      <path d="M5 12 L12 10 L19 12" />
      <path d="M6 16 L12 14 L18 16" />
    </svg>
  ),
  "Erectors": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="4" x2="10" y2="20" />
      <line x1="14" y1="4" x2="14" y2="20" />
      <line x1="10" y1="8" x2="14" y2="8" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  ),

  // ─── Shoulders ────────────────────────────────────────────────────────────
  "Front Delt": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3" />
      <path d="M9 11 C6 13 5 17 7 19" />
      <path d="M15 11 C18 13 19 17 17 19" />
    </svg>
  ),
  "Side Delt": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9 C6 7 9 7 11 9 L12 14" />
      <path d="M20 9 C18 7 15 7 13 9 L12 14" />
      <path d="M4 9 C3 12 4 15 6 16" />
      <path d="M20 9 C21 12 20 15 18 16" />
    </svg>
  ),
  "Rear Delt": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7 C7 5 10 5.5 12 7 L12 12" />
      <path d="M19 7 C17 5 14 5.5 12 7" />
      <path d="M5 7 C3 10 4 14 6 15" />
      <path d="M19 7 C21 10 20 14 18 15" />
    </svg>
  ),

  // ─── Arms ─────────────────────────────────────────────────────────────────
  "Biceps": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18 L8 10 C8 6 11 4 14 5 C17 6 18 9 17 12 L16 18" />
      <path d="M8 18 C8 20 16 20 16 18" />
    </svg>
  ),
  "Triceps": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5 L7 15 C7 18 9 20 12 20 C15 20 17 18 17 15 L17 5" />
      <path d="M9 5 C9 3 15 3 15 5" />
      <line x1="12" y1="5" x2="12" y2="19" />
    </svg>
  ),

  // ─── Forearms ─────────────────────────────────────────────────────────────
  "Brachioradialis": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4 C7 8 6 12 7 18 L10 20 L11 4" />
      <path d="M13 4 C14 8 15 12 14 18 L11 20" />
    </svg>
  ),
  "Wrist Flexor": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 6 C6 10 6 14 8 19" />
      <path d="M10 5 C9 9 9 14 10 19" />
      <path d="M13 5 C13 9 13 14 13 19" />
      <path d="M16 6 C17 10 17 14 15 19" />
      <path d="M7 19 Q12 22 16 19" />
    </svg>
  ),
  "Wrist Extensor": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 19 C7 15 7 11 8 6" />
      <path d="M11 20 C10 16 10 11 11 5" />
      <path d="M14 20 C14 16 14 11 14 5" />
      <path d="M17 19 C18 15 18 11 16 6" />
      <path d="M8 6 Q12 3 16 6" />
    </svg>
  ),

  // ─── Core ─────────────────────────────────────────────────────────────────
  "Abs": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="4" width="3" height="3" rx="0.5" />
      <rect x="12.5" y="4" width="3" height="3" rx="0.5" />
      <rect x="9" y="8.5" width="3" height="3" rx="0.5" />
      <rect x="12.5" y="8.5" width="3" height="3" rx="0.5" />
      <rect x="9" y="13" width="3" height="3" rx="0.5" />
      <rect x="12.5" y="13" width="3" height="3" rx="0.5" />
    </svg>
  ),
  "Obliques": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5 C5 9 5 13 7 17 L9 19" />
      <path d="M18 5 C19 9 19 13 17 17 L15 19" />
      <path d="M6 9 L9 11" />
      <path d="M6 14 L9 16" />
      <path d="M18 9 L15 11" />
      <path d="M18 14 L15 16" />
    </svg>
  ),

  // ─── Legs ─────────────────────────────────────────────────────────────────
  "Quads": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4 C7 9 6 14 7 20" />
      <path d="M11 3 C10 9 10 15 11 21" />
      <path d="M14 3 C14 9 14 15 13 21" />
      <path d="M17 4 C18 9 18 14 17 20" />
    </svg>
  ),
  "Hamstrings": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3 C8 8 7 13 8 20" />
      <path d="M12 3 C12 9 12 15 12 21" />
      <path d="M15 3 C16 8 17 13 16 20" />
      <path d="M9 20 Q12 22 15 20" />
    </svg>
  ),
  "Glutes": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6 C3 12 6 16 12 16 C18 16 21 12 21 6" />
      <path d="M12 16 L12 20" />
    </svg>
  ),
  "Calves": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3 C8 7 7 10 8 14 C9 18 10 20 10 22" />
      <path d="M15 3 C16 7 17 10 16 14 C15 18 14 20 14 22" />
      <path d="M9 14 Q12 16 15 14" />
    </svg>
  ),
  "Adductors": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4 C9 8 9 12 11 20" />
      <path d="M14 4 C15 8 15 12 13 20" />
      <path d="M10 4 Q12 2 14 4" />
      <path d="M11 20 Q12 22 13 20" />
    </svg>
  ),
  "Abductors": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4 C4 8 4 12 6 20" />
      <path d="M19 4 C20 8 20 12 18 20" />
      <path d="M5 4 Q8 2 10 6" />
      <path d="M19 4 Q16 2 14 6" />
    </svg>
  ),

  // ─── Neck ─────────────────────────────────────────────────────────────────
  "Neck": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4 L9 14 C9 16 10 17 12 17 C14 17 15 16 15 14 L15 4" />
      <path d="M7 17 C7 19 8 21 12 21 C16 21 17 19 17 17" />
    </svg>
  ),
};

// Fallback generic muscle icon
const DefaultMuscleIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4 C4 8 4 16 6 20 L12 22 L18 20 C20 16 20 8 18 4 L12 2 Z" />
  </svg>
);

// Parent-group fallbacks  
const GROUP_FALLBACKS = {
  "Chest":      "Mid/Low Chest",
  "Back":       "Lats",
  "Shoulders":  "Side Delt",
  "Arms":       "Biceps",
  "Legs":       "Quads",
  "Core":       "Abs",
  "Forearms":   "Wrist Flexor",
};

export default function MuscleGroupIcon({ muscle, size = 20, className = "" }) {
  const resolved = icons[muscle] || (GROUP_FALLBACKS[muscle] && icons[GROUP_FALLBACKS[muscle]]);
  const Icon = resolved || DefaultMuscleIcon;
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={size} />
    </span>
  );
}