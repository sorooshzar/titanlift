import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import OnboardingFlow from "./OnboardingFlow";

export default function OnboardingGate({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "show_onboarding" | "done"

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (false && user?.onboarding_completed) {
          setStatus("done");
        } else {
          setStatus("show_onboarding");
        }
      })
      .catch(() => setStatus("done")); // if not logged in, let auth handle it
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