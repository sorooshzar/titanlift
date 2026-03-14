import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Dumbbell, Plus, X, Activity, Apple } from "lucide-react";
import { motion } from "framer-motion";
import QuickActionMenu from "./QuickActionMenu";

export default function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const currentPage = location.pathname.split('/').pop() || 'Profile';

  const tabs = [
    { name: "Profile", icon: User, page: "Profile" },
    { name: "Lifts", icon: Dumbbell, page: "Lifts" },
    { name: "plus", icon: Plus, page: null },
    { name: "Cardio", icon: Activity, page: "Cardio" },
    { name: "Macros", icon: Apple, page: "Macros" },
  ];

  const isActive = (page) => {
    if (!page) return false;
    if (page === "Lifts") return ["Lifts", "Workouts", "Exercises"].includes(currentPage);
    return currentPage === page;
  };

  return (
    <>
      <QuickActionMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            if (tab.name === "plus") {
              return (
                <button key="plus" onClick={() => setMenuOpen(!menuOpen)} className="relative -mt-6">
                  <motion.div
                    animate={{ rotate: menuOpen ? 45 : 0, scale: menuOpen ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                  >
                    {menuOpen ? (
                      <X className="w-6 h-6 text-primary-foreground" />
                    ) : (
                      <Plus className="w-6 h-6 text-primary-foreground" />
                    )}
                  </motion.div>
                </button>
              );
            }

            const Icon = tab.icon;
            const active = isActive(tab.page);

            return (
              <Link key={tab.name} to={createPageUrl(tab.page)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[56px] relative">
                <Icon className={`w-5 h-5 transition-colors duration-150 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium transition-colors duration-150 ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}