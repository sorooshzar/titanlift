import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function ExerciseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const [tab, setTab] = useState("learn");

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });
  
  const exercise = exercises.find((e) => e.id === id);

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });

  // Calculate volume over time for this exercise
  const volumeData = [];
  workoutLogs.forEach((log) => {
    log.exercises?.forEach((ex) => {
      if (ex.exercise_id === id) {
        let volume = 0;
        ex.sets?.forEach((s) => {
          if (s.completed) volume += (s.weight || 0) * (s.reps || 0);
        });
        if (volume > 0) {
          volumeData.push({
            date: format(new Date(log.started_at || log.created_date), "MMM d"),
            volume,
          });
        }
      }
    });
  });

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
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Volume Over Time</h3>
          {volumeData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value) => [`${value} kg`, "Volume"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
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