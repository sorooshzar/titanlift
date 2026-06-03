import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, Clock, Dumbbell, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveWorkout } from "../components/workout/ActiveWorkoutContext";
import { motion } from "framer-motion";
import { useWeightUnit } from "@/components/utils/useWeightUnit";
import { base44 } from "@/api/base44Client";
import { RANKS } from "@/components/utils/rankEngine";

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
  const [loading, setLoading] = useState(false);
  const [displayLog, setDisplayLog] = useState(null);
  // Capture the log on first mount — so clearing completedLog doesn't wipe the UI
  const capturedLogRef = useRef(null);

  // On mount (and whenever completedLog arrives), capture it so it survives clearCompletedLog
  useEffect(() => {
    if (completedLog && !capturedLogRef.current) {
      capturedLogRef.current = completedLog;
      setDisplayLog(completedLog);
    }
  }, [completedLog]);

  // Also try capturing synchronously at render time (in case effect is too late)
  if (completedLog && !capturedLogRef.current) {
    capturedLogRef.current = completedLog;
  }

  // If we never got a log (navigated here directly), go back to Lifts
  useEffect(() => {
    const t = setTimeout(() => {
      if (!capturedLogRef.current) {
        navigate("/Lifts", { replace: true });
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // Calculate ranks once we have the captured log
  useEffect(() => {
    // Use ref (synchronously captured) OR wait for effect to set it
    const log = capturedLogRef.current || completedLog;
    if (!log?.id) return;

    const calculate = async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        const response = await base44.functions.invoke("calculateRanks", {
          workoutLogId: log.id,
          userGender: user?.sex || "male",
          exercises: log.exercises,
        });

        const apiExercises = response?.data?.updatedLog?.exercises;
        if (!apiExercises || apiExercises.length === 0) {
          console.warn("[WorkoutSummary] No exercises returned from calculateRanks");
          return;
        }

        // Build rank map keyed by exercise_id (fallback to name)
        const rankMap = {};
        apiExercises.forEach(ex => {
          const key = ex.exercise_id || ex.exercise_name;
          rankMap[key] = {
            rank: ex.rank,
            impressiveness_score: ex.impressiveness_score,
            is_personal_best: ex.is_personal_best,
            best_e1rm: ex.best_e1rm,
          };
        });

        // Merge rank data onto the captured log's exercises (preserving set data)
        const mergedExercises = log.exercises.map(ex => {
          const key = ex.exercise_id || ex.exercise_name;
          const rankData = rankMap[key] || {};
          return { ...ex, ...rankData };
        });

        setDisplayLog({ ...log, exercises: mergedExercises });
      } catch (err) {
        console.error("[WorkoutSummary] Error calculating ranks:", err);
        // Keep displaying without ranks — don't blank the screen
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, []); // run once on mount

  const handleDone = () => {
    clearCompletedLog();
    navigate("/Lifts", { replace: true });
  };

  // Nothing captured yet — show a brief loading state (not null/black)
  const logToShow = displayLog || (capturedLogRef.current ? capturedLogRef.current : null);
  if (!logToShow) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const effectiveLog = logToShow;

  const workingSetCounter = {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto px-4 pt-5 pb-8"
    >
      {/* Header row */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={handleDone}
          className="text-sm font-semibold text-primary active:opacity-60 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* Congrats header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-center mb-6"
      >
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
        <h1 className="text-2xl font-bold">{effectiveLog.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Workout Complete</p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 25 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{formatDuration(effectiveLog.duration_minutes)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <BarChart2 className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{toDisplay(effectiveLog.total_volume)?.toLocaleString() || 0} {weightUnit}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{effectiveLog.total_sets || 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sets</p>
        </div>
      </motion.div>

      {/* Rank loading indicator */}
      {loading && (
        <div className="text-center py-3 mb-2">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-full px-4 py-2">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Calculating ranks…
          </div>
        </div>
      )}

      {/* Exercise breakdown */}
      <div className="space-y-3">
        {effectiveLog.exercises?.map((ex, exIdx) => {
          if (!workingSetCounter[exIdx]) workingSetCounter[exIdx] = 0;
          const completedSets = ex.sets?.filter(s => s.completed) || [];
          if (completedSets.length === 0) return null;

          const rankInfo = ex.rank ? RANKS.find(r => r.name === ex.rank) : null;

          return (
            <motion.div
              key={`${ex.exercise_id || exIdx}-${ex.rank || "pending"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + exIdx * 0.04, type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
              style={ex.color ? { borderLeftWidth: "3px", borderLeftColor: ex.color } : {}}
            >
              {/* Exercise header with rank badge */}
              <div className="px-4 py-3 border-b border-border/60 flex items-center gap-3">
                {rankInfo ? (
                  <div
                    className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                    style={{ backgroundColor: rankInfo.color, color: rankInfo.textColor }}
                  >
                    {rankInfo.label[0]}
                  </div>
                ) : (
                  <div className={`w-7 h-7 flex-shrink-0 rounded-full bg-secondary ${loading ? "animate-pulse" : ""}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{ex.exercise_name}</p>
                  {rankInfo ? (
                    <p className="text-xs text-muted-foreground">
                      {rankInfo.label}
                      {ex.impressiveness_score > 0 && ` · score ${ex.impressiveness_score.toFixed(2)}`}
                      {ex.is_personal_best && " · 🏆 PR"}
                    </p>
                  ) : !loading ? (
                    <p className="text-xs text-muted-foreground">No rank data</p>
                  ) : null}
                </div>
              </div>

              {/* Sets table */}
              <div className="px-4 py-2">
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
                  const color =
                    set.type === "warmup" ? "text-amber-500" :
                    set.type === "failure" ? "text-destructive" :
                    set.type === "dropset" ? "text-purple-400" :
                    "text-muted-foreground";
                  return (
                    <div key={sIdx} className="grid grid-cols-4 gap-2 py-1.5 border-t border-border/50">
                      <span className={`text-xs font-bold ${color}`}>{label}</span>
                      <span className="text-xs text-center">
                        {set.weight ? `${toDisplay(set.weight)} ${weightUnit}` : "—"}
                      </span>
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