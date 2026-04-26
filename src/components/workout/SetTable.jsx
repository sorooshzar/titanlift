import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, Flame, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeightUnit } from "@/components/utils/useWeightUnit";
import { motion, AnimatePresence } from "framer-motion";

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

// e1RM = weight * (1 + reps/30)
function calc1RM(weight, reps) {
  if (!weight || !reps) return null;
  return weight * (1 + reps / 30);
}

// Grid: [set] [prev] [weight] [reps] [rir] [%] [checkbox]
// Active:   [set] [prev] [weight] [reps] [rir] [%] [checkbox]
// Non-active (edit): no checkbox col, weight gets more space
const GRID = "grid-cols-[28px_1.2fr_64px_48px_36px_28px]";
const GRID_ACTIVE = "grid-cols-[28px_1.2fr_64px_48px_36px_28px_28px]";

const SWIPE_THRESHOLD = 80;

function SwipeableSetRow({ children, onRemove }) {
  const [dragX, setDragX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(null);
  const isDragging = useRef(false);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = e.touches[0].clientX - startX.current;
    if (diff < 0) setDragX(Math.max(diff, -SWIPE_THRESHOLD * 1.5));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (dragX < -SWIPE_THRESHOLD) {
      setSwiped(true);
      setTimeout(() => onRemove(), 220);
    } else {
      setDragX(0);
    }
  };

  return (
    <motion.div
      animate={swiped ? { x: "-100%", opacity: 0, height: 0, marginBottom: 0 } : { x: dragX, opacity: 1 }}
      transition={swiped ? { duration: 0.22, ease: "easeIn" } : { type: "spring", stiffness: 500, damping: 40 }}
      style={{ position: "relative", overflow: "visible" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Red delete reveal */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-2 rounded-lg bg-destructive/80 pointer-events-none"
        style={{ width: `${Math.min(Math.abs(dragX), SWIPE_THRESHOLD * 1.5)}px`, opacity: Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) }}
      >
        <span className="text-white text-xs font-bold">Delete</span>
      </div>
      {children}
    </motion.div>
  );
}

export default function SetTable({ sets = [], onChange, isActive = false, previousSets = [] }) {
  const { unit: weightUnit, toDisplay, toKg } = useWeightUnit();

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

  // Pre-compute working set labels — avoids mutation during render
  const workingLabels = [];
  let counter = 0;
  sets.forEach(set => {
    if (set.type !== "warmup") { counter++; workingLabels.push(counter); }
    else workingLabels.push(null);
  });

  return (
    <div className="space-y-0.5">
      {/* Header */}
      <div className={`grid gap-1 px-1 items-center mb-1 ${isActive ? GRID_ACTIVE : GRID}`}>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">SET</span>
        <span className="text-[10px] font-semibold text-muted-foreground">PREVIOUS</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">{weightUnit.toUpperCase()}</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">REPS</span>
        <span className="text-[10px] font-semibold text-muted-foreground text-center">RIR</span>
        <span className="text-[10px] font-semibold text-primary/70 text-center">1RM%</span>
        {isActive && <div />}
      </div>

      <AnimatePresence initial={false}>
      {sets.map((set, index) => {
        const workingIndex = workingLabels[index];
        const { label, color } = getSetLabel(set, workingIndex);
        const isDropset = set.type === "dropset";
        const prev = previousSets[index];
        const prevDisplayWeight = prev?.weight ? toDisplay(prev.weight) : 0;
        const prevLabel = prev && (prev.weight || prev.reps)
          ? `${prevDisplayWeight}×${prev.reps || 0} ${weightUnit}`
          : "—";

        const current1RM = calc1RM(set.weight, set.reps);
        const prev1RM = prev ? calc1RM(prev.weight, prev.reps) : null;
        const pctChange = current1RM && prev1RM ? ((current1RM - prev1RM) / prev1RM) * 100 : null;
        const pctLabel = pctChange !== null ? `${pctChange >= 0 ? "+" : ""}${Math.round(pctChange)}%` : "—";
        const pctColor = pctChange === null ? "text-muted-foreground/40" : pctChange > 0 ? "text-primary" : pctChange < 0 ? "text-destructive/70" : "text-muted-foreground";

        return (
          <SwipeableSetRow
            key={index}
            index={index}
            set={set}
            isDropset={isDropset}
            sets={sets}
            onRemove={() => removeSet(index)}
          >
            {isDropset && index > 0 && (
              <div className="flex items-center gap-1 pl-6 pb-0.5">
                <ChevronDown className="w-3 h-3 text-purple-400" />
                {sets[index - 1]?.weight && set.weight && sets[index - 1].weight > set.weight && (
                  <span className="text-[10px] text-purple-400 font-medium">
                    -{Math.round(((sets[index - 1].weight - set.weight) / sets[index - 1].weight) * 100)}%
                  </span>
                )}
              </div>
            )}

            <div className={`grid gap-1 px-1 items-center rounded-lg transition-colors ${isActive ? GRID_ACTIVE : GRID} ${getRowBg(set)}`}>
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

              {/* Previous */}
              <span className="text-xs text-muted-foreground truncate text-center tracking-wide">{prevLabel}</span>

              <Input type="number" value={set.weight ? toDisplay(set.weight) : ""}
                onChange={(e) => updateSet(index, "weight", toKg(parseFloat(e.target.value) || 0))}
                className={`h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1 ${set.type === "failure" ? "text-destructive" : ""}`}
                placeholder="0" />
              <Input type="number" value={set.reps || ""}
                onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}
                className="h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1" placeholder="0" />
              <Input type="number" value={set.rir ?? ""}
                onChange={(e) => updateSet(index, "rir", parseInt(e.target.value) || 0)}
                className="h-8 text-center text-sm bg-secondary border-0 rounded-lg px-1" placeholder="2" />

              <span className={`text-[10px] font-semibold text-center ${pctColor}`}>{pctLabel}</span>

              {/* Checkbox — far right, active mode only */}
              {isActive && (
                <button onClick={() => toggleComplete(index)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-90 mx-auto ${
                    set.completed ? "bg-primary text-white scale-105" : "bg-secondary text-muted-foreground"
                  }`}>
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </SwipeableSetRow>
        );
      })}
      </AnimatePresence>

      {/* Add buttons — compact single row */}
      <div className="flex gap-1 pt-1 px-1">
        <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5 text-muted-foreground" onClick={() => addSet("working")}>
          <Plus className="w-2.5 h-2.5 mr-0.5" /> Add Set
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5 text-amber-500" onClick={() => addSet("warmup")}>
          <Flame className="w-2.5 h-2.5 mr-0.5" /> Warm
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5 text-destructive" onClick={() => addSet("failure")}>
          <Flame className="w-2.5 h-2.5 mr-0.5" /> Fail
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-6 px-1.5 text-purple-400" onClick={() => addSet("dropset")}>
          <ChevronDown className="w-2.5 h-2.5 mr-0.5" /> Drop
        </Button>
      </div>
    </div>
  );
}