import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Trash2, Flame, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getSetLabel(set, workingIndex) {
  if (set.type === "warmup") return { label: "W", color: "text-amber-500" };
  if (set.type === "failure") return { label: "F", color: "text-destructive" };
  if (set.type === "dropset") return { label: "D", color: "text-purple-400" };
  return { label: String(workingIndex), color: "text-muted-foreground" };
}

function getRowBg(set) {
  if (set.completed && set.type === "failure") return "bg-destructive/10";
  if (set.completed) return "bg-primary/5";
  if (set.type === "failure") return "bg-destructive/5";
  if (set.type === "dropset") return "bg-purple-500/5";
  return "";
}

// Grid: [prev-col] [set] [weight] [reps] [rir] [del]
const GRID = "grid-cols-[1fr_28px_56px_56px_44px_24px]";
const GRID_ACTIVE = "grid-cols-[24px_1fr_28px_52px_52px_44px_24px]";

export default function SetTable({ sets = [], onChange, isActive = false, previousSets = [] }) {
  const updateSet = (index, field, value) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addSet = (type = "working") => {
    const lastWorking = sets.filter((s) => s.type !== "warmup").slice(-1)[0];
    onChange([
      ...sets,
      { type, weight: lastWorking?.weight || 0, reps: lastWorking?.reps || 0, rir: lastWorking?.rir ?? 2, completed: false },
    ]);
  };

  const removeSet = (index) => onChange(sets.filter((_, i) => i !== index));
  const toggleComplete = (index) => updateSet(index, "completed", !sets[index].completed);

  let workingCounter = 0;

  return (
    <div className="space-y-0.5">
      {/* Header */}
      <div className={`grid gap-1 px-1 items-center mb-1 ${isActive ? GRID_ACTIVE : GRID}`}>
        {isActive && <div />}
        <span className="text-[10px] font-semibold text-muted-foreground">PREVIOUS</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">SET</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">KG</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">REPS</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">RIR</span>
        <div />
      </div>

      {sets.map((set, index) => {
        const isWorking = set.type !== "warmup";
        if (isWorking) workingCounter++;
        const { label, color } = getSetLabel(set, workingCounter);
        const isDropset = set.type === "dropset";
        const prev = previousSets[index];
        const prevLabel = prev && (prev.weight || prev.reps)
          ? `${prev.weight || 0}×${prev.reps || 0}`
          : "—";

        return (
          <div key={index}>
            {isDropset && index > 0 && (
              <div className="flex items-center gap-1 pl-8 pb-0.5">
                <ChevronDown className="w-3 h-3 text-purple-400" />
                {sets[index - 1]?.weight && set.weight && sets[index - 1].weight > set.weight && (
                  <span className="text-[10px] text-purple-400 font-medium">
                    -{Math.round(((sets[index - 1].weight - set.weight) / sets[index - 1].weight) * 100)}%
                  </span>
                )}
              </div>
            )}

            <div className={`grid gap-1 px-1 items-center rounded-lg transition-colors ${isActive ? GRID_ACTIVE : GRID} ${getRowBg(set)}`}>
              {isActive && (
                <button onClick={() => toggleComplete(index)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0 ${
                    set.completed ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                  <Check className="w-3 h-3" />
                </button>
              )}

              {/* Previous */}
              <span className="text-[11px] text-muted-foreground truncate">{prevLabel}</span>

              {/* Set label */}
              {isActive ? (
                <div className="flex items-center justify-center">
                  <span className={`text-xs font-bold ${color}`}>{label}</span>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-full h-8">
                      <span className={`text-xs font-bold ${color}`}>{label}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="text-xs">
                    <DropdownMenuItem onClick={() => updateSet(index, "type", "working")}>Working Set</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSet(index, "type", "warmup")}>Warm-up</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSet(index, "type", "failure")} className="text-destructive">Failure Set</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateSet(index, "type", "dropset")} className="text-purple-400">Drop Set</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Input type="number" value={set.weight || ""}
                onChange={(e) => updateSet(index, "weight", parseFloat(e.target.value) || 0)}
                className={`h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1 ${set.type === "failure" ? "text-destructive" : ""}`}
                placeholder="0" />
              <Input type="number" value={set.reps || ""}
                onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}
                className="h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1" placeholder="0" />
              <Input type="number" value={set.rir ?? ""}
                onChange={(e) => updateSet(index, "rir", parseInt(e.target.value) || 0)}
                className="h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1" placeholder="2" />

              <button onClick={() => removeSet(index)}
                className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add buttons */}
      <div className="flex gap-2 pt-1 px-1 flex-wrap">
        <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => addSet("working")}>
          <Plus className="w-3 h-3 mr-1" /> Add Set
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-amber-500" onClick={() => addSet("warmup")}>
          <Flame className="w-3 h-3 mr-1" /> Warm-up
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive" onClick={() => addSet("failure")}>
          + Failure
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-purple-400" onClick={() => addSet("dropset")}>
          + Drop
        </Button>
      </div>
    </div>
  );
}