import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Plus, FolderPlus, Dumbbell, History, Search, Library, ChevronRight, Archive, Calculator } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useActiveWorkout } from "../components/workout/ActiveWorkoutContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FolderCard from "../components/workouts/FolderCard";
import WorkoutCard from "../components/workouts/WorkoutCard";
import CreateDialog from "../components/workouts/CreateDialog";
import ExerciseFilters from "../components/exercises/ExerciseFilters";
import CreateExerciseModal from "../components/exercises/CreateExerciseModal";
import { format } from "date-fns";

function WorkoutsTab({ folders, templates, queryClient, navigate, startWorkout }) {
  const [createType, setCreateType] = useState(null);

  const unfolderedTemplates = templates.filter((t) => !t.folder_id || t.folder_id === "none");
  const archivedFolder = folders.find(f => f.name === "Archived");
  const regularFolders = folders.filter(f => f.name !== "Archived");

  const handleCreateFolder = async ({ name }) => {
    await base44.entities.WorkoutFolder.create({ name, order: folders.length });
    queryClient.invalidateQueries({ queryKey: ["folders"] });
  };

  const handleCreateWorkout = async ({ name, folder_id }) => {
    await base44.entities.WorkoutTemplate.create({
      name, folder_id: folder_id === "none" ? null : folder_id,
      order: templates.length, exercises: [],
    });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  const handleDeleteFolder = async (folder) => {
    await base44.entities.WorkoutFolder.delete(folder.id);
    const ft = templates.filter((t) => t.folder_id === folder.id);
    for (const t of ft) await base44.entities.WorkoutTemplate.update(t.id, { folder_id: null });
    queryClient.invalidateQueries({ queryKey: ["folders", "templates"] });
  };

  const handleRenameFolder = async (folder) => {
    const newName = prompt("Rename folder:", folder.name);
    if (newName?.trim()) {
      await base44.entities.WorkoutFolder.update(folder.id, { name: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    }
  };

  const handleEditWorkout = (t) => navigate(createPageUrl(`EditWorkout?id=${t.id}`));
  const handleDeleteWorkout = async (t) => {
    await base44.entities.WorkoutTemplate.delete(t.id);
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleDuplicateWorkout = async (t) => {
    await base44.entities.WorkoutTemplate.create({ name: `Duplicate (${t.name})`, folder_id: t.folder_id, order: templates.length, exercises: t.exercises });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleArchiveWorkout = async (t) => {
    let archiveFolder = folders.find((f) => f.name === "Archived");
    if (!archiveFolder) {
      archiveFolder = await base44.entities.WorkoutFolder.create({ name: "Archived", order: 999 });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    }
    await base44.entities.WorkoutTemplate.update(t.id, { folder_id: archiveFolder.id });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleUnarchiveWorkout = async (t) => {
    await base44.entities.WorkoutTemplate.update(t.id, { folder_id: null });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleMoveToFolder = async (t, targetFolderId) => {
    await base44.entities.WorkoutTemplate.update(t.id, { folder_id: targetFolderId || null });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleUpdateNotes = async (t, notes) => {
    await base44.entities.WorkoutTemplate.update(t.id, { notes });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const handleStartWorkout = (t) => navigate(createPageUrl(`ActiveWorkout?templateId=${t.id}`));
  const handleAddWorkoutToFolder = async (folder) => {
    const name = prompt("Workout name:");
    if (!name?.trim()) return;
    await base44.entities.WorkoutTemplate.create({ name: name.trim(), folder_id: folder.id, order: templates.length, exercises: [] });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  return (
    <div className="space-y-3">
      <Link to={createPageUrl("ActiveWorkout")}>
        <Button className="w-full h-14 rounded-xl text-base font-semibold gap-2 shadow-lg shadow-primary/20">
          <Zap className="w-5 h-5" /> Quick Start
        </Button>
      </Link>

      {/* My Routines header */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Routines</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="w-5 h-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCreateType("folder")}><FolderPlus className="w-4 h-4 mr-2" /> Create Folder</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCreateType("workout")}><Dumbbell className="w-4 h-4 mr-2" /> Create Workout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Folders (regular) */}
      {regularFolders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} templates={templates} folders={folders}
          onRenameFolder={handleRenameFolder} onDeleteFolder={handleDeleteFolder}
          onEditWorkout={handleEditWorkout} onDeleteWorkout={handleDeleteWorkout}
          onDuplicateWorkout={handleDuplicateWorkout} onArchiveWorkout={handleArchiveWorkout}
          onMoveToFolder={handleMoveToFolder} onUpdateNotes={handleUpdateNotes}
          onStartWorkout={handleStartWorkout} onAddWorkout={handleAddWorkoutToFolder} />
      ))}

      {/* Unfoldered */}
      {unfolderedTemplates.map((template) => (
        <WorkoutCard key={template.id} template={template} folders={folders}
          onEdit={handleEditWorkout} onDelete={handleDeleteWorkout}
          onDuplicate={handleDuplicateWorkout} onArchive={handleArchiveWorkout}
          onMoveToFolder={handleMoveToFolder} onUpdateNotes={handleUpdateNotes}
          onStart={handleStartWorkout} />
      ))}

      {/* Archived folder (dimmed, collapsed by default) */}
      {archivedFolder && (
        <div className="opacity-50">
          <FolderCard folder={archivedFolder} templates={templates} folders={folders} isArchiveFolder
            onRenameFolder={handleRenameFolder} onDeleteFolder={handleDeleteFolder}
            onEditWorkout={handleEditWorkout} onDeleteWorkout={handleDeleteWorkout}
            onDuplicateWorkout={handleDuplicateWorkout} onArchiveWorkout={handleArchiveWorkout}
            onUnarchiveWorkout={handleUnarchiveWorkout} onMoveToFolder={handleMoveToFolder}
            onUpdateNotes={handleUpdateNotes}
            onStartWorkout={handleStartWorkout} onAddWorkout={handleAddWorkoutToFolder}
            defaultOpen={false} />
        </div>
      )}

      {folders.length === 0 && unfolderedTemplates.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No workouts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Tap + to create your first routine</p>
        </div>
      )}

      <CreateDialog open={!!createType} onClose={() => setCreateType(null)} type={createType}
        folders={folders} onSubmit={createType === "folder" ? handleCreateFolder : handleCreateWorkout} />
    </div>
  );
}

function ExercisesTab() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ bodyParts: [], equipment: [], sort: "name" });
  const [showCreate, setShowCreate] = useState(false);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });

  const freqMap = {};
  workoutLogs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (ex.exercise_id) freqMap[ex.exercise_id] = (freqMap[ex.exercise_id] || 0) + 1;
    });
  });

  let filtered = exercises.filter(ex => {
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.bodyParts.length > 0 && !filters.bodyParts.includes(ex.muscle_group)) return false;
    if (filters.equipment.length > 0) {
      const eqKey = ex.category?.toLowerCase().replace(" ", "_");
      if (!filters.equipment.includes(eqKey)) return false;
    }
    return true;
  });

  if (filters.sort === "frequency") {
    filtered = [...filtered].sort((a, b) => (freqMap[b.id] || 0) - (freqMap[a.id] || 0));
  }

  const useGroups = !filters.sort || filters.sort === "name";
  const grouped = {};
  filtered.forEach(ex => {
    const key = useGroups ? (ex.name[0]?.toUpperCase() || "#") : "Results";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ex);
  });
  const sortedKeys = useGroups ? Object.keys(grouped).sort() : ["Results"];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0 rounded-xl h-10" />
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1 h-10 px-3 rounded-xl text-xs shrink-0">
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>
      <ExerciseFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="space-y-2">{Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div>
          {sortedKeys.map(key => (
            <div key={key}>
              {useGroups && (
                <div className="py-1.5">
                  <span className="text-xs font-bold text-primary">{key}</span>
                </div>
              )}
              {grouped[key]?.map(ex => (
                <Link key={ex.id} to={createPageUrl(`ExerciseDetail?id=${ex.id}`)}
                  className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ex.muscle_group?.replace(/_/g, " ")} · {ex.category}
                      {freqMap[ex.id] ? ` · ${freqMap[ex.id]}×` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Library className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No exercises found</p>
            </div>
          )}
        </div>
      )}
      <CreateExerciseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

export default function Lifts() {
  const [tab, setTab] = useState("workouts");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery({ queryKey: ["folders"], queryFn: () => base44.entities.WorkoutFolder.list("order", 100) });
  const { data: templates = [] } = useQuery({ queryKey: ["templates"], queryFn: () => base44.entities.WorkoutTemplate.list("order", 100) });

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Lifts</h1>
        <div className="flex bg-secondary rounded-xl p-1">
          <button onClick={() => setTab("workouts")}
            className={`px-6 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === "workouts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Workouts
          </button>
          <button onClick={() => setTab("exercises")}
            className={`px-6 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === "exercises" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Exercises
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Calculator className="w-6 h-6" />
          </Button>
          <Link to={createPageUrl("WorkoutHistory")}>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <History className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      {tab === "workouts" ? (
        <WorkoutsTab folders={folders} templates={templates} queryClient={queryClient} navigate={navigate} />
      ) : (
        <ExercisesTab />
      )}
    </div>
  );
}