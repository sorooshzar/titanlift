import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { initUserStorage, userStorage } from "@/components/utils/userStorage";

import SlideWelcome from "./slides/SlideWelcome";
import SlideGoal from "./slides/SlideGoal";
import SlideExperience from "./slides/SlideExperience";
import SlideBio from "./slides/SlideBio";
import SlideUnits from "./slides/SlideUnits";
import SlideMeasurements from "./slides/SlideMeasurements";
import SlideActivity from "./slides/SlideActivity";
import SlideFrequency from "./slides/SlideFrequency";
import SlideNutrition from "./slides/SlideNutrition";
import SlideMacros from "./slides/SlideMacros";
import SlideWeekStart from "./slides/SlideWeekStart";
import SlideWorkoutStyle from "./slides/SlideWorkoutStyle";
import SlideSummary from "./slides/SlideSummary";

// Note: SlideAccount removed — auth happens BEFORE onboarding in OnboardingGate
const SLIDES = [
  { id: "welcome",      component: SlideWelcome,      title: "Welcome" },
  { id: "goal",         component: SlideGoal,          title: "Your Goal" },
  { id: "experience",   component: SlideExperience,    title: "Experience" },
  { id: "bio",          component: SlideBio,           title: "About You" },
  { id: "units",        component: SlideUnits,         title: "Units" },
  { id: "measurements", component: SlideMeasurements,  title: "Body Stats" },
  { id: "activity",     component: SlideActivity,      title: "Activity Level" },
  { id: "frequency",    component: SlideFrequency,     title: "Training Days" },
  { id: "nutrition",    component: SlideNutrition,     title: "Nutrition" },
  { id: "macros",       component: SlideMacros,        title: "Macros" },
  { id: "weekstart",    component: SlideWeekStart,     title: "Week Start" },
  { id: "workoutstyle", component: SlideWorkoutStyle,  title: "Workout Style" },
  { id: "summary",      component: SlideSummary,       title: "All Set!" },
];

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState({
    goal: null,
    goal_weight_kg: null,
    goal_timeline_weeks: null,
    experience_level: null,
    sex: null,
    age: null,
    height_cm: null,
    weight_kg: null,
    body_fat_pct: null,
    activity_level: null,
    workout_days_per_week: null,
    nutrition_tracking: null,
    daily_calories: null,
    daily_protein: null,
    daily_carbs: null,
    daily_fat: null,
    weight_unit: "kg",
    distance_unit: "km",
    length_unit: "cm",
    week_start: "monday",
    workout_style: null,
  });

  const slide = SLIDES[step];
  const SlideComponent = slide.component;
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  const update = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }));
  const updateMany = (obj) => setAnswers(prev => ({ ...prev, ...obj }));

  const goNext = () => {
    if (step < SLIDES.length - 1) { setDirection(1); setStep(s => s + 1); }
  };
  const goBack = () => {
    if (step > 0) { setDirection(-1); setStep(s => s - 1); }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      initUserStorage(user.id);

      await base44.auth.updateMe({
        onboarding_completed: true,
        goal: answers.goal,
        goal_weight_kg: answers.goal_weight_kg,
        goal_timeline_weeks: answers.goal_timeline_weeks,
        experience_level: answers.experience_level,
        sex: answers.sex,
        age: answers.age,
        height_cm: answers.height_cm,
        weight_kg: answers.weight_kg,
        body_fat_pct: answers.body_fat_pct,
        activity_level: answers.activity_level,
        workout_days_per_week: answers.workout_days_per_week,
        nutrition_tracking: answers.nutrition_tracking,
        daily_calories: answers.daily_calories,
        daily_protein: answers.daily_protein,
        daily_carbs: answers.daily_carbs,
        daily_fat: answers.daily_fat,
        weight_unit: answers.weight_unit,
        week_start: answers.week_start,
        workout_style: answers.workout_style,
      });

      // Mirror to userStorage for local reads
      if (answers.weight_unit) userStorage.setItem("gym-weight-unit", answers.weight_unit);
      if (answers.distance_unit) userStorage.setItem("gym-distance-unit", answers.distance_unit);
      if (answers.week_start) userStorage.setItem("gym-week-start", answers.week_start === "sunday" ? "0" : "1");
      if (answers.daily_calories) {
        userStorage.setItem("gym-macro-calories", String(answers.daily_calories));
        userStorage.setItem("gym-macro-protein", String(answers.daily_protein || 0));
        userStorage.setItem("gym-macro-carbs", String(answers.daily_carbs || 0));
        userStorage.setItem("gym-macro-fat", String(answers.daily_fat || 0));
      }
      if (answers.goal_weight_kg) userStorage.setItem("gym-goal-weight", String(answers.goal_weight_kg));
      if (answers.goal_timeline_weeks) userStorage.setItem("gym-goal-weeks", String(answers.goal_timeline_weeks));

      // Create initial body records
      if (answers.weight_kg) {
        await base44.entities.BodyWeight.create({
          weight: answers.weight_kg, unit: "kg", date: new Date().toISOString().split("T")[0],
        });
      }
      if (answers.height_cm) {
        await base44.entities.BodyMeasurement.create({
          body_part: "Height", value: answers.height_cm, unit: "cm", date: new Date().toISOString().split("T")[0],
        });
      }

      onComplete();
    } catch (e) {
      console.error("Onboarding save failed:", e);
      setSaving(false);
    }
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  const progressSteps = SLIDES.length - 1;
  const progressPct = step === 0 ? 0 : (step / progressSteps) * 100;
  const hideNav = isFirst || isLast;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Progress bar */}
      {!isFirst && (
        <div className="h-1 bg-secondary w-full shrink-0">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            <SlideComponent
              answers={answers}
              update={update}
              updateMany={updateMany}
              onNext={goNext}
              onFinish={isLast ? handleFinish : undefined}
              saving={saving}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      {!hideNav && (
        <div className="shrink-0 px-6 pb-8 pt-3 flex items-center justify-between gap-3 border-t border-border/30 bg-background/95 backdrop-blur">
          <button
            onClick={goBack}
            className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1.5">
            {SLIDES.slice(1, -1).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step - 1 ? "20px" : "6px",
                  height: "6px",
                  background: i <= step - 1 ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                  opacity: i <= step - 1 ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}