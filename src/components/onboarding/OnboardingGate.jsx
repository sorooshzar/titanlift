import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "./OnboardingFlow";
import { initUserStorage, userStorage } from "@/components/utils/userStorage";
import { applyTheme } from "@/components/profile/SettingsPanel";

// Key used to persist onboarding answers across OAuth redirect
const PENDING_KEY = "gym-pending-onboarding";

async function savePendingOnboarding(user) {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return false;
  const answers = JSON.parse(raw);
  try {
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

    // Persist settings to user-scoped localStorage
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

    localStorage.removeItem(PENDING_KEY);
    return true;
  } catch (e) {
    console.error("Failed to save pending onboarding:", e);
    return false;
  }
}

export default function OnboardingGate({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    base44.auth.me()
      .then(async user => {
        // Initialize user-scoped storage as soon as we know who this is
        initUserStorage(user.id);

        // Re-apply this user's saved theme
        const savedTheme = userStorage.getItem("gym-theme");
        if (savedTheme) applyTheme(savedTheme);

        if (user?.onboarding_completed) {
          setStatus("done");
          return;
        }
        // User is authenticated but onboarding not complete — check for pending data
        const hasPending = !!localStorage.getItem(PENDING_KEY);
        if (hasPending) {
          await savePendingOnboarding(user);
          setStatus("done");
        } else {
          setStatus("show_onboarding");
        }
      })
      .catch(() => {
        // Not authenticated — redirect to login
        base44.auth.redirectToLogin();
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "show_onboarding") {
    return <OnboardingFlow onComplete={() => setStatus("done")} />;
  }

  return <>{children}</>;
}

export { PENDING_KEY };