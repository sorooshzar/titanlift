import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";

// Quick-select presets in seconds
const PRESETS = [30, 60, 90, 120, 150, 180, 240, 300];

function fmt(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

/**
 * Inline collapsible rest-duration editor shown below each exercise's sets.
 * Props:
 *   open: bool
 *   sets: array of set objects (each has rest_duration)
 *   onChange(newSets): called when any rest duration changes
 *   defaultDuration: number (fallback from settings)
 */
export default function RestDurationPicker({ open, sets, onChange, defaultDuration = 90 }) {
  const updateRest = (index, val) => {
    const updated = sets.map((s, i) => i === index ? { ...s, rest_duration: val } : s);
    onChange(updated);
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="px-3 pt-1 pb-3 space-y-2 bg-secondary/30 rounded-b-xl">
            <div className="flex items-center gap-1.5 pt-2 pb-1">
              <Timer className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Rest Durations</span>
            </div>

            {sets.map((set, i) => {
              const current = set.rest_duration ?? defaultDuration;
              const label = set.type === "warmup" ? "W" : set.type === "failure" ? "F" : set.type === "dropset" ? "D" : `${i + 1}`;
              const labelColor =
                set.type === "warmup"  ? "text-amber-500" :
                set.type === "failure" ? "text-destructive" :
                set.type === "dropset" ? "text-purple-400" :
                "text-muted-foreground";

              return (
                <div key={i} className="flex items-center gap-2">
                  {/* Set label */}
                  <span className={`text-xs font-bold w-5 text-center shrink-0 ${labelColor}`}>{label}</span>

                  {/* Preset chips */}
                  <div className="flex gap-1 flex-wrap flex-1">
                    {PRESETS.map(p => (
                      <button
                        key={p}
                        onClick={() => updateRest(i, p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-90 ${
                          current === p
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {fmt(p)}
                      </button>
                    ))}
                  </div>

                  {/* Current value display */}
                  <span className="text-xs font-black text-foreground w-10 text-right shrink-0">{fmt(current)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}