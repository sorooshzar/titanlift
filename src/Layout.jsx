import React, { useEffect, useState } from "react";
import BottomNav from "./components/layout/BottomNav";
import { ActiveWorkoutProvider, useActiveWorkout } from "./components/workout/ActiveWorkoutContext";
import ActiveWorkoutSheet from "./components/workout/ActiveWorkoutSheet";

const HIDDEN_NAV_PAGES = ["ActiveWorkout", "EditWorkout", "WorkoutHistory", "Measurements", "Settings", "ExerciseSelector"];

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("gym-dark-mode");
    const isDark = saved === null ? true : saved === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem("gym-dark-mode");
      const isDark = saved === null ? true : saved === "true";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    };
    window.addEventListener("storage", handler);
    window.addEventListener("darkModeChanged", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("darkModeChanged", handler);
    };
  }, []);

  const hideNav = HIDDEN_NAV_PAGES.includes(currentPageName);

  return (
    <ActiveWorkoutProvider>
      <InnerLayout hideNav={hideNav}>{children}</InnerLayout>
    </ActiveWorkoutProvider>
  );
}

function InnerLayout({ children, hideNav }) {
  const { minimized, workout } = useActiveWorkout();
  const showMiniBar = !!workout && minimized;

  return (
    <div className="min-h-screen bg-background">
      <div className={hideNav ? "" : showMiniBar ? "pb-36" : "pb-20"}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
      <ActiveWorkoutSheet />
    </div>
  );
}