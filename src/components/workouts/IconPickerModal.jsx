import React from "react";
import {
  Dumbbell, Zap, Flame, Target, Heart, Star, Trophy, Shield,
  Bike, PersonStanding, Waves, Mountain, Timer, Swords, Rocket,
  Sun, Moon, Wind, Snowflake, Leaf, Footprints, HandMetal,
  Activity, Crosshair, RefreshCw, Bolt,
} from "lucide-react";

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