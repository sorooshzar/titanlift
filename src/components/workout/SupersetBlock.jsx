import React from "react";
import { Link2, Unlink } from "lucide-react";
import ExerciseBlock from "./ExerciseBlock";

/**
 * Renders a group of exercises visually tied together as a superset.
 */
export default function SupersetBlock({ label, members, onExerciseChange, onExerciseRemove, onExerciseReplace, onLeaveSuperset, onDissolve, isActive, prevSetsMap, dragHandlePropsMap }) {
  const accentColor = "#8b5cf6"; // purple accent for supersets

  return (
    <div className="relative">
      {/* Superset header */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          <Link2 className="w-3 h-3" />
          Superset {label}
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
        <button
          onClick={onDissolve}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Unlink className="w-2.5 h-2.5" />
          Break
        </button>
      </div>

      {/* Bracket + exercises */}
      <div className="flex gap-2">
        {/* Left bracket line */}
        <div className="flex flex-col items-center w-3 shrink-0 mt-1">
          <div className="flex-1 w-0.5 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
        </div>

        {/* Exercise blocks */}
        <div className="flex-1 space-y-2">
          {members.map(({ exercise, index }) => (
            <ExerciseBlock
              key={index}
              exercise={exercise}
              index={index}
              onChange={(updated) => onExerciseChange(index, updated)}
              onRemove={() => onExerciseRemove(index)}
              onReplace={onExerciseReplace ? () => onExerciseReplace(index) : undefined}
              isActive={isActive}
              previousSets={prevSetsMap?.[exercise.exercise_id] || []}
              dragHandleProps={dragHandlePropsMap?.[index]}
              accentColor={accentColor}
              onLeaveSuperset={onLeaveSuperset ? () => onLeaveSuperset(index) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}