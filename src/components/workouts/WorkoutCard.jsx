import React, { useState } from "react";
import { MoreVertical, Play, Pencil, Copy, Trash2, Archive, FolderInput, ArchiveRestore, NotebookPen, Check, X, Palette, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IconPickerModal, { WorkoutIcon } from "./IconPickerModal";

const COLORS = [
  "#3B82F6", "#60A5FA", "#0EA5E9",
  "#EF4444", "#F97316", "#F59E0B",
  "#10B981", "#22C55E", "#84CC16",
  "#8B5CF6", "#EC4899", "#64748B",
];

export default function WorkoutCard({
  template, folders = [],
  onEdit, onDelete, onDuplicate, onArchive, onUnarchive,
  onMoveToFolder, onUpdateNotes, onStart, isArchived,
  dragHandleProps, // passed from DraggableWorkoutCard wrapper
}) {
  const queryClient = useQueryClient();

  const setCount = template.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0;
  const accentColor = template.color || null;
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(template.notes || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const regularFolders = folders.filter(f => f.name !== "Archived");

  const handleSaveNote = () => {
    onUpdateNotes && onUpdateNotes(template, noteValue.trim());
    setEditingNote(false);
  };

  const handleCancelNote = () => {
    setNoteValue(template.notes || "");
    setEditingNote(false);
  };

  const handleSelectColor = async (color) => {
    setShowColorPicker(false);
    await base44.entities.WorkoutTemplate.update(template.id, { color: color || null });
    queryClient?.invalidateQueries({ queryKey: ["templates"] });
  };

  const handleSelectIcon = async (iconName) => {
    await base44.entities.WorkoutTemplate.update(template.id, { icon: iconName });
    queryClient?.invalidateQueries({ queryKey: ["templates"] });
  };

  return (
    <div
      className="bg-secondary/50 rounded-lg overflow-hidden"
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}}
    >
      <div className="flex items-center p-3 gap-2">
        {/* Drag handle */}
        {dragHandleProps && (
          <div {...dragHandleProps} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1">
            <GripVertical className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}

        {/* Tappable icon → opens icon picker */}
        <button
          onClick={() => setShowIconPicker(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
          style={{ backgroundColor: accentColor ? accentColor + "22" : "hsl(var(--primary)/0.1)" }}
        >
          <WorkoutIcon
            name={template.icon}
            className="w-4 h-4"
            style={{ color: accentColor || "hsl(var(--primary))" }}
          />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {template.name}
            <span className="text-muted-foreground font-normal ml-1.5">— {setCount} {setCount === 1 ? "Set" : "Sets"}</span>
          </p>
          {template.notes && !editingNote && (
            <p className="text-xs text-muted-foreground/70 italic truncate mt-0">{template.notes}</p>
          )}
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-primary" onClick={() => onStart(template)}>
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
            <DropdownMenuItem onClick={() => { setNoteValue(template.notes || ""); setEditingNote(true); }}>
              <NotebookPen className="w-4 h-4 mr-2" /> {template.notes ? "Edit Note" : "Add Note"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowColorPicker(true)}>
              <Palette className="w-4 h-4 mr-2" /> Change Color
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(template)}>
              <Copy className="w-4 h-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            {regularFolders.length > 0 && onMoveToFolder && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderInput className="w-4 h-4 mr-2" /> Move to Folder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onMoveToFolder(template, null)}>
                    No Folder
                  </DropdownMenuItem>
                  {regularFolders.map(f => (
                    <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(template, f.id)}>
                      {f.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {isArchived && onUnarchive ? (
              <DropdownMenuItem onClick={() => onUnarchive(template)}>
                <ArchiveRestore className="w-4 h-4 mr-2" /> Remove from Archive
              </DropdownMenuItem>
            ) : onArchive && (
              <DropdownMenuItem onClick={() => onArchive(template)}>
                <Archive className="w-4 h-4 mr-2" /> Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Icon Picker Modal */}
      <IconPickerModal
        open={showIconPicker}
        current={template.icon || "Dumbbell"}
        accentColor={accentColor}
        onSelect={handleSelectIcon}
        onClose={() => setShowIconPicker(false)}
      />

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowColorPicker(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl p-5 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-4 text-center">Workout Color</h3>
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  className="h-14 rounded-xl transition-all active:scale-95"
                  style={{
                    backgroundColor: color,
                    boxShadow: accentColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => handleSelectColor(null)}
              className="mt-4 w-full h-11 rounded-xl border-2 border-dashed border-border bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground active:opacity-70"
            >
              Remove Color
            </button>
          </div>
        </div>
      )}

      {/* Inline Note Editor */}
      {editingNote && (
        <div className="px-3 pb-3 flex gap-2 items-center">
          <input
            autoFocus
            value={noteValue}
            onChange={e => setNoteValue(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            onKeyDown={e => { if (e.key === "Enter") handleSaveNote(); if (e.key === "Escape") handleCancelNote(); }}
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSaveNote}><Check className="w-3.5 h-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCancelNote}><X className="w-3.5 h-3.5" /></Button>
        </div>
      )}
    </div>
  );
}