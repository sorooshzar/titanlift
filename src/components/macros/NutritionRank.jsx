import React from "react";

// 10 Level Nutrition Rank System
export const NUTRITION_LEVELS = [
  {
    level: 1,
    name: "Nutrition Newbie",
    emoji: "🟫",
    color: "#6B4226",
    bgColor: "#6B422622",
    borderColor: "#6B422655",
    badge: "🥉",
    description: "Just getting started",
  },
  {
    level: 2,
    name: "Snack Specialist",
    emoji: "🍿",
    color: "#A0522D",
    bgColor: "#A0522D22",
    borderColor: "#A0522D55",
    badge: "🟤",
    description: "Learning the basics",
  },
  {
    level: 3,
    name: "Calorie Counter",
    emoji: "🔢",
    color: "#CD7F32",
    bgColor: "#CD7F3222",
    borderColor: "#CD7F3255",
    badge: "🥈",
    description: "Getting consistent",
  },
  {
    level: 4,
    name: "Macro Minder",
    emoji: "📊",
    color: "#B8860B",
    bgColor: "#B8860B22",
    borderColor: "#B8860B55",
    badge: "🌟",
    description: "Tracking regularly",
  },
  {
    level: 5,
    name: "Diet Detective",
    emoji: "🔍",
    color: "#DAA520",
    bgColor: "#DAA52022",
    borderColor: "#DAA52055",
    badge: "🥇",
    description: "Solid habits forming",
  },
  {
    level: 6,
    name: "Fuel Master",
    emoji: "⚡",
    color: "#C0C0C0",
    bgColor: "#C0C0C022",
    borderColor: "#C0C0C055",
    badge: "🥈",
    description: "Consistently on track",
  },
  {
    level: 7,
    name: "Nutrient Ninja",
    emoji: "🥷",
    color: "#4FC3F7",
    bgColor: "#4FC3F722",
    borderColor: "#4FC3F755",
    badge: "💎",
    description: "Precision nutrition",
  },
  {
    level: 8,
    name: "Macro Maestro",
    emoji: "🎯",
    color: "#9B59B6",
    bgColor: "#9B59B622",
    borderColor: "#9B59B655",
    badge: "💜",
    description: "Near-perfect consistency",
  },
  {
    level: 9,
    name: "Elite Eater",
    emoji: "🏆",
    color: "#E74C3C",
    bgColor: "#E74C3C22",
    borderColor: "#E74C3C55",
    badge: "🔴",
    description: "Elite level tracking",
  },
  {
    level: 10,
    name: "Obsidian Olympian",
    emoji: "🖤",
    color: "#B39DDB",
    bgColor: "#1A1A2E",
    borderColor: "#B39DDB88",
    badge: "⬛",
    description: "Legendary consistency",
  },
];

// Compute nutrition level (1-10) from macro + water logs
// Consistency is the main driver (70%), accuracy secondary (30%)
export function computeNutritionLevel(weekData, waterData, macroGoals) {
  const totalDays = 7;

  // Consistency: how many days had ANY macro log
  const daysWithMacros = weekData.filter(d => d.calories > 0).length;
  const consistencyScore = daysWithMacros / totalDays; // 0-1

  // Water consistency: days with water logged
  const daysWithWater = (waterData || []).filter(d => d.ml > 0).length;
  const waterConsistency = daysWithWater / totalDays; // 0-1

  // Accuracy: how close calories were to goal on logged days
  const loggedDays = weekData.filter(d => d.calories > 0);
  let accuracyScore = 0;
  if (loggedDays.length > 0) {
    const goal = macroGoals.calories || 2000;
    const avgAccuracy = loggedDays.reduce((s, d) => {
      const ratio = d.calories / goal;
      // Score highest when at 80-110% of goal
      const acc = ratio >= 0.8 && ratio <= 1.1 ? 1 : ratio >= 0.6 && ratio <= 1.3 ? 0.7 : 0.3;
      return s + acc;
    }, 0) / loggedDays.length;
    accuracyScore = avgAccuracy;
  }

  // Combined score: consistency 50%, water consistency 20%, accuracy 30%
  const combined = consistencyScore * 0.5 + waterConsistency * 0.2 + accuracyScore * 0.3;

  // Map to level 1-10
  const level = Math.max(1, Math.min(10, Math.ceil(combined * 10)));
  return NUTRITION_LEVELS[level - 1];
}

