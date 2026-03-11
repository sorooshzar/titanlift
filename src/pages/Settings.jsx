import React, { useState, useEffect } from "react";
import { ChevronLeft, Moon, Sun, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Switch } from "@/components/ui/switch";
import { applyTheme } from "../components/profile/SettingsPanel";

const THEMES = [
  { id: "default", label: "Default", color: "#2563eb" },
  { id: "halloween", label: "Halloween", color: "#f97316" },
  { id: "crimson", label: "Crimson", color: "#dc2626" },
  { id: "forest", label: "Forest", color: "#16a34a" },
  { id: "fairy", label: "Fairy", color: "#ec4899" },
  { id: "gold", label: "Gold", color: "#d97706" },
  { id: "ocean", label: "Ocean", color: "#0891b2" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
];

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SegmentPicker({ options, value, onChange }) {
  return (
    <div className="flex bg-secondary rounded-lg p-0.5 shrink-0">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${value === o.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState("default");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [distanceUnit, setDistanceUnit] = useState("metric");
  const [weekStart, setWeekStart] = useState("monday");
  const [countDumbbellTwice, setCountDumbbellTwice] = useState(false);
  const [disableSleep, setDisableSleep] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);
  const [includeBodyweight, setIncludeBodyweight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gym-dark-mode");
    setDarkMode(saved === null ? true : saved === "true");
    setTheme(localStorage.getItem("gym-theme") || "default");
    setWeightUnit(localStorage.getItem("gym-weight-unit") || "kg");
    setDistanceUnit(localStorage.getItem("gym-distance-unit") || "metric");
    setWeekStart(localStorage.getItem("gym-week-start") || "monday");
    setCountDumbbellTwice(localStorage.getItem("gym-dumbbell-twice") === "true");
    setDisableSleep(localStorage.getItem("gym-disable-sleep") === "true");
    setSoundEffects(localStorage.getItem("gym-sound-effects") === "true");
    setIncludeBodyweight(localStorage.getItem("gym-include-bodyweight") === "true");
  }, []);

  const toggleDark = (v) => {
    setDarkMode(v);
    localStorage.setItem("gym-dark-mode", String(v));
    document.documentElement.classList.toggle("dark", v);
    window.dispatchEvent(new Event("darkModeChanged"));
  };

  const handleTheme = (id) => {
    setTheme(id);
    applyTheme(id);
  };

  const save = (key, val, setter) => { setter(val); localStorage.setItem(key, String(val)); };

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("Profile")}>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <SettingRow label="Dark Mode">
          <Switch checked={darkMode} onCheckedChange={toggleDark} />
        </SettingRow>
        <div className="px-4 py-3.5">
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleTheme(t.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${theme === t.id ? "bg-secondary ring-2 ring-primary" : "bg-secondary/50"}`}>
                <div className="w-7 h-7 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] font-medium text-muted-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Units */}
      <Section title="Units">
        <SettingRow label="Weight" description="Used for exercises and body weight">
          <SegmentPicker value={weightUnit} onChange={v => save("gym-weight-unit", v, setWeightUnit)}
            options={[{ id: "kg", label: "kg" }, { id: "lbs", label: "lbs" }]} />
        </SettingRow>
        <SettingRow label="Distance">
          <SegmentPicker value={distanceUnit} onChange={v => save("gym-distance-unit", v, setDistanceUnit)}
            options={[{ id: "metric", label: "km" }, { id: "imperial", label: "mi" }]} />
        </SettingRow>
        <SettingRow label="Week starts on">
          <SegmentPicker value={weekStart} onChange={v => save("gym-week-start", v, setWeekStart)}
            options={[{ id: "monday", label: "Mon" }, { id: "sunday", label: "Sun" }]} />
        </SettingRow>
      </Section>

      {/* Workout Settings */}
      <Section title="Workout">
        <SettingRow label="Previous set display" description="How previous set data appears">
          <span className="text-xs text-muted-foreground">Weight × Reps</span>
        </SettingRow>
        <SettingRow label="Warm-up rest time" description="Rest between warm-up sets">
          <span className="text-xs text-muted-foreground font-medium">60s</span>
        </SettingRow>
        <SettingRow label="Compound rest time" description="Rest for compound movements">
          <span className="text-xs text-muted-foreground font-medium">3 min</span>
        </SettingRow>
        <SettingRow label="Isolation rest time" description="Rest for isolation movements">
          <span className="text-xs text-muted-foreground font-medium">90s</span>
        </SettingRow>
      </Section>

      {/* Advanced */}
      <Section title="Advanced">
        <SettingRow label="Count dumbbells twice" description="Multiply dumbbell weight ×2">
          <Switch checked={countDumbbellTwice} onCheckedChange={v => save("gym-dumbbell-twice", v, setCountDumbbellTwice)} />
        </SettingRow>
        <SettingRow label="Disable screen sleep" description="Keep screen on during workouts">
          <Switch checked={disableSleep} onCheckedChange={v => save("gym-disable-sleep", v, setDisableSleep)} />
        </SettingRow>
        <SettingRow label="Sound effects" description="Play sounds when completing sets">
          <Switch checked={soundEffects} onCheckedChange={v => save("gym-sound-effects", v, setSoundEffects)} />
        </SettingRow>
        <SettingRow label="Include bodyweight" description="Add bodyweight to assisted exercises">
          <Switch checked={includeBodyweight} onCheckedChange={v => save("gym-include-bodyweight", v, setIncludeBodyweight)} />
        </SettingRow>
      </Section>
    </div>
  );
}