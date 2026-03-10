import React from "react";
import { MoreVertical, Play, Pencil, Copy, Trash2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkoutCard({ template, onEdit, onDelete, onDuplicate, onStart }) {
  const exerciseCount = template.exercises?.length || 0;

  return (
    <div className="flex items-center bg-secondary/50 rounded-lg p-3 gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Dumbbell className="w-4 h-4 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{template.name}</p>
        <p className="text-xs text-muted-foreground">
          {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 text-primary"
        onClick={() => onStart(template)}
      >
        <Play className="w-4 h-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(template)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(template)}>
            <Copy className="w-4 h-4 mr-2" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}