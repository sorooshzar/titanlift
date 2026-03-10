import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ExercisePicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState("");

  const { data: exercises = [] } = useQuery({
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="overflow-y-auto flex-1 -mx-2">
          {Object.entries(grouped).sort().map(([letter, exs]) => (
            <div key={letter}>
              <div className="px-4 py-1.5 bg-secondary/50 sticky top-0">
                <span className="text-xs font-bold text-muted-foreground">{letter}</span>
              </div>
              {exs.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onSelect(ex); onClose(); }}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ex.muscle_group?.replace(/_/g, " ")}</p>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No exercises found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}