import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const MUSCLE_GROUPS = ["chest", "shoulders", "triceps", "biceps", "back", "abs", "quads", "hamstrings", "calves", "glutes", "forearms", "traps", "lats"];
const CATEGORIES = ["barbell", "dumbbell", "machine", "cable", "bodyweight", "band", "other"];

export default function CreateExerciseModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim() || !muscle) return;
    setSaving(true);
    await base44.entities.Exercise.create({
      name: name.trim(),
      muscle_group: muscle,
      category: category || "other",
    });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    setSaving(false);
    setName(""); setMuscle(""); setCategory("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:items-center" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">New Exercise</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Exercise Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Incline Dumbbell Press" className="bg-secondary border-0" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Muscle Trained *</label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((m) => (
                <button key={m} onClick={() => setMuscle(m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    muscle === m ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Equipment</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    category === c ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!name.trim() || !muscle || saving} className="w-full h-11 rounded-xl font-semibold">
          {saving ? "Creating..." : "Create Exercise"}
        </Button>
      </div>
    </div>
  );
}