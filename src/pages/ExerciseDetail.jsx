import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

export default function ExerciseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const [tab, setTab] = useState("learn");
  const [graphMode, setGraphMode] = useState("volume"); // volume | reps | maxWeight | e1rm
  const { unit: weightUnit, toDisplay } = useWeightUnit();

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });
  
  const exercise = exercises.find((e) => e.id === id);

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });

  // Calculate all graph data for this exercise
  const allChartData = [];
  workoutLogs.forEach((log) => {
    log.exercises?.forEach((ex) => {
      if (ex.exercise_id === id) {
        let volumeKg = 0, maxReps = 0, maxWeightKg = 0;
        ex.sets?.forEach((s) => {
          if (s.completed) {
            volumeKg += (s.weight || 0) * (s.reps || 0);
            if ((s.reps || 0) > maxReps) maxReps = s.reps || 0;
            if ((s.weight || 0) > maxWeightKg) maxWeightKg = s.weight || 0;
          }
        });
        const e1rmKg = maxWeightKg > 0 && maxReps > 0 ? maxWeightKg * (1 + maxReps / 30) : 0;
        if (volumeKg > 0 || maxReps > 0) {
          allChartData.push({
            date: format(new Date(log.started_at || log.created_date), "MMM d"),
            volume: Math.round(toDisplay(volumeKg) || 0),
            reps: maxReps,
            maxWeight: Math.round(toDisplay(maxWeightKg) || 0),
            e1rm: Math.round(toDisplay(e1rmKg) || 0),
          });
        }
      }
    });
  });
  const graphMetrics = {
    volume: { key: "volume", label: `Volume (${weightUnit})`, color: "hsl(var(--primary))" },
    reps: { key: "reps", label: "Max Reps", color: "#22c55e" },
    maxWeight: { key: "maxWeight", label: `Max Weight (${weightUnit})`, color: "#f59e0b" },
    e1rm: { key: "e1rm", label: `Est. 1RM (${weightUnit})`, color: "#8b5cf6" },
  };

  if (!exercise) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Link to={createPageUrl("Exercises")}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-center text-muted-foreground mt-12">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl("Exercises")}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {exercise.muscle_group?.replace(/_/g, " ")} • {exercise.category}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "learn" ? "default" : "secondary"}
          size="sm"
          onClick={() => setTab("learn")}
          className="rounded-full gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Learn
        </Button>
        <Button
          variant={tab === "stats" ? "default" : "secondary"}
          size="sm"
          onClick={() => setTab("stats")}
          className="rounded-full gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Stats
        </Button>
      </div>

      {/* Content */}
      {tab === "learn" && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          {exercise.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.description}
              </p>
            </div>
          )}
          {exercise.instructions && (
            <div>
              <h3 className="text-sm font-semibold mb-2">How to Perform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {exercise.instructions}
              </p>
            </div>
          )}
          {exercise.secondary_muscles?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Secondary Muscles</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.secondary_muscles.map((m) => (
                  <span key={m} className="text-xs bg-secondary px-2.5 py-1 rounded-full capitalize">
                    {m.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!exercise.description && !exercise.instructions && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No instructions available yet.
            </p>
          )}
        </div>
      )}

      {tab === "stats" && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          {/* Graph mode selector */}
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(graphMetrics).map(([k, m]) => (
              <button
                key={k}
                onClick={() => setGraphMode(k)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                  graphMode === k
                    ? "text-white border-transparent"
                    : "bg-secondary text-muted-foreground border-transparent"
                }`}
                style={graphMode === k ? { backgroundColor: m.color } : {}}
              >
                {k === "e1rm" ? "Est. 1RM" : k === "maxWeight" ? "Max Weight" : k === "reps" ? "Reps" : "Volume"}
              </button>
            ))}
          </div>

          {allChartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={allChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(v) => [`${v}`, graphMetrics[graphMode].label]}
                  />
                  <Line
                    type="monotone"
                    dataKey={graphMetrics[graphMode].key}
                    stroke={graphMetrics[graphMode].color}
                    strokeWidth={2}
                    dot={{ fill: graphMetrics[graphMode].color, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No workout data yet. Start training!
            </p>
          )}
        </div>
      )}
    </div>
  );
}