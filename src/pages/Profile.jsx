import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Scale, ChevronRight, Settings, X, Target, Plus, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MuscleModel from "../components/profile/MuscleModel";
import WeightChart from "../components/profile/WeightChart";
import RankLegend from "../components/profile/RankLegend";
import SettingsPanel, { applyTheme } from "../components/profile/SettingsPanel";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import AddTrackerModal from "../components/profile/AddTrackerModal";
import { MeasurementTracker, ExerciseTracker, HabitsTracker, MacrosTracker } from "../components/profile/TrackerWidgets";
import { useWeightUnit } from "@/components/utils/useWeightUnit";
import { computeRecovery } from "@/components/utils/recoveryEngine";
import { computeMuscleRanks } from "@/components/utils/rankEngine";
import MuscleRankModal from "../components/profile/MuscleRankModal";
import NutritionRankCard from "../components/macros/NutritionRank";
import { computeNutritionStreak } from "../components/macros/NutritionRank";
import { subDays, format as fmtDate } from "date-fns";


function LogWeightModal({ onClose }) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { unit, toKg } = useWeightUnit();

  const handleSave = async () => {
    if (!weight) return;
    setSaving(true);
    // Always store in kg (base unit)
    const kgWeight = toKg(parseFloat(weight));
    await base44.entities.BodyWeight.create({ weight: kgWeight, unit: "kg", date });
    queryClient.invalidateQueries({ queryKey: ["bodyWeights"] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl border-t sm:border border-border p-5 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Log Weight ({unit})</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <Input type="number" step="0.1" placeholder={unit === "lbs" ? "176.0" : "80.0"} value={weight}
          onChange={e => setWeight(e.target.value)}
          className="text-center text-2xl font-bold h-14 bg-secondary border-0" autoFocus />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-0" />
        <Button onClick={handleSave} disabled={!weight || saving} className="w-full h-11 rounded-xl font-semibold">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ProfileInfoPanel({ user, onClose }) {
  const handleSignOut = () => {
    base44.auth.logout();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-6 space-y-4"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Profile Info</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="bg-secondary rounded-xl px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Name</p>
            <p className="text-sm font-medium">{user?.full_name || "—"}</p>
          </div>
          <div className="bg-secondary rounded-xl px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
            <p className="text-sm font-medium">{user?.email || "—"}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Link to={createPageUrl("Settings")} onClick={onClose} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-secondary rounded-xl py-3 text-sm font-semibold">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </Link>
          <button onClick={handleSignOut}
            className="flex-1 bg-destructive/10 text-destructive rounded-xl py-3 text-sm font-semibold">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [rankModalMuscle, setRankModalMuscle] = useState(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalWeightInput, setGoalWeightInput] = useState("");
  // goalWeight is stored in kg (base unit)
  const [goalWeight, setGoalWeight] = useState(() => {
    const saved = localStorage.getItem("gym-goal-weight");
    return saved ? parseFloat(saved) : null;
  });
  const [activeTab, setActiveTab] = useState("rank");
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);
  const { unit: weightUnit, toDisplay, toKg } = useWeightUnit();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const saved = localStorage.getItem("gym-dark-mode");
    setDarkMode(saved === null ? true : saved === "true");
    const savedTheme = localStorage.getItem("gym-theme");
    if (savedTheme) applyTheme(savedTheme);
  }, []);

  const toggleDark = (v) => {
    setDarkMode(v);
    localStorage.setItem("gym-dark-mode", String(v));
    document.documentElement.classList.toggle("dark", v);
    window.dispatchEvent(new Event("darkModeChanged"));
  };

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 100),
  });

  const { data: bodyWeights = [] } = useQuery({
    queryKey: ["bodyWeights"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 50),
  });

  // For nutrition rank — fetch all macro + water entries to compute streak
  const { data: allMacroEntries = [] } = useQuery({
    queryKey: ["profileAllMacroEntries"],
    queryFn: () => base44.entities.MacroEntry.list("-date", 500),
  });
  const { data: allWaterLogs = [] } = useQuery({
    queryKey: ["profileAllWaterLogs"],
    queryFn: () => base44.entities.WaterLog.list("-date", 500),
  });
  const nutritionStreak = computeNutritionStreak(allMacroEntries, allWaterLogs);

  const refetchTrackers = () => queryClient.invalidateQueries({ queryKey: ["userTrackers"] });
  const { data: userTrackers = [] } = useQuery({
    queryKey: ["userTrackers"],
    queryFn: () => base44.entities.UserTracker.list("order", 50),
  });

  const removeTracker = async (id) => {
    await base44.entities.UserTracker.delete(id);
    refetchTrackers();
  };

  const recoveryData = computeRecovery(workoutLogs);

  // latestWeight stored in kg, display converts it
  const latestWeightKg = bodyWeights[0]?.weight;
  const latestWeightDisplay = latestWeightKg ? toDisplay(latestWeightKg) : null;

  const muscleRankDetails = computeMuscleRanks(workoutLogs, latestWeightKg || 80);
  const muscleRankNames = {};
  Object.keys(muscleRankDetails).forEach(m => { muscleRankNames[m] = muscleRankDetails[m].rank.name; });

  // totalVolume always in kg for XP — never affected by unit toggle
  const totalVolume = workoutLogs.reduce((s, l) => s + (l.total_volume || 0), 0);

  // XP / Level calculation based on total volume
  function getLevelData(volume) {
    // Each level requires more XP: level^1.5 * 500 base
    let level = 1;
    let xpUsed = 0;
    while (true) {
      const xpNeeded = Math.floor(Math.pow(level, 1.5) * 500);
      if (xpUsed + xpNeeded > volume) {
        return { level, xpIntoLevel: volume - xpUsed, xpNeeded, progress: (volume - xpUsed) / xpNeeded };
      }
      xpUsed += xpNeeded;
      level++;
      if (level > 999) return { level: 999, xpIntoLevel: 0, xpNeeded: 1, progress: 1 };
    }
  }
  const xp = getLevelData(totalVolume);

  return (
    <div className="max-w-lg mx-auto px-4 pb-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg pt-4 pb-2 border-b border-border/30 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Profile</h1>
          <div className="flex items-center gap-1.5">
            <Link to={createPageUrl("Measurements")}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors">
                <Ruler className="w-4 h-4" />
              </button>
            </Link>
            <Link to={createPageUrl("Settings")}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile info bar — clickable, smaller */}
        <button onClick={() => setShowProfileInfo(true)}
          className="w-full flex items-center gap-3 bg-card rounded-2xl border border-border px-3 py-3 text-left active:scale-[0.99] transition-transform">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border shrink-0">
            <span className="text-base font-bold text-primary">{user?.full_name?.[0]?.toUpperCase() || "A"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <p className="font-bold text-sm truncate">{user?.full_name || "Athlete"}</p>
              <div className="flex gap-3 shrink-0">
                <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{workoutLogs.length}</span> workouts</span>
                <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{latestWeightDisplay ? `${latestWeightDisplay}${weightUnit}` : "--"}</span> weight</span>
              </div>
            </div>
            {/* XP Bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary shrink-0">Lv {xp.level}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(xp.progress * 100, 100)}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{xp.level + 1}</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>

        {/* Rank / Stats tab toggle */}
         <div className="flex bg-secondary rounded-xl p-1 gap-1">
           {["rank", "stats"].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)}
               className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
               {tab === "rank" ? "Rank" : "Stats"}
             </button>
           ))}
         </div>

        <AnimatePresence mode="wait">
        {activeTab === "stats" ? (
          <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-4">

        {/* Weight Progress */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Weight Progress</h2>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs rounded-lg px-2.5" onClick={() => setShowGoalInput(v => !v)}>
                <Target className="w-3 h-3" /> Goal
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs rounded-lg px-2.5" onClick={() => setShowLogWeight(true)}>
                <Scale className="w-3 h-3" /> Log
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {showGoalInput && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                <div className="flex gap-2 items-center">
                   <Input type="number" step="0.1"
                    placeholder={goalWeight ? `Current: ${toDisplay(goalWeight)}${weightUnit}` : `Goal weight (${weightUnit})`}
                    value={goalWeightInput} onChange={e => setGoalWeightInput(e.target.value)}
                    className="h-8 text-sm bg-secondary border-0 flex-1" />
                  <Button size="sm" className="h-8 px-3 text-xs" onClick={() => {
                    const val = parseFloat(goalWeightInput);
                    // Store goal in kg
                    if (val) { const kgVal = toKg(val); setGoalWeight(kgVal); localStorage.setItem("gym-goal-weight", String(kgVal)); }
                    setShowGoalInput(false); setGoalWeightInput("");
                  }}>Set</Button>
                  {goalWeight && <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-destructive" onClick={() => {
                    setGoalWeight(null); localStorage.removeItem("gym-goal-weight"); setShowGoalInput(false);
                  }}>Clear</Button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <WeightChart data={bodyWeights} goalWeight={goalWeight} />
        </div>

        {/* Tracker widgets */}
        {userTrackers.map(t => {
          const props = { key: t.id, tracker: t, onRemove: () => removeTracker(t.id) };
          if (t.type === "measurement") return <MeasurementTracker {...props} />;
          if (t.type === "exercise") return <ExerciseTracker {...props} />;
          if (t.type === "habits") return <HabitsTracker {...props} />;
          if (t.type === "macros") return <MacrosTracker {...props} />;
          return null;
        })}

        {/* Add Tracker bar */}
        <button onClick={() => setShowAddTracker(true)}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Add Tracker
        </button>
          </motion.div>
        ) : (
          <motion.div key="rank" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }} className="space-y-4">

        {/* Muscle Model Card — map left, legend right */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Muscle Map</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Recovery</span>
              <Switch checked={showRecovery} onCheckedChange={setShowRecovery} className="scale-75" />
            </div>
          </div>

          <div className="flex items-start">
            {/* Muscle model — larger */}
            <div className="shrink-0" style={{ width: 185 }}>
              <MuscleModel muscleRanks={muscleRankNames} recoveryData={recoveryData} showRecovery={showRecovery} onMuscleRank={setRankModalMuscle} compact />
            </div>

            {/* Legend — right side, vertically spread, circles+names centered */}
            <div className="flex-1 flex flex-col items-center ml-2" style={{ alignSelf: 'stretch' }}>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mb-1 text-center">
                {showRecovery ? "Recovery" : "Muscle Rank"}
              </p>
              <div className="flex-1 flex flex-col justify-between w-full items-center py-1">
                {!showRecovery ? (
                  [
                    { name: "Wood", color: "#8B6914" },
                    { name: "Bronze", color: "#CD7F32" },
                    { name: "Silver", color: "#C0C0C0" },
                    { name: "Gold", color: "#FFD700" },
                    { name: "Platinum", color: "#E5E4E2" },
                    { name: "Diamond", color: "#B9F2FF" },
                    { name: "Champion", color: "#9B59B6" },
                    { name: "Titan", color: "#E74C3C" },
                    { name: "Olympian", color: "#FF6B35" },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-center gap-1.5 w-full">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: r.color }}>{r.name}</span>
                    </div>
                  ))
                ) : (
                  [
                    { name: "Ready", color: "#22c55e" },
                    { name: "Light", color: "#84cc16" },
                    { name: "Moderate", color: "#eab308" },
                    { name: "Heavy", color: "#f97316" },
                    { name: "Sore", color: "#ef4444" },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-center gap-1.5 w-full">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-[10px] font-semibold" style={{ color: r.color }}>{r.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Rank Card */}
        <NutritionRankCard streak={nutritionStreak} />
          </motion.div>
        )}
        </AnimatePresence>

      </div>

      {showLogWeight && <LogWeightModal onClose={() => setShowLogWeight(false)} />}
      {showProfileInfo && <ProfileInfoPanel user={user} onClose={() => setShowProfileInfo(false)} />}
      {showAddTracker && <AddTrackerModal onClose={() => setShowAddTracker(false)} onAdded={refetchTrackers} />}
      {rankModalMuscle && (
        <MuscleRankModal
          muscle={rankModalMuscle}
          rankData={muscleRankDetails[rankModalMuscle]}
          onClose={() => setRankModalMuscle(null)}
        />
      )}
    </div>
  );
}