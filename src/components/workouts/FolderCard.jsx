import React, { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2, FolderOpen, Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import WorkoutCard from "./WorkoutCard";

export default function FolderCard({ folder, templates, onRenameFolder, onDeleteFolder, onEditWorkout, onDeleteWorkout, onDuplicateWorkout, onArchiveWorkout, onStartWorkout, onAddWorkout }) {
  const [open, setOpen] = useState(true);

  const folderTemplates = templates
    .filter((t) => t.folder_id === folder.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Folder Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full p-4 gap-3"
      >
        <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-sm">{folder.name}</span>
        <span className="text-xs text-muted-foreground mr-2">{folderTemplates.length}</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddWorkout && onAddWorkout(folder); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Workout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameFolder(folder); }}>
              <Pencil className="w-4 h-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Workout Templates */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {folderTemplates.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 text-center">No workouts yet</p>
              )}
              {folderTemplates.map((template) => (
                <WorkoutCard
                  key={template.id}
                  template={template}
                  onEdit={onEditWorkout}
                  onDelete={onDeleteWorkout}
                  onDuplicate={onDuplicateWorkout}
                  onArchive={onArchiveWorkout}
                  onStart={onStartWorkout}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}