import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Scale, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MuscleModel from "../components/profile/MuscleModel";
import WeightChart from "../components/profile/WeightChart";
import RankLegend from "../components/profile/RankLegend";

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

export default function Profile() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 100),
  });

  const { data: bodyWeights = [] } = useQuery({
    queryKey: ["bodyWeights"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 50),
  });

  // Calculate muscle ranks from workout history
  const muscleRanks = {};
  const muscleLastTrained = {};

  workoutLogs.forEach((log) => {
    log.exercises?.forEach((ex) => {
      const muscle = ex.muscle_group;
      if (!muscle) return;
      
      let volume = 0;
      ex.sets?.forEach((s) => {
        if (s.completed) volume += (s.weight || 0) * (s.reps || 0);
      });
      
      muscleRanks[muscle] = (muscleRanks[muscle] || 0) + volume;
      
      const logDate = log.finished_at || log.started_at || log.created_date;
      if (!muscleLastTrained[muscle] || new Date(logDate) > new Date(muscleLastTrained[muscle])) {
        muscleLastTrained[muscle] = logDate;
      }
    });
  });

  const muscleRankNames = {};
  Object.keys(muscleRanks).forEach((m) => {
    muscleRankNames[m] = getRankFromVolume(muscleRanks[m]);
  });

  const recoveryData = {};
  Object.keys(muscleLastTrained).forEach((m) => {
    recoveryData[m] = getRecoveryLevel(muscleLastTrained[m]);
  });

  const latestWeight = bodyWeights[0]?.weight;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user?.full_name || "Athlete"}</h1>
          <div className="flex gap-4 mt-1">
            <span className="text-sm text-muted-foreground">
              {latestWeight ? `${latestWeight} kg` : "-- kg"}
            </span>
          </div>
        </div>
      </div>

      {/* Recovery Toggle */}
      <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
        <div>
          <p className="text-sm font-semibold">Recently Trained</p>
          <p className="text-xs text-muted-foreground">Show recovery status</p>
        </div>
        <Switch checked={showRecovery} onCheckedChange={setShowRecovery} />
      </div>

      {/* Muscle Model */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <MuscleModel
          muscleRanks={muscleRankNames}
          recoveryData={recoveryData}
          showRecovery={showRecovery}
        />
        {!showRecovery && (
          <div className="mt-4">
            <RankLegend />
          </div>
        )}
        {showRecovery && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {[
              { name: "Fresh", color: "#2a2a2a" },
              { name: "Light", color: "#4a7a3a" },
              { name: "Moderate", color: "#c9a820" },
              { name: "Heavy", color: "#e06020" },
              { name: "Sore", color: "#d03030" },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-[10px] text-muted-foreground font-medium">{r.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight Progress */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Weight Progress</h2>
          <Link to={createPageUrl("LogWeight")}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Scale className="w-3.5 h-3.5" />
              Log Weight
            </Button>
          </Link>
        </div>
        <WeightChart data={bodyWeights} />
      </div>
    </div>
  );
}