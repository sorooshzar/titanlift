import React from "react";
import { MoreVertical, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SetTable from "./SetTable";

const EXERCISE_COLORS = [
  null, "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4",
];

export default function ExerciseBlock({ exercise, index, onChange, onRemove, isActive = false }) {
  const updateSets = (newSets) => {
    onChange({ ...exercise, sets: newSets });
  };

  const borderColor = exercise.color || "transparent";

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden"
      style={{ borderLeftWidth: "3px", borderLeftColor: borderColor }}
    >
      {/* Exercise Header */}
      <div className="flex items-center px-3 py-3 gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{exercise.exercise_name}</p>
          {exercise.superset_group != null && exercise.superset_group > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Superset {exercise.superset_group}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs">
              Color
              <div className="flex gap-1 ml-2">
                {EXERCISE_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onChange({ ...exercise, color: c })}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: c || "transparent" }}
                  />
                ))}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sets */}
      <div className="px-2 pb-3">
        <SetTable sets={exercise.sets || []} onChange={updateSets} isActive={isActive} />
      </div>
    </div>
  );
}