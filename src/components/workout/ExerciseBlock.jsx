import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Trash2, GripVertical, StickyNote, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SetTable from "./SetTable";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const EXERCISE_COLORS = [
  null, "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4",
];

export default function ExerciseBlock({ exercise, index, onChange, onRemove, onReplace, isActive = false, previousSets = [] }) {
  const [showNotes, setShowNotes] = useState(!!exercise.notes);
  const navigate = useNavigate();

  const updateSets = (newSets) => onChange({ ...exercise, sets: newSets });
  const updateNotes = (notes) => {
    onChange({ ...exercise, notes });
    // Persist notes to the Exercise entity so it carries forward
    if (exercise.exercise_id) {
      base44.entities.Exercise.update(exercise.exercise_id, { notes }).catch(() => {});
    }
  };

  const borderColor = exercise.color || "transparent";

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden"
      style={{ borderLeftWidth: "3px", borderLeftColor: borderColor }}
    >
      {/* Exercise Header */}
      <div className="flex items-center px-3 py-3 gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{exercise.exercise_name}</p>
          {exercise.superset_group > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Superset {exercise.superset_group}
            </span>
          )}
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            exercise.notes ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <StickyNote className="w-3.5 h-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Color picker */}
            <DropdownMenuItem className="text-xs flex-col items-start gap-1" onSelect={(e) => e.preventDefault()}>
              <span className="font-medium text-xs text-muted-foreground mb-1">Color</span>
              <div className="flex gap-1.5">
                {EXERCISE_COLORS.map((c, i) => (
                  <button key={i} onClick={() => onChange({ ...exercise, color: c })}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${exercise.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c || "hsl(var(--secondary))" }} />
                ))}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground" onSelect={(e) => e.preventDefault()}>
              <Timer className="w-3.5 h-3.5 mr-2" /> Update Rest Timer
            </DropdownMenuItem>
            {onReplace && (
              <DropdownMenuItem onClick={onReplace}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Replace Exercise
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notes section — auto-growing */}
      {showNotes && (
        <div className="px-3 pb-2">
          <textarea
            className="w-full text-xs bg-secondary rounded-lg p-2.5 border-0 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary overflow-hidden"
            rows={1}
            placeholder="Technique cues, reminders..."
            value={exercise.notes || ""}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              updateNotes(e.target.value);
            }}
            onFocus={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            style={{ minHeight: "32px" }}
          />
        </div>
      )}

      {/* Sets */}
      <div className="px-2 pb-3">
        <SetTable sets={exercise.sets || []} onChange={updateSets} isActive={isActive} previousSets={previousSets} />
      </div>
    </div>
  );
}