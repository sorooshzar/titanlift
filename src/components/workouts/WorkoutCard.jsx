import React, { useState } from "react";
import { MoreVertical, Play, Pencil, Copy, Trash2, Dumbbell, Archive, FolderInput, ArchiveRestore, NotebookPen, Check, X, Palette } from "lucide-react";
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

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#64748B"];

export default function WorkoutCard({ template, folders = [], onEdit, onDelete, onDuplicate, onArchive, onUnarchive, onMoveToFolder, onUpdateNotes, onStart, isArchived }) {
  const queryClient = useQueryClient();
  
  const setCount = template.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0;
  const accentColor = template.color || null;
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(template.notes || "");

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
    try {
      await base44.entities.WorkoutTemplate.update(template.id, { color });
      queryClient?.invalidateQueries({ queryKey: ["templates"] });
    } catch (e) {}
  };

  return (
    <div
      className="bg-secondary/50 rounded-lg overflow-hidden"
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : {}}
    >
      <div className="flex items-center p-3 gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor ? accentColor + "22" : "hsl(var(--primary)/0.1)" }}
        >
          <Dumbbell className="w-4 h-4" style={{ color: accentColor || "hsl(var(--primary))" }} />
        </div>

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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="w-4 h-4 mr-2" /> Select Color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {COLORS.map(color => (
                    <button key={color} onClick={(e) => { e.preventDefault(); handleSelectColor(color); }} 
                      className="w-10 h-10 rounded-lg border-2 transition-all hover:scale-110" 
                      style={{ backgroundColor: color, borderColor: accentColor === color ? "#fff" : "transparent", boxShadow: accentColor === color ? `0 0 0 2px #000` : "none" }} />
                  ))}
                  <button onClick={(e) => { e.preventDefault(); handleSelectColor(null); }} 
                    className="col-span-3 h-8 rounded-lg border-2 border-dashed bg-secondary flex items-center justify-center text-xs font-semibold transition-all hover:bg-secondary/70"
                    style={{ borderColor: accentColor === null ? "#000" : "hsl(var(--border))" }}>Remove Color</button>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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