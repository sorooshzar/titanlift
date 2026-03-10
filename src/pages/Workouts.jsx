import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Zap, Plus, FolderPlus, Dumbbell, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FolderCard from "../components/workouts/FolderCard";
import WorkoutCard from "../components/workouts/WorkoutCard";
import CreateDialog from "../components/workouts/CreateDialog";

export default function Workouts() {
  const [createType, setCreateType] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({
    queryKey: ["folders"],
    queryFn: () => base44.entities.WorkoutFolder.list("order", 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.WorkoutTemplate.list("order", 100),
  });

  const unfolderedTemplates = templates.filter((t) => !t.folder_id || t.folder_id === "none");

  const handleCreateFolder = async ({ name }) => {
    await base44.entities.WorkoutFolder.create({ name, order: folders.length });
    queryClient.invalidateQueries({ queryKey: ["folders"] });
  };

  const handleCreateWorkout = async ({ name, folder_id }) => {
    const created = await base44.entities.WorkoutTemplate.create({
      name,
      folder_id: folder_id === "none" ? null : folder_id,
      order: templates.length,
      exercises: [],
    });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    navigate(createPageUrl(`EditWorkout?id=${created.id}`));
  };

  const handleDeleteFolder = async (folder) => {
    await base44.entities.WorkoutFolder.delete(folder.id);
    // Move templates out of folder
    const folderTemplates = templates.filter((t) => t.folder_id === folder.id);
    for (const t of folderTemplates) {
      await base44.entities.WorkoutTemplate.update(t.id, { folder_id: null });
    }
    queryClient.invalidateQueries({ queryKey: ["folders", "templates"] });
  };

  const handleRenameFolder = async (folder) => {
    const newName = prompt("Rename folder:", folder.name);
    if (newName && newName.trim()) {
      await base44.entities.WorkoutFolder.update(folder.id, { name: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    }
  };

  const handleEditWorkout = (template) => {
    navigate(createPageUrl(`EditWorkout?id=${template.id}`));
  };

  const handleDeleteWorkout = async (template) => {
    await base44.entities.WorkoutTemplate.delete(template.id);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  const handleDuplicateWorkout = async (template) => {
    await base44.entities.WorkoutTemplate.create({
      name: `Duplicate (${template.name})`,
      folder_id: template.folder_id,
      order: templates.length,
      exercises: template.exercises,
    });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  const handleArchiveWorkout = async (template) => {
    let archiveFolder = folders.find((f) => f.name === "Archived");
    if (!archiveFolder) {
      archiveFolder = await base44.entities.WorkoutFolder.create({ name: "Archived", order: 999 });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    }
    await base44.entities.WorkoutTemplate.update(template.id, { folder_id: archiveFolder.id });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  const handleStartWorkout = (template) => {
    navigate(createPageUrl(`ActiveWorkout?templateId=${template.id}`));
  };

  const handleAddWorkoutToFolder = async (folder) => {
    const name = prompt("Workout name:");
    if (!name?.trim()) return;
    const created = await base44.entities.WorkoutTemplate.create({
      name: name.trim(),
      folder_id: folder.id,
      order: templates.length,
      exercises: [],
    });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    navigate(createPageUrl(`EditWorkout?id=${created.id}`));
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Link to={createPageUrl("WorkoutHistory")}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <History className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Quick Workout */}
      <Link to={createPageUrl("ActiveWorkout")}>
        <Button className="w-full h-14 rounded-xl text-base font-semibold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5" />
          Quick Workout
        </Button>
      </Link>

      {/* Create Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          My Routines
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCreateType("folder")}>
              <FolderPlus className="w-4 h-4 mr-2" /> Create Folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCreateType("workout")}>
              <Dumbbell className="w-4 h-4 mr-2" /> Create Workout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Folders */}
      <div className="space-y-3">
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            templates={templates}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onEditWorkout={handleEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onDuplicateWorkout={handleDuplicateWorkout}
            onStartWorkout={handleStartWorkout}
            onAddWorkout={handleAddWorkoutToFolder}
          />
        ))}

        {/* Unfoldered workouts */}
        {unfolderedTemplates.map((template) => (
          <WorkoutCard
            key={template.id}
            template={template}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onDuplicate={handleDuplicateWorkout}
            onArchive={handleArchiveWorkout}
            onStart={handleStartWorkout}
          />
        ))}

        {folders.length === 0 && unfolderedTemplates.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No workouts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap + to create your first routine
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateDialog
        open={!!createType}
        onClose={() => setCreateType(null)}
        type={createType}
        folders={folders}
        onSubmit={createType === "folder" ? handleCreateFolder : handleCreateWorkout}
      />
    </div>
  );
}