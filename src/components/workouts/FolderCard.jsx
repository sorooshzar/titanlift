import React, { useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import WorkoutCard from "./WorkoutCard";

export default function FolderCard({
  folder, templates, folders = [],
  onRenameFolder, onDeleteFolder,
  onEditWorkout, onDeleteWorkout, onDuplicateWorkout,
  onArchiveWorkout, onUnarchiveWorkout,
  onMoveToFolder, onUpdateNotes, onStartWorkout, onAddWorkout,
  defaultOpen = true, isArchiveFolder = false,
  // DnD props for the folder itself (outer list)
  draggableProps, dragHandleProps, innerRef, isDragging,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const queryClient = useQueryClient();

  const folderTemplates = templates
    .filter((t) => t.folder_id === folder.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleInnerDragEnd = async (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    // Reorder locally
    const reordered = Array.from(folderTemplates);
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    // Optimistic update
    queryClient.setQueryData(["templates"], (old = []) => {
      const outside = old.filter(t => t.folder_id !== folder.id);
      const updated = reordered.map((t, i) => ({ ...t, order: i }));
      return [...outside, ...updated];
    });

    // Persist
    await Promise.all(
      reordered.map((t, i) =>
        base44.entities.WorkoutTemplate.update(t.id, { order: i })
      )
    );
  };

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`bg-card rounded-xl border border-border overflow-hidden transition-shadow ${isDragging ? "shadow-2xl opacity-90 scale-[1.02]" : ""}`}
    >
      {/* Folder Header */}
      <div className="flex items-center w-full p-4 gap-3">
        {/* Folder drag handle (if provided) */}
        {dragHandleProps && !isArchiveFolder && (
          <div {...dragHandleProps} className="flex-shrink-0 cursor-grab active:cursor-grabbing">
            <svg className="w-4 h-4 text-muted-foreground/30" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="5" cy="4" r="1.3"/><circle cx="11" cy="4" r="1.3"/>
              <circle cx="5" cy="8" r="1.3"/><circle cx="11" cy="8" r="1.3"/>
              <circle cx="5" cy="12" r="1.3"/><circle cx="11" cy="12" r="1.3"/>
            </svg>
          </div>
        )}

        <button onClick={() => setOpen(!open)} className="flex-shrink-0">
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-3 min-w-0">
          <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="flex-1 text-left font-semibold text-sm truncate">{folder.name}</span>
          <span className="text-xs text-muted-foreground">{folderTemplates.length}</span>
        </button>

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
      </div>

      {/* Workout Templates — with inner DnD */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <DragDropContext onDragEnd={handleInnerDragEnd}>
              <Droppable droppableId={`folder-${folder.id}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="px-3 pb-3 space-y-2"
                  >
                    {folderTemplates.length === 0 && (
                      <p className="text-xs text-muted-foreground py-3 text-center">No workouts yet</p>
                    )}
                    {folderTemplates.map((template, index) => (
                      <Draggable key={template.id} draggableId={template.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`transition-shadow ${dragSnapshot.isDragging ? "shadow-xl rounded-lg opacity-95" : ""}`}
                          >
                            <WorkoutCard
                              template={template}
                              folders={folders}
                              onEdit={onEditWorkout}
                              onDelete={onDeleteWorkout}
                              onDuplicate={onDuplicateWorkout}
                              onArchive={isArchiveFolder ? undefined : onArchiveWorkout}
                              onUnarchive={isArchiveFolder ? onUnarchiveWorkout : undefined}
                              onMoveToFolder={onMoveToFolder}
                              onUpdateNotes={onUpdateNotes}
                              onStart={onStartWorkout}
                              isArchived={isArchiveFolder}
                              dragHandleProps={dragProvided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}