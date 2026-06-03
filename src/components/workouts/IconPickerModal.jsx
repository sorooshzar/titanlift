import React from "react";
import {
  Dumbbell, Zap, Flame, Target, Heart, Star, Trophy, Shield,
  Bike, PersonStanding, Waves, Mountain, Timer, Swords, Rocket,
  Sun, Moon, Wind, Snowflake, Leaf, Footprints, HandMetal,
  Activity, Crosshair, RefreshCw, Bolt,
} from "lucide-react";

const BODY_ICONS = [
  { name: "body-chest",     emoji: "💪", label: "Chest" },
  { name: "body-back",      emoji: "🔙", label: "Back" },
  { name: "body-legs",      emoji: "🦵", label: "Legs" },
  { name: "body-glutes",    emoji: "🍑", label: "Glutes" },
  { name: "body-shoulders", emoji: "🏋️", label: "Shoulders" },
  { name: "body-arms",      emoji: "💪", label: "Arms" },
  { name: "body-core",      emoji: "🎯", label: "Core" },
  { name: "body-cardio",    emoji: "❤️", label: "Cardio" },
  { name: "body-full",      emoji: "🏃", label: "Full Body" },
  { name: "body-stretch",   emoji: "🧘", label: "Stretch" },
];

// Map icon name -> component (name stored in DB)
export const ICON_MAP = {
  Dumbbell, Zap, Flame, Target, Heart, Star, Trophy, Shield,
  Bike, PersonStanding, Waves, Mountain, Timer, Swords, Rocket,
  Sun, Moon, Wind, Snowflake, Leaf, Footprints, HandMetal,
  Activity, Crosshair, RefreshCw, Bolt,
};

const ICON_SECTIONS = [
  {
    label: "Muscles",
    icons: ["Dumbbell", "PersonStanding", "Activity", "Zap", "Flame", "Wind", "Target", "RefreshCw"],
  },
  {
    label: "Equipment",
    icons: ["Dumbbell", "Bike", "Timer", "Waves", "Mountain", "Footprints", "Shield", "Crosshair"],
  },
  {
    label: "Other",
    icons: ["Trophy", "Star", "Heart", "Rocket", "Swords", "HandMetal", "Sun", "Moon", "Snowflake", "Leaf", "Bolt"],
  },
];

export function WorkoutIcon({ name, className, style }) {
  const bodyIcon = BODY_ICONS.find(b => b.name === name);
  if (bodyIcon) return <span style={{ fontSize: "1.1em", lineHeight: 1 }}>{bodyIcon.emoji}</span>;
  const Icon = ICON_MAP[name] || Dumbbell;
  return <Icon className={className} style={style} />;
}

export default function IconPickerModal({ open, current, accentColor, onSelect, onClose }) {
  if (!open) return null;

  const selected = current || "Dumbbell";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl p-5 w-full max-w-xs shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold mb-4 text-center">Workout Icon</h3>
        <div className="overflow-y-auto max-h-72 space-y-4 pr-0.5">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
              BODY PARTS
            </p>
            <div className="grid grid-cols-5 gap-2">
              {BODY_ICONS.map(b => {
                const isSelected = selected === b.name;
                return (
                  <button
                    key={b.name}
                    onClick={() => { onSelect(b.name); onClose(); }}
                    className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 ${
                      isSelected ? "ring-2 ring-offset-1 ring-primary bg-primary/10" : "bg-secondary hover:bg-secondary/80"
                    }`}
                    title={b.label}
                  >
                    {b.emoji}
                  </button>
                );
              })}
            </div>
          </div>
          {ICON_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                {section.label}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {section.icons.map((name, idx) => {
                  const Icon = ICON_MAP[name];
                  const isSelected = selected === name;
                  return (
                    <button
                      key={`${name}-${idx}`}
                      onClick={() => { onSelect(name); onClose(); }}
                      className={`h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        isSelected
                          ? "ring-2 ring-offset-1 ring-primary bg-primary/10"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isSelected ? (accentColor || "hsl(var(--primary))") : "hsl(var(--foreground) / 0.45)" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}