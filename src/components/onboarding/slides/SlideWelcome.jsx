import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Zap, BarChart2, Apple, Moon, Sun } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SlideWelcome({ onNext, onLoginRequested }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("gym-dark-mode");
    return saved === null ? true : saved === "true";
  });

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("gym-dark-mode", String(next));
    document.documentElement.classList.toggle("dark", next);
    window.dispatchEvent(new Event("darkModeChanged"));
  };

  const handleLogin = () => {
    if (onLoginRequested) {
      onLoginRequested();
    } else {
      base44.auth.redirectToLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 shadow-2xl shadow-primary/20"
      >
        <Dumbbell className="w-12 h-12 text-primary" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="text-4xl font-black mb-3 leading-tight">
          Welcome to<br />
          <span className="text-primary">IronLog</span> 💪
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-xs mx-auto">
          Track workouts, nutrition, and health progress all in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs space-y-3 mb-10"
      >
        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 text-left">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium">Smart workout tracking</span>
        </div>
        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 text-left">
          <BarChart2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium">Muscle rank progression</span>
        </div>
        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3 text-left">
          <Apple className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium">Macro & nutrition tracking</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full max-w-xs space-y-3"
      >
        <button
          onClick={onNext}
          className="w-full h-14 rounded-2xl bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          Get Started 🚀
        </button>
        <button
          onClick={handleLogin}
          className="w-full h-12 rounded-2xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          Already have an account? Log In
        </button>

        {/* Dark mode toggle — fixed layout */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <Sun className="w-3.5 h-3.5 text-muted-foreground" />
          <button
            onClick={toggleDark}
            className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${darkMode ? "bg-primary" : "bg-muted"}`}
            style={{ width: 44, height: 24 }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              style={{ left: 4, transform: darkMode ? "translateX(20px)" : "translateX(0px)" }}
            />
          </button>
          <Moon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">Takes about 2 minutes to set up</p>
      </motion.div>
    </div>
  );
}