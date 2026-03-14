import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
import SlideAccount from "./slides/SlideAccount";

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
  { id: "account",      component: SlideAccount,       title: "Create Account" },
];

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
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
  const isLast = step === SLIDES.length - 1;
  const isFirst = step === 0;
  const isSummary = slide.id === "summary";

  const update = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }));
  const updateMany = (obj) => setAnswers(prev => ({ ...prev, ...obj }));

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      localStorage.setItem("gym-weight-unit", answers.weight_unit);
      localStorage.setItem("gym-distance-unit", answers.distance_unit);
      localStorage.setItem("gym-length-unit", answers.length_unit);
      const weekStartVal = answers.week_start === "sunday" ? "0" : "1";
      localStorage.setItem("gym-week-start", weekStartVal);

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

      if (answers.weight_kg) {
        await base44.entities.BodyWeight.create({
          weight: answers.weight_kg,
          unit: "kg",
          date: new Date().toISOString().split("T")[0],
        });
      }

      if (answers.height_cm) {
        await base44.entities.BodyMeasurement.create({
          body_part: "Height",
          value: answers.height_cm,
          unit: "cm",
          date: new Date().toISOString().split("T")[0],
        });
      }

      if (answers.daily_calories) {
        localStorage.setItem("gym-macro-calories", String(answers.daily_calories));
        localStorage.setItem("gym-macro-protein", String(answers.daily_protein || 0));
        localStorage.setItem("gym-macro-carbs", String(answers.daily_carbs || 0));
        localStorage.setItem("gym-macro-fat", String(answers.daily_fat || 0));
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
    onComplete();
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  const progressSteps = SLIDES.length - 1;
  const progressCurrent = Math.max(0, step - 1);
  const progressPct = step === 0 ? 0 : (progressCurrent / progressSteps) * 100;

  // Hide bottom nav on welcome, summary, and account slides
  const hideNav = isFirst || isSummary || isLast;

  // Login overlay — shown when user taps "Already have an account"
  if (showLogin) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col px-6 py-10">
        <button
          onClick={() => setShowLogin(false)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-8 self-start"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-black mb-2">Welcome back 👋</h1>
        <p className="text-muted-foreground text-sm mb-8">Sign in to access your IronLog data.</p>
        <div className="space-y-3">
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-4 font-semibold text-sm hover:bg-secondary transition-colors active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-4 font-semibold text-sm hover:bg-secondary transition-colors active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>
          <p className="text-center text-xs text-muted-foreground pt-2">
            Don't have an account?{" "}
            <button onClick={() => setShowLogin(false)} className="text-primary font-semibold">Get Started</button>
          </p>
        </div>
      </div>
    );
  }

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
              onFinish={isLast ? handleFinish : isSummary ? goNext : undefined}
              onLoginRequested={isFirst ? () => setShowLogin(true) : undefined}
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
            {SLIDES.slice(1, -2).map((_, i) => (
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