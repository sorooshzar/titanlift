import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Trash2, Flame } from "lucide-react";

export default function SetTable({ sets = [], onChange, isActive = false }) {
  const updateSet = (index, field, value) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addSet = (type = "working") => {
    const lastSet = sets.filter(s => s.type === "working").slice(-1)[0];
    onChange([
      ...sets,
      {
        type,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        rir: lastSet?.rir || 2,
        completed: false,
      },
    ]);
  };

  const removeSet = (index) => {
    onChange(sets.filter((_, i) => i !== index));
  };

  const toggleComplete = (index) => {
    updateSet(index, "completed", !sets[index].completed);
  };

  let setCounter = 0;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[36px_40px_1fr_1fr_1fr_36px] gap-1 px-1 items-center">
        {isActive && <div />}
        <span className="text-[10px] font-semibold text-muted-foreground text-center">SET</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">KG</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">REPS</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">RIR</span>
        {!isActive && <div />}
      </div>

      {/* Sets */}
      {sets.map((set, index) => {
        const isWarmup = set.type === "warmup";
        if (!isWarmup) setCounter++;
        const displayNum = isWarmup ? "W" : setCounter;

        return (
          <div
            key={index}
            className={`grid grid-cols-[36px_40px_1fr_1fr_1fr_36px] gap-1 px-1 items-center rounded-lg ${
              set.completed ? "bg-primary/5" : ""
            }`}
          >
            {isActive && (
              <button
                onClick={() => toggleComplete(index)}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                  set.completed
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            
            <div className="flex items-center justify-center">
              <span className={`text-xs font-bold ${isWarmup ? "text-amber-500" : "text-muted-foreground"}`}>
                {displayNum}
              </span>
            </div>

            <Input
              type="number"
              value={set.weight || ""}
              onChange={(e) => updateSet(index, "weight", parseFloat(e.target.value) || 0)}
              className="h-8 text-center text-sm bg-secondary border-0 rounded-lg"
              placeholder="0"
            />
            <Input
              type="number"
              value={set.reps || ""}
              onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}
              className="h-8 text-center text-sm bg-secondary border-0 rounded-lg"
              placeholder="0"
            />
            <Input
              type="number"
              value={set.rir ?? ""}
              onChange={(e) => updateSet(index, "rir", parseInt(e.target.value) || 0)}
              className="h-8 text-center text-sm bg-secondary border-0 rounded-lg"
              placeholder="0"
            />

            {!isActive && (
              <button
                onClick={() => removeSet(index)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add Set Buttons */}
      <div className="flex gap-2 pt-1 px-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 text-muted-foreground"
          onClick={() => addSet("working")}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Set
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 text-amber-500"
          onClick={() => addSet("warmup")}
        >
          <Flame className="w-3 h-3 mr-1" /> Warm-up
        </Button>
      </div>
    </div>
  );
}