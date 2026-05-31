import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { userStorage } from "@/components/utils/userStorage";
import { applyTheme } from "@/components/profile/SettingsPanel";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Moon, Sun, Check, LogOut, Trash2,
  Palette, Ruler, Timer, Utensils, Sliders, Zap, User
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const THEMES = [
  { id: "default",   label: "Blue",   color: "#2563eb" },
  { id: "halloween", label: "Orange", color: "#f97316" },
  { id: "crimson",   label: "Red",    color: "#dc2626" },
  { id: "forest",    label: "Green",  color: "#16a34a" },
  { id: "fairy",     label: "Pink",   color: "#ec4899" },
  { id: "gold",      label: "Gold",   color: "#eab308" },
  { id: "ocean",     label: "Cyan",   color: "#0891b2" },
  { id: "violet",    label: "Violet", color: "#7c3aed" },
];

function Seg({ options, value, onChange }) {
  return (
    <div className="flex bg-secondary rounded-lg p-0.5 shrink-0">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${value === o.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border/60 mx-4" />;
}

function Section({ icon: Icon, label, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-1 py-1.5 rounded-xl active:bg-secondary/40 transition-colors"
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "30" }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <p className="flex-1 text-left text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronRight className="w-3.5 h-3.5" style={{ color }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border/40 mt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimerStepper({ value, onChange, min = 15, max = 600, step = 15 }) {
  const fmt = (s) => s >= 60 ? `${Math.floor(s / 60)}m${s % 60 > 0 ? ` ${s % 60}s` : ""}` : `${s}s`;
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-base font-bold text-muted-foreground">−</button>
      <span className="text-sm font-bold w-14 text-center">{fmt(value)}</span>
      <button onClick={() => onChange(Math.min(max, value + step))}
        className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-base font-bold text-muted-foreground">+</button>
    </div>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);

  // Appearance
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState("default");

  // Units
  const [weightUnit, setWeightUnit] = useState("kg");
  const [distanceUnit, setDistanceUnit] = useState("metric");
  const [weekStart, setWeekStart] = useState("monday");

  // Timers
  const [warmupRest, setWarmupRest] = useState(60);
  const [compoundRest, setCompoundRest] = useState(180);
  const [isolationRest, setIsolationRest] = useState(90);
  const [autoStartRest, setAutoStartRest] = useState(false);
  const [timerSound, setTimerSound] = useState(true);
  const [timerVibration, setTimerVibration] = useState(true);

  // Nutrition — local draft (not saved until user taps Save)
  const [macroCalories, setMacroCalories] = useState(2000);
  const [macroProtein, setMacroProtein] = useState(150);
  const [macroCarbs, setMacroCarbs] = useState(225);
  const [macroFat, setMacroFat] = useState(67);
  const [macroDirty, setMacroDirty] = useState(false);
  const [macroSaving, setMacroSaving] = useState(false);

  // Preferences
  const [prevSetDisplay, setPrevSetDisplay] = useState("weight_reps");
  const [showExerciseNotes, setShowExerciseNotes] = useState(true);
  const [showMuscleGroups, setShowMuscleGroups] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Advanced
  const [countDumbbellTwice, setCountDumbbellTwice] = useState(false);
  const [includeBodyweight, setIncludeBodyweight] = useState(false);
  const [disableSleep, setDisableSleep] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Load macros from user account (source of truth), fallback to localStorage
      setMacroCalories(u?.daily_calories || parseInt(userStorage.getItem("gym-macro-calories") || "2000"));
      setMacroProtein(u?.daily_protein || parseInt(userStorage.getItem("gym-macro-protein") || "150"));
      setMacroCarbs(u?.daily_carbs || parseInt(userStorage.getItem("gym-macro-carbs") || "225"));
      setMacroFat(u?.daily_fat || parseInt(userStorage.getItem("gym-macro-fat") || "67"));
    }).catch(() => {});

    setDarkMode(localStorage.getItem("gym-dark-mode") === null ? true : localStorage.getItem("gym-dark-mode") === "true");
    setTheme(userStorage.getItem("gym-theme") || "default");
    setWeightUnit(userStorage.getItem("gym-weight-unit") || "kg");
    setDistanceUnit(userStorage.getItem("gym-distance-unit") || "metric");
    setWeekStart(userStorage.getItem("gym-week-start") || "monday");
    setWarmupRest(parseInt(userStorage.getItem("gym-warmup-rest") || "60"));
    setCompoundRest(parseInt(userStorage.getItem("gym-compound-rest") || "180"));
    setIsolationRest(parseInt(userStorage.getItem("gym-isolation-rest") || "90"));
    setAutoStartRest(userStorage.getItem("gym-auto-start-rest") === "true");
    setTimerSound(userStorage.getItem("gym-timer-sound") !== "false");
    setTimerVibration(userStorage.getItem("gym-timer-vibration") !== "false");
    setPrevSetDisplay(userStorage.getItem("gym-prev-set-display") || "weight_reps");
    setShowExerciseNotes(userStorage.getItem("gym-show-exercise-notes") !== "false");
    setShowMuscleGroups(userStorage.getItem("gym-show-muscle-groups") !== "false");
    setShowVolume(userStorage.getItem("gym-show-volume") !== "false");
    setCountDumbbellTwice(userStorage.getItem("gym-dumbbell-twice") === "true");
    setIncludeBodyweight(userStorage.getItem("gym-include-bodyweight") === "true");
    setDisableSleep(userStorage.getItem("gym-disable-sleep") === "true");
    setSoundEffects(userStorage.getItem("gym-sound-effects") === "true");
  }, []);

  const save = (key, val, setter) => { setter(val); userStorage.setItem(key, String(val)); };

  const toggleDark = (v) => {
    setDarkMode(v);
    localStorage.setItem("gym-dark-mode", String(v));
    document.documentElement.classList.toggle("dark", v);
    window.dispatchEvent(new Event("darkModeChanged"));
  };

  const handleTheme = (id) => { setTheme(id); applyTheme(id); };

  const handleWeightUnit = (u) => {
    save("gym-weight-unit", u, setWeightUnit);
    window.dispatchEvent(new CustomEvent("weightUnitChanged", { detail: { unit: u } }));
  };

  const saveMacros = async () => {
    setMacroSaving(true);
    // Save to user account (primary source of truth)
    await base44.auth.updateMe({
      daily_calories: macroCalories,
      daily_protein: macroProtein,
      daily_carbs: macroCarbs,
      daily_fat: macroFat,
    });
    // Also mirror to localStorage for offline/fallback reads
    userStorage.setItem("gym-macro-calories", String(macroCalories));
    userStorage.setItem("gym-macro-protein", String(macroProtein));
    userStorage.setItem("gym-macro-carbs", String(macroCarbs));
    userStorage.setItem("gym-macro-fat", String(macroFat));
    // Notify Macros page
    window.dispatchEvent(new CustomEvent("macroGoalsChanged", {
      detail: { calories: macroCalories, protein: macroProtein, carbs: macroCarbs, fat: macroFat }
    }));
    setMacroDirty(false);
    setMacroSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to={createPageUrl("Profile")}>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* ── APPEARANCE ─────────────────────── */}
      <Section icon={Palette} label="Appearance" color="#8b5cf6">
        <Row label={darkMode ? "Dark Mode" : "Light Mode"} description="Toggle between dark and light interface">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <Switch checked={darkMode} onCheckedChange={toggleDark} />
          </div>
        </Row>
        <div className="px-4 py-3.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accent Color</p>
          <div className="grid grid-cols-8 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => handleTheme(t.id)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full transition-all ${theme === t.id ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "opacity-70"}`}
                  style={{ backgroundColor: t.color, '--tw-ring-color': t.color }} />
                {theme === t.id && <div className="w-1 h-1 rounded-full bg-foreground" />}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── UNITS ──────────────────────────── */}
      <Section icon={Ruler} label="Units & Measurements" color="#06b6d4">
        <Row label="Weight">
          <Seg value={weightUnit} onChange={handleWeightUnit} options={[{ id: "kg", label: "kg" }, { id: "lbs", label: "lbs" }]} />
        </Row>
        <Divider />
        <Row label="Distance">
          <Seg value={distanceUnit} onChange={v => save("gym-distance-unit", v, setDistanceUnit)} options={[{ id: "metric", label: "km" }, { id: "imperial", label: "mi" }]} />
        </Row>
        <Divider />
        <Row label="Week Starts On">
          <Seg value={weekStart} onChange={v => save("gym-week-start", v, setWeekStart)} options={[{ id: "monday", label: "Mon" }, { id: "sunday", label: "Sun" }]} />
        </Row>
      </Section>

      {/* ── TIMERS ─────────────────────────── */}
      <Section icon={Timer} label="Workout & Timers" color="#ec4899">
        <Row label="Warm-up Rest" description="Rest time between warm-up sets">
          <TimerStepper value={warmupRest} onChange={v => save("gym-warmup-rest", v, setWarmupRest)} />
        </Row>
        <Divider />
        <Row label="Compound Rest" description="Rest for compound movements">
          <TimerStepper value={compoundRest} onChange={v => save("gym-compound-rest", v, setCompoundRest)} step={30} />
        </Row>
        <Divider />
        <Row label="Isolation Rest" description="Rest for isolation movements">
          <TimerStepper value={isolationRest} onChange={v => save("gym-isolation-rest", v, setIsolationRest)} />
        </Row>
        <Divider />
        <Row label="Auto-start Rest Timer" description="Start rest timer automatically after completing a set">
          <Switch checked={autoStartRest} onCheckedChange={v => save("gym-auto-start-rest", v, setAutoStartRest)} />
        </Row>
        <Divider />
        <Row label="Timer Sound" description="Play a sound when rest timer ends">
          <Switch checked={timerSound} onCheckedChange={v => save("gym-timer-sound", v, setTimerSound)} />
        </Row>
        <Divider />
        <Row label="Vibration" description="Vibrate when rest timer ends">
          <Switch checked={timerVibration} onCheckedChange={v => save("gym-timer-vibration", v, setTimerVibration)} />
        </Row>
      </Section>

      {/* ── NUTRITION ──────────────────────── */}
      <Section icon={Utensils} label="Nutrition" color="#f59e0b">
        <div className="px-4 py-4 space-y-4">
          <p className="text-[11px] text-muted-foreground">Set your daily macro goals. Press Save to apply — unsaved changes are discarded if you leave.</p>

          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Daily Calories</p>
              <span className="text-xs text-muted-foreground">{macroCalories} kcal</span>
            </div>
            <input type="number" inputMode="numeric" value={macroCalories}
              onChange={e => { setMacroCalories(Math.max(500, parseInt(e.target.value) || 500)); setMacroDirty(true); }}
              className="w-full text-center text-2xl font-black bg-secondary border-0 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "protein", label: "Protein", val: macroProtein, setVal: setMacroProtein, kcalPer: 4, color: "#60a5fa" },
              { key: "carbs",   label: "Carbs",   val: macroCarbs,   setVal: setMacroCarbs,   kcalPer: 4, color: "#fbbf24" },
              { key: "fat",     label: "Fat",     val: macroFat,     setVal: setMacroFat,     kcalPer: 9, color: "#f472b6" },
            ].map(({ key, label, val, setVal, kcalPer, color }) => {
              const pct = macroCalories > 0 ? Math.round((val * kcalPer / macroCalories) * 100) : 0;
              return (
                <div key={key} className="bg-secondary rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color }}>{label}</span>
                    <span className="text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                  <input type="number" inputMode="numeric" value={val}
                    onChange={e => { setVal(Math.max(0, parseInt(e.target.value) || 0)); setMacroDirty(true); }}
                    className="w-full text-center text-base font-black bg-card border-0 rounded-lg py-1.5 focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground text-center mt-1">{val * kcalPer} kcal</p>
                </div>
              );
            })}
          </div>

          {/* Save button — lights up when dirty */}
          <AnimatePresence>
            {macroDirty && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
                <Button className="w-full gap-2" onClick={saveMacros} disabled={macroSaving}>
                  <Check className="w-4 h-4" />
                  {macroSaving ? "Saving…" : "Save Macro Goals"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── PREFERENCES ────────────────────── */}
      <Section icon={Sliders} label="App Preferences" color="#10b981">
        <div className="px-4 py-3.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Previous Set Display</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "weight_reps", label: "Weight × Reps" },
              { id: "weight_only", label: "Weight Only" },
              { id: "reps_only",   label: "Reps Only" },
              { id: "hidden",      label: "Hidden" },
            ].map(opt => (
              <button key={opt.id} onClick={() => save("gym-prev-set-display", opt.id, setPrevSetDisplay)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${prevSetDisplay === opt.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <Divider />
        <Row label="Show Exercise Notes" description="Display technique notes under exercise name">
          <Switch checked={showExerciseNotes} onCheckedChange={v => save("gym-show-exercise-notes", v, setShowExerciseNotes)} />
        </Row>
        <Divider />
        <Row label="Show Muscle Groups" description="Display target muscle under exercise name">
          <Switch checked={showMuscleGroups} onCheckedChange={v => save("gym-show-muscle-groups", v, setShowMuscleGroups)} />
        </Row>
        <Divider />
        <Row label="Show Workout Volume" description="Display total volume on workout completion">
          <Switch checked={showVolume} onCheckedChange={v => save("gym-show-volume", v, setShowVolume)} />
        </Row>
      </Section>

      {/* ── ADVANCED ───────────────────────── */}
      <Section icon={Zap} label="Advanced" color="#ef4444">
        <Row label="Count Dumbbells Twice" description="Multiply dumbbell weight ×2 when calculating total volume">
          <Switch checked={countDumbbellTwice} onCheckedChange={v => save("gym-dumbbell-twice", v, setCountDumbbellTwice)} />
        </Row>
        <Divider />
        <Row label="Include Bodyweight in Volume" description="Add your bodyweight to bodyweight exercises">
          <Switch checked={includeBodyweight} onCheckedChange={v => save("gym-include-bodyweight", v, setIncludeBodyweight)} />
        </Row>
        <Divider />
        <Row label="Keep Screen Awake" description="Prevents the display from turning off during workouts">
          <Switch checked={disableSleep} onCheckedChange={v => save("gym-disable-sleep", v, setDisableSleep)} />
        </Row>
        <Divider />
        <Row label="Sound Effects" description="Play sounds when completing sets and finishing workouts">
          <Switch checked={soundEffects} onCheckedChange={v => save("gym-sound-effects", v, setSoundEffects)} />
        </Row>
      </Section>

      {/* ── ACCOUNT ────────────────────────── */}
      <Section icon={User} label="Account" color="#64748b">
        {user && (
          <>
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{user.full_name?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Divider />
          </>
        )}
        <button onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium hover:bg-secondary/50 transition-colors text-left">
          <LogOut className="w-4 h-4 text-muted-foreground" />
          <span>Sign Out</span>
        </button>
        <Divider />
        <button onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </Section>

      <p className="text-[11px] text-muted-foreground text-center mt-4 px-4">Deleting your account is permanent and cannot be undone.</p>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div className="bg-card w-full max-w-sm rounded-2xl border border-border p-5 space-y-4"
              initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <h3 className="font-bold text-base">Delete Account?</h3>
                <p className="text-sm text-muted-foreground mt-1">This will permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-secondary text-sm font-semibold">Cancel</button>
                <button onClick={() => { setShowDeleteConfirm(false); base44.auth.deleteAccount?.().catch(() => {}); }}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}