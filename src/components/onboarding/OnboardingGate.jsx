import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "./OnboardingFlow";
import AuthScreen from "./AuthScreen";
import { initUserStorage, userStorage } from "@/components/utils/userStorage";
import { applyTheme } from "@/components/profile/SettingsPanel";

/**
 * Single auth-gated state machine:
 *   loading → check auth
 *   unauthenticated → show AuthScreen
 *   authenticated + no onboarding → show OnboardingFlow
 *   authenticated + onboarding done → render app (children)
 */
export default function OnboardingGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | auth | onboarding | app

  const checkState = async () => {
    setStatus("loading");
    try {
      const user = await base44.auth.me();
      initUserStorage(user.id);
      const savedTheme = userStorage.getItem("gym-theme");
      if (savedTheme) applyTheme(savedTheme);

      if (user.onboarding_completed) {
        setStatus("app");
      } else {
        setStatus("onboarding");
      }
    } catch {
      setStatus("auth");
    }
  };

  useEffect(() => {
    checkState();
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "auth") {
    return <AuthScreen onAuthenticated={checkState} />;
  }

  if (status === "onboarding") {
    return <OnboardingFlow onComplete={() => setStatus("app")} />;
  }

  return <>{children}</>;
}