// Badge SVG component — medal-style with level number
export function NutritionBadge({ levelData, size = "md" }) {
  const sizes = {
    sm: { outer: 36, inner: 26, fontSize: 10, numSize: 8 },
    md: { outer: 56, inner: 42, fontSize: 14, numSize: 10 },
    lg: { outer: 72, inner: 54, fontSize: 18, numSize: 12 },
  };
  const s = sizes[size] || sizes.md;
  const isObsidian = levelData.level === 10;

  return (
    <div
      className="flex items-center justify-center rounded-full relative"
      style={{
        width: s.outer,
        height: s.outer,
        background: isObsidian
          ? "radial-gradient(circle, #2D1B69, #1A1A2E)"
          : `radial-gradient(circle, ${levelData.color}33, ${levelData.color}11)`,
        border: `2px solid ${levelData.color}88`,
        boxShadow: isObsidian
          ? `0 0 12px ${levelData.color}66, 0 0 4px ${levelData.color}44`
          : `0 0 8px ${levelData.color}44`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full"
        style={{
          width: s.inner,
          height: s.inner,
          background: isObsidian ? "#0D0D1A" : `${levelData.color}22`,
          border: `1px solid ${levelData.color}55`,
        }}
      >
        <span style={{ fontSize: s.fontSize, lineHeight: 1 }}>{levelData.emoji}</span>
        <span
          className="font-black leading-none"
          style={{ fontSize: s.numSize, color: levelData.color }}
        >
          {levelData.level}
        </span>
      </div>
    </div>
  );
}

// Full card component for Profile page
export default function NutritionRankCard({ weekData = [], waterData = [], macroGoals = {} }) {
  const levelData = computeNutritionLevel(weekData, waterData, macroGoals);
  const daysLogged = weekData.filter(d => d.calories > 0).length;
  const daysWater = (waterData || []).filter(d => d.ml > 0).length;
  const isObsidian = levelData.level === 10;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: isObsidian
          ? "radial-gradient(ellipse at top, #1A1A2E, hsl(var(--card)))"
          : `linear-gradient(135deg, ${levelData.color}08, hsl(var(--card)))`,
        borderColor: `${levelData.color}44`,
      }}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Nutrition Rank</p>

      <div className="flex items-center gap-4">
        <NutritionBadge levelData={levelData} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: levelData.color }}
            >
              Level {levelData.level}
            </span>
          </div>
          <p className="text-base font-black leading-tight" style={{ color: isObsidian ? levelData.color : "inherit" }}>
            {levelData.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{levelData.description}</p>
        </div>
      </div>

      {/* Progress bar toward next level */}
      {levelData.level < 10 && (
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="text-[9px] text-muted-foreground">Progress to Level {levelData.level + 1}</span>
            <span className="text-[9px] text-muted-foreground">{daysLogged}/7 days logged</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(daysLogged / 7) * 100}%`,
                backgroundColor: levelData.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-secondary/50 rounded-xl px-3 py-2 text-center">
          <p className="text-base font-bold">{daysLogged}<span className="text-[10px] text-muted-foreground">/7</span></p>
          <p className="text-[9px] text-muted-foreground">Meals tracked</p>
        </div>
        <div className="flex-1 bg-secondary/50 rounded-xl px-3 py-2 text-center">
          <p className="text-base font-bold">{daysWater}<span className="text-[10px] text-muted-foreground">/7</span></p>
          <p className="text-[9px] text-muted-foreground">Water logged</p>
        </div>
      </div>
    </div>
  );
}