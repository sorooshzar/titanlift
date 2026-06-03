import React, { useState, useRef } from "react";
import { MoreVertical, Trash2, GripVertical, StickyNote, RefreshCw, Timer, Link2, Unlink } from "lucide-react";
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

export default function ExerciseBlock({
  exercise,
  index,
  onChange,
  onRemove,
  onReplace,
  isActive = false,
  previousSets = [],
  dragHandleProps,
  // Superset actions
  onMakeSuperset,     // () => void — open superset picker
  onLeaveSuperset,    // () => void — remove this exercise from its superset
  accentColor,        // override left border color when inside a SupersetBlock
  onSetCompleted,     // (set) => void — fires when a set is toggled to completed
}) {
  const [showNotes, setShowNotes] = useState(!!exercise.notes);
  const [showRestEditor, setShowRestEditor] = useState(false);
  const navigate = useNavigate();
  const notesDebounceRef = useRef(null);

  const updateSets = (newSets) => onChange({ ...exercise, sets: newSets });

  const updateNotes = (notes) => {
    onChange({ ...exercise, notes });
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    if (exercise.exercise_id) {
      notesDebounceRef.current = setTimeout(() => {
        base44.entities.Exercise.update(exercise.exercise_id, { notes }).catch(() => {});
      }, 800);
    }
  };

  const borderColor = accentColor || exercise.color || "transparent";
  const isInSuperset = !!exercise.superset_group;

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden transition-shadow"
      style={{ borderLeftWidth: "3px", borderLeftColor: borderColor }}
    >
      {/* Exercise Header */}
      <div className="flex items-center px-3 py-3 gap-2">
        <div {...(dragHandleProps || {})} className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="flex-1 min-w-0">
          <button
            className="text-sm font-semibold truncate text-left w-full hover:text-primary transition-colors"
            onClick={() => exercise.exercise_id && navigate(createPageUrl(`ExerciseDetail?id=${exercise.exercise_id}`))}
          >
            {exercise.exercise_name}
          </button>
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
          <DropdownMenuContent align="end" className="p-2">
            {/* Color picker */}
            <div className="mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-0.5">Color</p>
              <div className="grid grid-cols-4 gap-1.5">
                {EXERCISE_COLORS.map((c, i) => (
                  <button key={i} onClick={() => onChange({ ...exercise, color: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${exercise.color === c ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c || "hsl(var(--secondary))" }} />
                ))}
              </div>
            </div>
            <div className="border-t border-border mb-1" />

            {/* Superset actions */}
            {!isInSuperset && onMakeSuperset && (
              <DropdownMenuItem onClick={onMakeSuperset}>
                <Link2 className="w-3.5 h-3.5 mr-2 text-violet-400" /> Make Superset
              </DropdownMenuItem>
            )}
            {isInSuperset && onLeaveSuperset && (
              <DropdownMenuItem onClick={onLeaveSuperset} className="text-muted-foreground">
                <Unlink className="w-3.5 h-3.5 mr-2" /> Remove from Superset
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => setShowRestEditor(v => !v)}>
              <Timer className="w-3.5 h-3.5 mr-2 text-primary" /> Update Rest Timer
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

      {/* Notes section */}
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
        <SetTable
          sets={exercise.sets || []}
          onChange={updateSets}
          isActive={isActive}
          previousSets={previousSets}
          onSetCompleted={onSetCompleted}
          showRestEditor={showRestEditor}
          onCollapseRest={() => setShowRestEditor(false)}
          movementType={exercise.movement_type}
        />
      </div>
    </div>
  );
}