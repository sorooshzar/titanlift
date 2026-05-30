import React from "react";

export const ALL_MEDALS = [
  { id: "protein_100", title: "Protein 100", description: "Hit 100g protein in a day", category: "nutrition" },
  { id: "protein_150", title: "Protein 150", description: "Hit 150g protein in a day", category: "nutrition" },
  { id: "protein_200", title: "Protein 200", description: "Hit 200g protein in a day", category: "nutrition" },
  { id: "streak_7",    title: "Week Warrior", description: "Complete a 7-day workout streak", category: "consistency" },
  { id: "streak_30",   title: "Iron Month", description: "Complete a 30-day workout streak", category: "consistency" },
  { id: "bench_135",   title: "Bench 135", description: "Bench press 135 lbs", category: "strength" },
  { id: "bench_185",   title: "Bench 185", description: "Bench press 185 lbs", category: "strength" },
  { id: "bench_225",   title: "Bench 225", description: "Bench press 225 lbs (2 plate)", category: "strength" },
  { id: "bench_315",   title: "Bench 315", description: "Bench press 315 lbs (3 plate)", category: "strength" },
  { id: "squat_225",   title: "Squat 225", description: "Squat 225 lbs", category: "strength" },
  { id: "squat_315",   title: "Squat 315", description: "Squat 315 lbs (3 plate)", category: "strength" },
  { id: "dead_315",    title: "Deadlift 315", description: "Deadlift 315 lbs", category: "strength" },
  { id: "dead_405",    title: "Deadlift 405", description: "Deadlift 405 lbs (4 plate)", category: "strength" },
  { id: "cardio_30",   title: "Cardio 30", description: "Complete a 30 min cardio session", category: "cardio" },
  { id: "cardio_60",   title: "Cardio Hour", description: "Complete a 1 hour cardio session", category: "cardio" },
  { id: "cardio_120",  title: "Cardio 2hr", description: "Complete a 2 hour cardio session", category: "cardio" },
  { id: "steps_10k",   title: "10K Steps", description: "Complete 10,000 steps in a day", category: "cardio" },
  { id: "steps_20k",   title: "20K Steps", description: "Complete 20,000 steps in a day", category: "cardio" },
  { id: "workouts_5",  title: "5 in a Week", description: "Complete 5 workouts in a week", category: "consistency" },
  { id: "workouts_10", title: "10 in a Week", description: "Complete 10 workouts in a week", category: "consistency" },
];

function MedalTile({ medal, unlocked = false }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
      unlocked
        ? "bg-card border-primary/30"
        : "bg-secondary/40 border-border/40 opacity-60"
    }`}>
      {/* Medal icon placeholder */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
        unlocked ? "bg-primary/15" : "bg-muted/60"
      }`}>
        <span className={unlocked ? "opacity-100" : "opacity-30"}>🏅</span>
      </div>
      <p className={`text-[10px] font-semibold text-center leading-tight ${
        unlocked ? "text-foreground" : "text-muted-foreground"
      }`}>
        {medal.title}
      </p>
    </div>
  );
}

export default function MedalsBook({ unlockedIds = [] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Medal Collection</p>
      <div className="grid grid-cols-4 gap-2">
        {ALL_MEDALS.map(medal => (
          <MedalTile
            key={medal.id}
            medal={medal}
            unlocked={unlockedIds.includes(medal.id)}
          />
        ))}
      </div>
    </div>
  );
}