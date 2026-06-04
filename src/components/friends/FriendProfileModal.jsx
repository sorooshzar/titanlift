import React, { useState } from "react";
import { X, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_MEDALS } from "@/components/profile/MedalsBook";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

function MedalTile({ medal, unlocked }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
      unlocked
        ? "bg-card border-primary/30"
        : "bg-secondary/40 border-border/40 opacity-50"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        unlocked ? "bg-primary/15" : "bg-muted/60"
      }`}>
        <span className={unlocked ? "opacity-100" : "opacity-25"}>🏅</span>
      </div>
      <p className={`text-[9px] font-semibold text-center leading-tight ${
        unlocked ? "text-foreground" : "text-muted-foreground"
      }`}>
        {medal.title}
      </p>
    </div>
  );
}

export default function FriendProfileModal({ friend, xp, onClose, workoutLogs }) {
  const { unit: weightUnit, toDisplay } = useWeightUnit();
  const [showBodyModel, setShowBodyModel] = useState(false);
  const [showWorkoutHistory, setShowWorkoutHistory] = useState(false);
  const unlockedCount = friend.unlockedMedals?.length || 0;
  const totalCount = ALL_MEDALS.length;

  // Calculate best 1RM for squat, bench, deadlift
  const calculateBest1RM = (exerciseName) => {
    if (!workoutLogs?.length) return 0;
    const exerciseLogs = workoutLogs.flatMap(log =>
      log.exercises?.filter(e => e.exercise_name?.toLowerCase().includes(exerciseName.toLowerCase())) || []
    );
    if (!exerciseLogs.length) return 0;
    
    const maxWeight = Math.max(...exerciseLogs.flatMap(e => 
      e.sets?.map(s => s.weight || 0) || []
    ));
    return Math.round(maxWeight);
  };

  const squat1RM = calculateBest1RM("squat");
  const bench1RM = calculateBest1RM("bench");
  const deadlift1RM = calculateBest1RM("deadlift");
  const totalSBD = squat1RM + bench1RM + deadlift1RM;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card rounded-3xl border border-border/40 overflow-y-auto"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base">Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Avatar + name + action buttons */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/30 flex-shrink-0">
                <span className="text-xl font-black text-primary">
                  {friend.full_name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm">{friend.full_name || "Unknown"}</p>
                {friend.username && (
                  <p className="text-xs text-muted-foreground mt-0.5">@{friend.username}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl w-10 h-10"
                onClick={() => setShowBodyModel(true)}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl w-10 h-10"
                onClick={() => setShowWorkoutHistory(true)}
              >
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Level card */}
          <div className="bg-secondary rounded-2xl px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Level</p>
              <span className="text-xl font-black text-primary">{xp?.level ?? 1}</span>
            </div>
            <div className="h-1.5 bg-background/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min((xp?.progress || 0) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {Math.round(xp?.xpIntoLevel || 0).toLocaleString()} / {Math.round(xp?.xpNeeded || 500).toLocaleString()} XP
            </p>
          </div>

          {/* SBD Section */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: "Squat", value: squat1RM },
              { label: "Bench", value: bench1RM },
              { label: "Deadlift", value: deadlift1RM },
              { label: "Total", value: totalSBD }
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-sm font-black text-primary">{stat.value > 0 ? toDisplay(stat.value) : "--"}</p>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>



          {/* Medals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medals</p>
              <span className="text-xs font-bold text-primary">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ALL_MEDALS.map(medal => (
                <MedalTile
                  key={medal.id}
                  medal={medal}
                  unlocked={(friend.unlockedMedals || []).includes(medal.id)}
                />
              ))}
            </div>
          </div>
          </div>
          </div>

          {/* Body Model Modal */}
          {showBodyModel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowBodyModel(false)}>
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border/40 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Body Model</h3>
              <button onClick={() => setShowBodyModel(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center py-8">Body model view coming soon</p>
          </div>
          </div>
          )}

          {/* Workout History Modal */}
          {showWorkoutHistory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowWorkoutHistory(false)}>
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border/40 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Workout History</h3>
              <button onClick={() => setShowWorkoutHistory(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center py-8">Workout history view coming soon</p>
          </div>
          </div>
          )}
          </div>
          );
          }