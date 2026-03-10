import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Exercises() {
  const [search, setSearch] = useState("");

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by first letter
  const grouped = {};
  filtered.forEach((ex) => {
    const letter = ex.name[0]?.toUpperCase() || "#";
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(ex);
  });

  const sortedLetters = Object.keys(grouped).sort();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4">Exercises</h1>

      {/* Search */}
      <div className="relative mb-4 sticky top-0 z-10 bg-background pb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-0 rounded-xl h-11"
        />
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {sortedLetters.map((letter) => (
            <div key={letter}>
              <div className="sticky top-12 z-[5] bg-background py-1.5">
                <span className="text-xs font-bold text-primary">{letter}</span>
              </div>
              {grouped[letter].map((ex) => (
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
                      {ex.muscle_group?.replace(/_/g, " ")} • {ex.category}
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
    </div>
  );
}