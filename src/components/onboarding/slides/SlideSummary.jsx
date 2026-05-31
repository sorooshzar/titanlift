import React from "react";
import { motion } from "framer-motion";

const GOAL_LABELS = {
  build_muscle: "Build Muscle 💪",
  lose_fat: "Lose Fat 🔥",
  maintain: "Maintain Weight ⚖️",
  improve_strength: "Improve Strength 🏋️",
  improve_endurance: "Improve Endurance 🏃",
  general_fitness: "General Fitness ✨",
};

const ACTIVITY_LABELS = {
  sedentary: "Sedentary 🪑",
  lightly_active: "Lightly Active 🚶",
  moderately_active: "Moderately Active 🚴",
  very_active: "Very Active 🏃",
  athlete: "Athlete ⚡",
};

const EXP_LABELS = {
  beginner: "Beginner 🌱",
  intermediate: "Intermediate ⚡",
  advanced: "Advanced 🔥",
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

export default function SlideSummary({ answers, onFinish }) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-black mb-2">You're all set!</h2>
        <p className="text-muted-foreground text-sm">Here's your personalised profile summary.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border px-5 py-2 mb-6"
      >
        <Row label="Goal" value={GOAL_LABELS[answers.goal]} />
        <Row label="Experience" value={EXP_LABELS[answers.experience_level]} />
        <Row label="Activity" value={ACTIVITY_LABELS[answers.activity_level]} />
        <Row label="Training Days" value={answers.workout_days_per_week ? `${answers.workout_days_per_week} days/week` : null} />
        {answers.weight_kg && <Row label="Weight" value={`${answers.weight_kg} kg`} />}
        {answers.height_cm && <Row label="Height" value={`${answers.height_cm} cm`} />}
        {answers.daily_calories && <Row label="Daily Calories" value={`${answers.daily_calories} kcal`} />}
        {answers.daily_protein && <Row label="Protein" value={`${answers.daily_protein}g`} />}
        {answers.daily_carbs && <Row label="Carbs" value={`${answers.daily_carbs}g`} />}
        {answers.daily_fat && <Row label="Fat" value={`${answers.daily_fat}g`} />}
        <Row label="Units" value={answers.weight_unit === "lbs" ? "Imperial 🇺🇸" : "Metric 🇪🇺"} />
        <Row label="Week starts" value={answers.week_start === "monday" ? "Monday 💼" : "Sunday ☀️"} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onFinish}
        className="w-full h-14 rounded-2xl bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform"
      >
        Create My Account →
      </motion.button>
    </div>
  );
}