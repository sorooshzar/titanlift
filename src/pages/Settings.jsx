import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Moon, Sun, Palette, Ruler, Sliders, Zap, Timer, Apple } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Switch } from "@/components/ui/switch";
import { applyTheme } from "../components/profile/SettingsPanel";
import { motion, AnimatePresence } from "framer-motion";

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

function Section({ icon: Icon, title, color, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0`} style={{ backgroundColor: color + "22" }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <span className="flex-1 text-left font-semibold text-sm">{title}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-border/50 divide-y divide-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [warmupRestTime, setWarmupRestTime] = useState(60);
  const [compoundRestTime, setCompoundRestTime] = useState(180);
  const [isolationRestTime, setIsolationRestTime] = useState(90);

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
    setWarmupRestTime(parseInt(localStorage.getItem("gym-warmup-rest") || "60"));
    setCompoundRestTime(parseInt(localStorage.getItem("gym-compound-rest") || "180"));
    setIsolationRestTime(parseInt(localStorage.getItem("gym-isolation-rest") || "90"));
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

  const handleWeightUnitChange = (newUnit) => {
    if (weightUnit === newUnit) return;
    // We only change the display preference — all weights are stored in kg (base unit).
    // Converting stored data causes rounding drift and XP fluctuation, so we never touch the DB here.
    save("gym-weight-unit", newUnit, setWeightUnit);
    window.dispatchEvent(new CustomEvent("weightUnitChanged", { detail: { unit: newUnit } }));
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-8 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to={createPageUrl("Profile")}>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance" color="#8b5cf6">
        <SettingRow label={darkMode ? "Dark Mode" : "Light Mode"} description="Toggle app theme">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <Switch checked={darkMode} onCheckedChange={toggleDark} />
          </div>
        </SettingRow>
        <div className="px-4 py-3.5">
          <p className="text-sm font-medium mb-3">Color Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleTheme(t.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${theme === t.id ? "bg-secondary ring-2 ring-primary" : "bg-secondary/50"}`}>
                <div className="w-7 h-7 rounded-full shadow-sm" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] font-medium text-muted-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Measurements */}
      <Section icon={Ruler} title="Measurements" color="#06b6d4">
        <SettingRow label="Weight Unit">
          <SegmentPicker value={weightUnit} onChange={handleWeightUnitChange}
            options={[{ id: "kg", label: "kg" }, { id: "lbs", label: "lbs" }]} />
        </SettingRow>
        <SettingRow label="Distance Unit">
          <SegmentPicker value={distanceUnit} onChange={v => save("gym-distance-unit", v, setDistanceUnit)}
            options={[{ id: "metric", label: "km" }, { id: "imperial", label: "mi" }]} />
        </SettingRow>
        <SettingRow label="Week Starts On">
          <SegmentPicker value={weekStart} onChange={v => save("gym-week-start", v, setWeekStart)}
            options={[{ id: "monday", label: "Mon" }, { id: "sunday", label: "Sun" }]} />
        </SettingRow>
      </Section>

      {/* Timers */}
       <Section icon={Timer} title="Timers" color="#ec4899">
         <SettingRow label="Warm-up rest time" description="Rest between warm-up sets">
           <input type="number" value={warmupRestTime} onChange={e => { setWarmupRestTime(parseInt(e.target.value)); localStorage.setItem("gym-warmup-rest", String(e.target.value)); }}
             className="w-20 text-xs text-center bg-secondary border-0 rounded-lg px-2 py-1" />
           <span className="text-xs text-muted-foreground ml-1">s</span>
         </SettingRow>
         <SettingRow label="Compound rest time" description="Rest for compound movements">
           <input type="number" value={compoundRestTime} onChange={e => { setCompoundRestTime(parseInt(e.target.value)); localStorage.setItem("gym-compound-rest", String(e.target.value)); }}
             className="w-20 text-xs text-center bg-secondary border-0 rounded-lg px-2 py-1" />
           <span className="text-xs text-muted-foreground ml-1">s</span>
         </SettingRow>
         <SettingRow label="Isolation rest time" description="Rest for isolation movements">
           <input type="number" value={isolationRestTime} onChange={e => { setIsolationRestTime(parseInt(e.target.value)); localStorage.setItem("gym-isolation-rest", String(e.target.value)); }}
             className="w-20 text-xs text-center bg-secondary border-0 rounded-lg px-2 py-1" />
           <span className="text-xs text-muted-foreground ml-1">s</span>
         </SettingRow>
       </Section>

       {/* Macros */}
       <Section icon={Apple} title="Macros" color="#f59e0b">
         <SettingRow label="Calorie Goal" description="Your daily target">
           <span className="text-xs text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-lg">2000 kcal</span>
         </SettingRow>
         <SettingRow label="Protein Goal" description="Daily protein target">
           <span className="text-xs text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-lg">150 g</span>
         </SettingRow>
       </Section>

       {/* Preferences */}
       <Section icon={Sliders} title="Preferences" color="#06b6d4">
         <SettingRow label="Previous set display" description="How previous set data appears">
           <span className="text-xs text-muted-foreground">Weight × Reps</span>
         </SettingRow>
       </Section>

      {/* Advanced */}
      <Section icon={Zap} title="Advanced" color="#ef4444">
        <SettingRow label="Count dumbbells twice" description="Multiply dumbbell weight ×2 for total volume">
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

      {/* Account */}
      <Section icon={Apple} title="Account" color="#dc2626">
        <button onClick={() => {
          if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
            base44.auth.deleteAccount?.().catch(err => console.error(err));
          }
        }} className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors">
          Delete Account
        </button>
      </Section>
      </div>
      );
      }