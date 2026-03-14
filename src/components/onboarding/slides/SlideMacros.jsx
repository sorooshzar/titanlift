import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUSTMENTS = {
  build_muscle: +300,
  improve_strength: +200,
  lose_fat: -400,
  maintain: 0,
  improve_endurance: -100,
  general_fitness: 0,
};

const TIMELINES = [
  { id: "4", label: "4 weeks", weeks: 4 },
  { id: "8", label: "8 weeks", weeks: 8 },
  { id: "12", label: "12 weeks", weeks: 12 },
  { id: "16", label: "16 weeks", weeks: 16 },
  { id: "24", label: "6 months", weeks: 24 },
  { id: "52", label: "1 year", weeks: 52 },
];

function calcMacros(answers) {
  const { sex, age, height_cm, weight_kg, activity_level, goal } = answers;
  if (!sex || !age || !height_cm || !weight_kg) return null;

  let bmr;
  if (sex === "male") {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activity_level] || 1.375;
  const tdee = Math.round(bmr * multiplier);
  const adjustment = GOAL_ADJUSTMENTS[goal] || 0;
  const calories = tdee + adjustment;

  const protein = Math.round((calories * 0.30) / 4);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories * 0.45) / 4);

  return { calories, protein, fat, carbs, tdee };
}

function calcTimelineAdvice(answers) {
  if (!answers.goal_weight_kg || !answers.weight_kg || !answers.goal_timeline_weeks) return null;
  const diffKg = answers.goal_weight_kg - answers.weight_kg;
  const weeks = parseInt(answers.goal_timeline_weeks);
  if (!weeks || diffKg === 0) return null;

  // ~7700 kcal per kg of fat
  const totalCalDiff = diffKg * 7700;
  const dailyAdjust = Math.round(totalCalDiff / (weeks * 7));

  const isImperial = answers.weight_unit === "lbs";
  const diffDisplay = isImperial
    ? `${(Math.abs(diffKg) * 2.20462).toFixed(1)} lbs`
    : `${Math.abs(diffKg).toFixed(1)} kg`;
  const goalDisplay = isImperial
    ? `${(answers.goal_weight_kg * 2.20462).toFixed(1)} lbs`
    : `${answers.goal_weight_kg} kg`;

  return {
    dailyAdjust,
    direction: diffKg > 0 ? "surplus" : "deficit",
    diffDisplay,
    goalDisplay,
    weeks,
  };
}

