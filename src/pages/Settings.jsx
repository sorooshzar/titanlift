import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("gym-dark-mode");
    setDarkMode(saved === null ? true : saved === "true");
  }, []);

  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem("gym-dark-mode", String(enabled));
    document.documentElement.classList.toggle("dark", enabled);
    window.dispatchEvent(new Event("darkModeChanged"));
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-3">
        {/* Dark Mode */}
        <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-semibold">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                {darkMode ? "On" : "Off"}
              </p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </div>
    </div>
  );
}