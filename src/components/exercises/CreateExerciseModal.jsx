import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";
import { MUSCLE_HIERARCHY, getSubsectionsForMain } from "@/components/utils/muscleHierarchy";

const CATEGORIES = ["barbell", "dumbbell", "machine", "cable", "bodyweight", "band", "other"];

export default function CreateExerciseModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [primaryMuscles, setPrimaryMuscles] = useState([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState([]);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim() || primaryMuscles.length === 0) return;
    setSaving(true);
    await base44.entities.Exercise.create({
      name: name.trim(),
      primary_muscle: primaryMuscles,
      secondary_muscles: secondaryMuscles,
      category: category || "other",
    });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    setSaving(false);
    setName("");
    setPrimaryMuscles([]);
    setSecondaryMuscles([]);
    setCategory("");
    onClose();
  };

  const toggleSecondaryMuscle = (muscle) => {
    setSecondaryMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const canSave = name.trim() && primaryMuscles.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold">New Exercise</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Exercise Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Exercise Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Press"
              className="bg-secondary border-0"
            />
          </div>

          {/* Primary Muscles Selection (Multi-select) */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Primary Muscles * (select one or more)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(MUSCLE_HIERARCHY)
                .flatMap((subs) => subs)
                .filter((sub, idx, arr) => arr.indexOf(sub) === idx)
                .map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setPrimaryMuscle((prev) => {
                        if (Array.isArray(prev)) {
                          return prev.includes(sub)
                            ? prev.filter((m) => m !== sub)
                            : [...prev, sub];
                        } else {
                          return [sub];
                        }
                      });
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      (Array.isArray(primaryMuscle) ? primaryMuscle : []).includes(sub)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {sub}
                    {(Array.isArray(primaryMuscle) ? primaryMuscle : []).includes(sub) && (
                      <Check className="w-3 h-3" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          {primaryMuscles.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Secondary Muscles (Optional, multi-select)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(MUSCLE_HIERARCHY)
                  .flatMap((subs) => subs)
                  .filter((sub, idx, arr) => arr.indexOf(sub) === idx)
                  .filter((sub) => !primaryMuscles.includes(sub))
                  .map((sub) => (
                    <button
                      key={sub}
                      onClick={() => toggleSecondaryMuscle(sub)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        secondaryMuscles.includes(sub)
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {sub}
                      {secondaryMuscles.includes(sub) && <Check className="w-3 h-3" />}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Equipment
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    category === c
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full h-11 rounded-xl font-semibold"
        >
          {saving ? "Creating..." : "Create Exercise"}
        </Button>
      </div>
    </div>
  );
}