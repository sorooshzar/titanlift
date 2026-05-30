import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Link2 } from "lucide-react";
import { buildSupersetLabelMap } from "./supersetUtils";

/**
 * Modal to pick which exercises to form a superset with.
 * Props:
 *  - exercises: full list
 *  - currentIndex: the exercise initiating the superset
 *  - onConfirm(indices): called with array of indices to group
 *  - onClose()
 */
export default function SupersetPickerModal({ exercises, currentIndex, onConfirm, onClose }) {
  const [selected, setSelected] = useState(new Set([currentIndex]));
  const labelMap = buildSupersetLabelMap(exercises);

  const toggle = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (i === currentIndex) return next; // can't deselect initiator
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const canConfirm = selected.size >= 2;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-5 pb-8 space-y-4">
        {/* Handle */}
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Create Superset</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select 2+ exercises to group together</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {exercises.map((ex, i) => {
            const isSelected = selected.has(i);
            const isCurrent = i === currentIndex;
            const existingGroup = ex.superset_group;
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : "bg-secondary/50 border-border text-muted-foreground"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-primary border-primary" : "border-border"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? "text-foreground" : ""}`}>
                    {ex.exercise_name}
                  </p>
                  {existingGroup && (
                    <p className="text-[10px] text-muted-foreground">
                      Currently in Superset {labelMap[existingGroup] || ""}
                    </p>
                  )}
                </div>
                {isCurrent && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">
                    This exercise
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button
          className="w-full h-11 rounded-xl font-semibold gap-2"
          disabled={!canConfirm}
          onClick={() => onConfirm(Array.from(selected))}
        >
          <Link2 className="w-4 h-4" />
          Group as Superset ({selected.size})
        </Button>
      </div>
    </div>
  );
}