export default function SlideMacros({ answers, updateMany, onNext }) {
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [showTimeline, setShowTimeline] = useState(false);

  const calculated = calcMacros(answers);
  const hasGoalWeight = !!answers.goal_weight_kg && (answers.goal === "lose_fat" || answers.goal === "build_muscle");
  const timelineAdvice = calcTimelineAdvice(answers);

  // Adjust calculated calories based on timeline if set
  const timelineCalories = calculated && timelineAdvice
    ? calculated.tdee + timelineAdvice.dailyAdjust
    : null;

  useEffect(() => {
    if (calculated && !answers.daily_calories) {
      updateMany({
        daily_calories: timelineCalories || calculated.calories,
        daily_protein: calculated.protein,
        daily_carbs: calculated.carbs,
        daily_fat: calculated.fat,
      });
    }
  }, []);

  const handleAccept = () => {
    const finalCalories = timelineCalories || calculated?.calories || answers.daily_calories;
    if (calculated) {
      const ratio = finalCalories / calculated.calories;
      updateMany({
        daily_calories: finalCalories,
        daily_protein: Math.round(calculated.protein * ratio),
        daily_carbs: Math.round(calculated.carbs * ratio),
        daily_fat: Math.round(calculated.fat * ratio),
      });
    }
    setEditing(false);
    onNext?.();
  };

  const handleSaveCustom = () => {
    updateMany({
      daily_calories: parseInt(custom.calories) || answers.daily_calories,
      daily_protein: parseInt(custom.protein) || answers.daily_protein,
      daily_carbs: parseInt(custom.carbs) || answers.daily_carbs,
      daily_fat: parseInt(custom.fat) || answers.daily_fat,
    });
    setEditing(false);
  };

  if (answers.nutrition_tracking === "none") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center">
        <span className="text-6xl mb-6">🙅</span>
        <h2 className="text-2xl font-black mb-2">Skipping nutrition</h2>
        <p className="text-muted-foreground text-sm">You can always enable tracking later in settings.</p>
      </div>
    );
  }

  if (!calculated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center">
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold mb-2">Missing info</h2>
        <p className="text-muted-foreground text-sm">Go back and fill in your age, height, and weight to calculate macros.</p>
      </div>
    );
  }

  const finalCalories = timelineCalories || calculated.calories;
  const display = answers.daily_calories ? {
    calories: finalCalories,
    protein: calculated.protein,
    carbs: calculated.carbs,
    fat: calculated.fat,
  } : { calories: finalCalories, ...calculated };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Step 8</p>
        <h2 className="text-3xl font-black mb-1">Your macro targets 🧮</h2>
        <p className="text-muted-foreground text-sm mb-2">Calculated using Mifflin-St Jeor + your goal.</p>
        <p className="text-xs text-muted-foreground mb-4">TDEE: <span className="font-semibold text-foreground">{calculated.tdee} kcal</span></p>
      </motion.div>

      {/* Timeline selector — only if goal weight was set */}
      {hasGoalWeight && !editing && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button
            onClick={() => setShowTimeline(v => !v)}
            className="w-full flex items-center justify-between bg-secondary rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            <span>⏱ Goal timeline</span>
            <span className="text-primary text-xs">
              {answers.goal_timeline_weeks ? `${answers.goal_timeline_weeks} weeks` : "Set timeline"} {showTimeline ? "▲" : "▼"}
            </span>
          </button>
          {showTimeline && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {TIMELINES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { updateMany({ goal_timeline_weeks: t.weeks }); setShowTimeline(false); }}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    answers.goal_timeline_weeks === t.weeks
                      ? "bg-primary text-white"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Timeline advice banner */}
      {timelineAdvice && !editing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 rounded-2xl px-4 py-3 border text-sm ${
            timelineAdvice.direction === "deficit"
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
              : "bg-green-500/10 border-green-500/30 text-green-400"
          }`}
        >
          <p className="font-bold mb-0.5">
            {timelineAdvice.direction === "deficit" ? "🔥 Fat loss plan" : "💪 Muscle gain plan"}
          </p>
          <p className="text-xs opacity-90">
            To reach {timelineAdvice.goalDisplay} in {timelineAdvice.weeks} weeks, you need a daily{" "}
            <strong>{timelineAdvice.direction}</strong> of{" "}
            <strong>{Math.abs(timelineAdvice.dailyAdjust)} kcal</strong>.
          </p>
        </motion.div>
      )}

      {!editing ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="bg-primary/10 rounded-3xl p-6 text-center border border-primary/20">
            <p className="text-5xl font-black text-primary">{display.calories}</p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Daily Calories</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", value: display.protein, unit: "g", color: "#ef4444", emoji: "🥩" },
              { label: "Carbs",   value: display.carbs,   unit: "g", color: "#eab308", emoji: "🍚" },
              { label: "Fat",     value: display.fat,     unit: "g", color: "#3b82f6", emoji: "🥑" },
            ].map(m => (
              <div key={m.label} className="rounded-2xl p-4 text-center" style={{ background: m.color + "18", border: `1px solid ${m.color}33` }}>
                <p className="text-lg mb-1">{m.emoji}</p>
                <p className="text-xl font-black" style={{ color: m.color }}>{m.value}g</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleAccept} className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold">
              ✓ Accept
            </button>
            <button
              onClick={() => {
                setCustom({ calories: display.calories, protein: display.protein, carbs: display.carbs, fat: display.fat });
                setEditing(true);
              }}
              className="flex-1 h-12 rounded-2xl bg-secondary font-semibold text-sm"
            >
              ✏️ Customize
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {[
            { key: "calories", label: "Calories (kcal)" },
            { key: "protein",  label: "Protein (g)" },
            { key: "carbs",    label: "Carbs (g)" },
            { key: "fat",      label: "Fat (g)" },
          ].map(f => (
            <div key={f.key}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{f.label}</p>
              <input
                type="number"
                value={custom[f.key]}
                onChange={e => setCustom(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full h-12 rounded-xl bg-secondary px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}
          <button onClick={handleSaveCustom} className="w-full h-12 rounded-2xl bg-primary text-white font-bold mt-2">
            Save Custom
          </button>
        </motion.div>
      )}
    </div>
  );
}