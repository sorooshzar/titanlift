import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Dumbbell, BarChart2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useActiveWorkout } from "../components/workout/ActiveWorkoutContext";
import { motion } from "framer-motion";
import { useWeightUnit } from "@/components/utils/useWeightUnit";
import { base44 } from "@/api/base44Client";
import { RANKS } from "@/components/utils/rankEngine";

const SET_TYPE_LABELS = { warmup: "W", working: null, failure: "F", dropset: "D" };
const SET_TYPE_COLORS = { warmup: "text-amber-500", working: "text-muted-foreground", failure: "text-destructive", dropset: "text-purple-400" };

function formatDuration(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WorkoutSummary() {
  const navigate = useNavigate();
  const { completedLog, clearCompletedLog } = useActiveWorkout();
  const { unit: weightUnit, toDisplay } = useWeightUnit();
  const [userGender, setUserGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [displayLog, setDisplayLog] = useState(null);

  useEffect(() => {
    if (!completedLog) navigate(createPageUrl("Lifts"), { replace: true });
  }, [completedLog]);

  useEffect(() => {
    const fetchUserAndCalculate = async () => {
      if (!completedLog?.id) return;
      try {
        const user = await base44.auth.me();
        setUserGender(user?.gender || "male");
        setLoading(true);
        
        const response = await base44.functions.invoke('calculateRanks', {
          workoutLogId: completedLog.id,
          userGender: user?.gender || "male"
        });
        
        // Update display log with calculated ranks
        if (response.data.updatedLog) {
          setDisplayLog(response.data.updatedLog);
        }
      } catch (err) {
        console.error("Error calculating ranks:", err);
        setDisplayLog(completedLog);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndCalculate();
  }, [completedLog?.id]);

  if (!completedLog) return null;

  const handleDone = () => {
    clearCompletedLog();
    navigate(createPageUrl("Lifts"), { replace: true });
  };

  // Use displayLog if available (with ranks), otherwise completedLog
  const logToDisplay = displayLog || completedLog;

  let workingSetCounter = {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto px-4 pt-5 pb-8"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground text-sm active:opacity-60 transition-opacity">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleDone} className="text-sm font-semibold text-primary active:opacity-60 transition-opacity">Done</button>
      </div>

      {/* Congrats header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="text-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
        <h1 className="text-2xl font-bold">{logToDisplay.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Workout Complete</p>
      </motion.div>

      {/* Stats row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 25 }}
        className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{formatDuration(logToDisplay.duration_minutes)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <BarChart2 className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{toDisplay(logToDisplay.total_volume)?.toLocaleString() || 0} {weightUnit}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{logToDisplay.total_sets || 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sets</p>
        </div>
      </motion.div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-full px-4 py-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Calculating ranks...
          </div>
        </div>
      )}

      {/* Exercise breakdown */}
      <div className="space-y-3 mt-2">
        {logToDisplay.exercises?.map((ex, exIdx) => {
          if (!workingSetCounter[exIdx]) workingSetCounter[exIdx] = 0;
          const completedSets = ex.sets?.filter(s => s.completed) || [];
          if (completedSets.length === 0) return null;

          const rankInfo = ex.rank ? RANKS.find(r => r.name === ex.rank) : null;
          return (
            <motion.div key={exIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + exIdx * 0.04, type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
              style={ex.color ? { borderLeftWidth: "3px", borderLeftColor: ex.color } : {}}>
              <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                {rankInfo ? (
                  <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: rankInfo.color }}>
                    {rankInfo.label[0]}
                  </div>
                ) : (
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-secondary" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{ex.exercise_name}</p>
                  {ex.impressiveness_score > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {rankInfo?.label || "—"} · score {ex.impressiveness_score.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-4 py-2">
                {/* Header */}
                <div className="grid grid-cols-4 gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground">SET</span>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center">WEIGHT</span>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center">REPS</span>
                  <span className="text-[10px] font-semibold text-muted-foreground text-center">RIR</span>
                </div>
                {completedSets.map((set, sIdx) => {
                  const isWorking = set.type !== "warmup";
                  if (isWorking) workingSetCounter[exIdx] = (workingSetCounter[exIdx] || 0) + 1;
                  const label = set.type === "warmup" ? "W" : workingSetCounter[exIdx];
                  const color = set.type === "warmup" ? "text-amber-500" : set.type === "failure" ? "text-destructive" : set.type === "dropset" ? "text-purple-400" : "text-muted-foreground";
                  return (
                    <div key={sIdx} className="grid grid-cols-4 gap-2 py-1.5 border-t border-border/50">
                      <span className={`text-xs font-bold ${color}`}>{label}</span>
                      <span className="text-xs text-center">{set.weight ? `${toDisplay(set.weight)} ${weightUnit}` : "—"}</span>
                      <span className="text-xs text-center">{set.reps || "—"}</span>
                      <span className="text-xs text-center text-muted-foreground">{set.rir ?? "—"}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}