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

const RANK_ORDER = ["none", "wood", "bronze", "silver", "gold", "platinum", "diamond", "champion", "titan", "olympian"];

function getRankFromVolume(totalVolume) {
  if (totalVolume >= 100000) return "olympian";
  if (totalVolume >= 70000) return "titan";
  if (totalVolume >= 50000) return "champion";
  if (totalVolume >= 35000) return "diamond";
  if (totalVolume >= 20000) return "platinum";
  if (totalVolume >= 12000) return "gold";
  if (totalVolume >= 6000) return "silver";
  if (totalVolume >= 2000) return "bronze";
  if (totalVolume >= 500) return "wood";
  return "none";
}

function getRecoveryLevel(lastTrainedDate) {
  if (!lastTrainedDate) return "fresh";
  const hoursAgo = (Date.now() - new Date(lastTrainedDate).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 12) return "sore";
  if (hoursAgo < 24) return "heavy";
  if (hoursAgo < 48) return "moderate";
  if (hoursAgo < 72) return "light";
  return "fresh";
}

function LogWeightModal({ onClose }) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!weight) return;
    setSaving(true);
    await base44.entities.BodyWeight.create({ weight: parseFloat(weight), unit: "kg", date });
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
          <h2 className="text-base font-bold">Log Weight</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <Input type="number" step="0.1" placeholder="80.0" value={weight}
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
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalWeightInput, setGoalWeightInput] = useState("");
  const [goalWeight, setGoalWeight] = useState(() => {
    const saved = localStorage.getItem("gym-goal-weight");
    return saved ? parseFloat(saved) : null;
  });
  const [activeTab, setActiveTab] = useState("progress");
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);

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

  const refetchTrackers = () => queryClient.invalidateQueries({ queryKey: ["userTrackers"] });
  const { data: userTrackers = [] } = useQuery({
    queryKey: ["userTrackers"],
    queryFn: () => base44.entities.UserTracker.list("order", 50),
  });

  const removeTracker = async (id) => {
    await base44.entities.UserTracker.delete(id);
    refetchTrackers();
  };

  const muscleRanks = {};
  const muscleLastTrained = {};

  workoutLogs.forEach(log => {
    log.exercises?.forEach(ex => {
      const muscle = ex.muscle_group;
      if (!muscle) return;
      let volume = 0;
      ex.sets?.forEach(s => { if (s.completed) volume += (s.weight || 0) * (s.reps || 0); });
      muscleRanks[muscle] = (muscleRanks[muscle] || 0) + volume;
      const logDate = log.finished_at || log.started_at || log.created_date;
      if (!muscleLastTrained[muscle] || new Date(logDate) > new Date(muscleLastTrained[muscle])) {
        muscleLastTrained[muscle] = logDate;
      }
    });
  });

  const muscleRankNames = {};
  Object.keys(muscleRanks).forEach(m => { muscleRankNames[m] = getRankFromVolume(muscleRanks[m]); });

  const recoveryData = {};
  Object.keys(muscleLastTrained).forEach(m => { recoveryData[m] = getRecoveryLevel(muscleLastTrained[m]); });

  const latestWeight = bodyWeights[0]?.weight;
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
                <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{latestWeight ? `${latestWeight}kg` : "--"}</span> weight</span>
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

        {/* Progress / Habits tab toggle */}
        <div className="flex bg-secondary rounded-xl p-1 gap-1">
          {["progress", "habits"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {activeTab === "habits" ? (
          <motion.div key="habits" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center justify-center gap-2 min-h-48">
              <p className="text-muted-foreground text-sm font-medium">Habits coming soon</p>
              <p className="text-muted-foreground text-xs">Track your daily habits here</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="progress" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.15 }} className="space-y-4">

        {/* Muscle Model Card */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Muscle Map</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Recovery</span>
              <Switch checked={showRecovery} onCheckedChange={setShowRecovery} className="scale-75" />
            </div>
          </div>
          <MuscleModel muscleRanks={muscleRankNames} recoveryData={recoveryData} showRecovery={showRecovery} />
          <div className="mt-4">
            {!showRecovery ? <RankLegend /> : (
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { name: "Fresh", color: "#444" }, { name: "Light", color: "#2d5a1b" },
                  { name: "Moderate", color: "#7a5c00" }, { name: "Heavy", color: "#7a3000" },
                  { name: "Sore", color: "#7a0000" },
                ].map(r => (
                  <div key={r.name} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: r.color + "33" }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[10px] font-semibold">{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
                  <Input type="number" step="0.1" placeholder={goalWeight ? `Current: ${goalWeight}kg` : "Goal weight (kg)"}
                    value={goalWeightInput} onChange={e => setGoalWeightInput(e.target.value)}
                    className="h-8 text-sm bg-secondary border-0 flex-1" />
                  <Button size="sm" className="h-8 px-3 text-xs" onClick={() => {
                    const val = parseFloat(goalWeightInput);
                    if (val) { setGoalWeight(val); localStorage.setItem("gym-goal-weight", String(val)); }
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
        )}
        </AnimatePresence>

      </div>

      {showLogWeight && <LogWeightModal onClose={() => setShowLogWeight(false)} />}
      {showProfileInfo && <ProfileInfoPanel user={user} onClose={() => setShowProfileInfo(false)} />}
      {showAddTracker && <AddTrackerModal onClose={() => setShowAddTracker(false)} onAdded={refetchTrackers} />}
    </div>
  );
}