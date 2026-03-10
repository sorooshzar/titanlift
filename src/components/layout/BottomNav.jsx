import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Dumbbell, Library, Settings, Plus, X, Zap, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const currentPage = location.pathname.split('/').pop() || 'Profile';

  const tabs = [
    { name: "Profile", icon: User, page: "Profile" },
    { name: "Workouts", icon: Dumbbell, page: "Workouts" },
    { name: "plus", icon: Plus, page: null },
    { name: "Exercises", icon: Library, page: "Exercises" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ];

  const isActive = (page) => currentPage === page;

  return (
    <>
      {/* Quick Action Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to={createPageUrl("ActiveWorkout")}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/30 min-w-[200px] justify-center"
              >
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Start Workout</span>
              </Link>
              <Link
                to={createPageUrl("LogWeight")}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 bg-card text-foreground px-6 py-3.5 rounded-2xl shadow-lg border border-border min-w-[200px] justify-center"
              >
                <Scale className="w-5 h-5" />
                <span className="font-semibold">Track Weight</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            if (tab.name === "plus") {
              return (
                <button
                  key="plus"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="relative -mt-6"
                >
                  <motion.div
                    animate={{ rotate: menuOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
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
              <Link
                key={tab.name}
                to={createPageUrl(tab.page)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}