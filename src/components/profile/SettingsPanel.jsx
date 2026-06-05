import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { userStorage } from "@/components/utils/userStorage";

const THEMES = [
  { id: "default", label: "Default", color: "#2563eb" },
  { id: "halloween", label: "Halloween", color: "#f97316" },
  { id: "crimson", label: "Crimson", color: "#dc2626" },
  { id: "forest", label: "Forest", color: "#16a34a" },
  { id: "fairy", label: "Fairy", color: "#ec4899" },
  { id: "gold", label: "Gold", color: "#eab308" },
];

const THEME_PRIMARY = {
  default: "210 100% 52%",
  halloween: "25 95% 53%",
  crimson: "0 72% 51%",
  forest: "142 71% 45%",
  fairy: "330 81% 60%",
  gold: "48 96% 48%",
};

export function applyTheme(themeId) {
  const hsl = THEME_PRIMARY[themeId] || THEME_PRIMARY.default;
  document.documentElement.style.setProperty("--primary", hsl);
  document.documentElement.style.setProperty("--accent", hsl);
  document.documentElement.style.setProperty("--ring", hsl);
  userStorage.setItem("gym-theme", themeId);
  window.dispatchEvent(new CustomEvent("themeChanged", { detail: themeId }));
}

export default function SettingsPanel({ darkMode, onToggleDark }) {
  const [theme, setTheme] = useState(() => userStorage.getItem("gym-theme") || "default");
  const [weightUnit, setWeightUnit] = useState(() => userStorage.getItem("gym-weight-unit") || "kg");
  const [distanceUnit, setDistanceUnit] = useState(() => userStorage.getItem("gym-distance-unit") || "metric");
  const [weekStart, setWeekStart] = useState(() => userStorage.getItem("gym-week-start") || "monday");

  const handleTheme = (id) => {
    setTheme(id);
    applyTheme(id);
  };

  const handleWeightUnit = (u) => {
    setWeightUnit(u);
    userStorage.setItem("gym-weight-unit", u);
  };

  const handleDistanceUnit = (u) => {
    setDistanceUnit(u);
    userStorage.setItem("gym-distance-unit", u);
  };

  const handleWeekStart = (d) => {
    setWeekStart(d);
    userStorage.setItem("gym-week-start", d);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-5">
      {/* Dark mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span className="text-sm font-medium">{darkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>
        <Switch checked={darkMode} onCheckedChange={onToggleDark} />
      </div>

      <div className="h-px bg-border" />

      {/* Themes */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Theme</p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTheme(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                theme === t.id ? "border-foreground/30 bg-secondary" : "border-transparent bg-secondary/50"
              }`}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Weight Units */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weight Units</p>
        <div className="flex gap-2">
          {[{ id: "kg", label: "Metric (kg)" }, { id: "lbs", label: "Imperial (lb)" }].map((u) => (
            <button key={u.id} onClick={() => handleWeightUnit(u.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                weightUnit === u.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance Units */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Distance Units</p>
        <div className="flex gap-2">
          {[{ id: "metric", label: "Metric" }, { id: "imperial", label: "Imperial" }].map((u) => (
            <button key={u.id} onClick={() => handleDistanceUnit(u.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                distanceUnit === u.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Week Start */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Start Week On</p>
        <div className="flex gap-2">
          {[{ id: "monday", label: "Mon" }, { id: "sunday", label: "Sun" }, { id: "saturday", label: "Sat" }].map((d) => (
            <button key={d.id} onClick={() => handleWeekStart(d.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                weekStart === d.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}