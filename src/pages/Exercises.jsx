import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Dumbbell, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExerciseFilters from "../components/exercises/ExerciseFilters";
import CreateExerciseModal from "../components/exercises/CreateExerciseModal";
import { getMainGroupsForSubsection } from "@/components/utils/muscleHierarchy";

export default function Exercises() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ mainGroups: [], equipment: [], sort: "name" });
  const [showCreate, setShowCreate] = useState(false);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });

  // Build frequency + recency maps
  const freqMap = {};
  const recentMap = {};
  workoutLogs.forEach((log) => {
    log.exercises?.forEach((ex) => {
      if (!ex.exercise_id) return;
      freqMap[ex.exercise_id] = (freqMap[ex.exercise_id] || 0) + 1;
      const d = new Date(log.started_at || log.created_date).getTime();
      if (!recentMap[ex.exercise_id] || d > recentMap[ex.exercise_id]) recentMap[ex.exercise_id] = d;
    });
  });

  let filtered = exercises.filter((ex) => {
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.mainGroups.length > 0) {
      const mainGroupsForEx = getMainGroupsForSubsection(ex.primary_muscle);
      const matchesFilter = filters.mainGroups.some(mg => mainGroupsForEx.includes(mg));
      if (!matchesFilter) return false;
    }
    if (filters.equipment.length > 0) {
      const eqKey = ex.category?.toLowerCase().replace(" ", "_");
      if (!filters.equipment.includes(eqKey)) return false;
    }
    return true;
  });

  if (filters.sort === "frequency") {
    filtered = [...filtered].sort((a, b) => (freqMap[b.id] || 0) - (freqMap[a.id] || 0));
  } else if (filters.sort === "recency") {
    filtered = [...filtered].sort((a, b) => (recentMap[b.id] || 0) - (recentMap[a.id] || 0));
  }
  // default = name (already sorted from API)

  // Group by first letter (only for name sort)
  const useGroups = !filters.sort || filters.sort === "name";
  const grouped = {};
  filtered.forEach((ex) => {
    const key = useGroups ? (ex.name[0]?.toUpperCase() || "#") : "Results";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ex);
  });
  const sortedKeys = useGroups ? Object.keys(grouped).sort() : ["Results"];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5 h-8 text-xs rounded-lg">
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 bg-background pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0 rounded-xl h-11"
          />
        </div>
        <ExerciseFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <div className="space-y-3 mt-2">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {sortedKeys.map((key) => (
            <div key={key}>
              {useGroups && (
                <div className="sticky top-[108px] z-[5] bg-background py-1.5">
                  <span className="text-xs font-bold text-primary">{key}</span>
                </div>
              )}
              {grouped[key]?.map((ex) => (
                <Link
                  key={ex.id}
                  to={createPageUrl(`ExerciseDetail?id=${ex.id}`)}
                  className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ex.primary_muscle?.replace(/_/g, " ")} • {ex.category}
                      {freqMap[ex.id] ? ` · ${freqMap[ex.id]}×` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No exercises found</p>
            </div>
          )}
        </div>
      )}

      <CreateExerciseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}