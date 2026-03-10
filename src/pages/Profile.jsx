import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, User, Settings, Ruler, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MuscleModel from "../components/profile/MuscleModel";
import WeightChart from "../components/profile/WeightChart";
import RankLegend from "../components/profile/RankLegend";
import SettingsPanel from "../components/profile/SettingsPanel";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:items-center" onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Log Weight</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Input type="number" step="0.1" placeholder="80.0" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="text-center text-2xl font-bold h-14 bg-secondary border-0" autoFocus />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-secondary border-0" />
        </div>
        <Button onClick={handleSave} disabled={!weight || saving} className="w-full h-11 rounded-xl font-semibold">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function Profile() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const saved = localStorage.getItem("gym-dark-mode");
    setDarkMode(saved === null ? true : saved === "true");
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

  const muscleRanks = {};
  const muscleLastTrained = {};

  workoutLogs.forEach((log) => {
    log.exercises?.forEach((ex) => {
      const muscle = ex.muscle_group;
      if (!muscle) return;
      let volume = 0;
      ex.sets?.forEach((s) => { if (s.completed) volume += (s.weight || 0) * (s.reps || 0); });
      muscleRanks[muscle] = (muscleRanks[muscle] || 0) + volume;
      const logDate = log.finished_at || log.started_at || log.created_date;
      if (!muscleLastTrained[muscle] || new Date(logDate) > new Date(muscleLastTrained[muscle])) {
        muscleLastTrained[muscle] = logDate;
      }
    });
  });

  const muscleRankNames = {};
  Object.keys(muscleRanks).forEach((m) => { muscleRankNames[m] = getRankFromVolume(muscleRanks[m]); });

  const recoveryData = {};
  Object.keys(muscleLastTrained).forEach((m) => { recoveryData[m] = getRecoveryLevel(muscleLastTrained[m]); });

  const latestWeight = bodyWeights[0]?.weight;

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-4 space-y-5">
      {/* Top action bar */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9"
          onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4.5 h-4.5" />
        </Button>
        <Link to={createPageUrl("Measurements")}>
          <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
            <Ruler className="w-4.5 h-4.5" />
          </Button>
        </Link>
        <div className="flex-1" />
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <SettingsPanel darkMode={darkMode} onToggleDark={toggleDark} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user?.full_name || "Athlete"}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            <div className="text-center">
              <p className="text-sm font-bold">{latestWeight ? `${latestWeight}` : "--"}</p>
              <p className="text-[10px] text-muted-foreground">kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">--</p>
              <p className="text-[10px] text-muted-foreground">Height</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">{workoutLogs.length}</p>
              <p className="text-[10px] text-muted-foreground">Workouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Model Card */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-end gap-2 mb-2">
          <span className="text-[11px] text-muted-foreground">Recently Trained</span>
          <Switch checked={showRecovery} onCheckedChange={setShowRecovery} className="scale-90" />
        </div>
        <MuscleModel muscleRanks={muscleRankNames} recoveryData={recoveryData} showRecovery={showRecovery} />
        <div className="mt-4">
          {!showRecovery ? (
            <RankLegend />
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: "Fresh", color: "#444" },
                { name: "Light", color: "#2d5a1b" },
                { name: "Moderate", color: "#7a5c00" },
                { name: "Heavy", color: "#7a3000" },
                { name: "Sore", color: "#7a0000" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: r.color + "33" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-[10px] font-semibold text-foreground">{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weight Progress */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Weight Progress</h2>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setShowLogWeight(true)}>
            <Scale className="w-3.5 h-3.5" /> Log
          </Button>
        </div>
        <WeightChart data={bodyWeights} />
      </div>

      {/* Log Weight Modal */}
      {showLogWeight && <LogWeightModal onClose={() => setShowLogWeight(false)} />}
    </div>
  );
}