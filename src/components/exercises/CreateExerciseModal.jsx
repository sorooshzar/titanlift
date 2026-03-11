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
  const [primaryMuscle, setPrimaryMuscle] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState([]);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedMainGroup, setSelectedMainGroup] = useState("");
  const queryClient = useQueryClient();

  if (!open) return null;

  // Get available subsections for the selected main group
  const availableSubsections = selectedMainGroup ? getSubsectionsForMain(selectedMainGroup) : [];

  const handleSave = async () => {
    if (!name.trim() || !primaryMuscle) return;
    setSaving(true);
    await base44.entities.Exercise.create({
      name: name.trim(),
      primary_muscle: primaryMuscle,
      secondary_muscles: secondaryMuscles,
      category: category || "other",
    });
    queryClient.invalidateQueries({ queryKey: ["exercises"] });
    setSaving(false);
    setName("");
    setPrimaryMuscle("");
    setSecondaryMuscles([]);
    setCategory("");
    setSelectedMainGroup("");
    onClose();
  };

  const toggleSecondaryMuscle = (muscle) => {
    setSecondaryMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const canSave = name.trim() && primaryMuscle;

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

          {/* Primary Muscle Selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Primary Muscle *
            </label>
            <div className="space-y-3">
              {/* Main Group Selection */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                  Select Muscle Group
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(MUSCLE_HIERARCHY).map((mainGroup) => (
                    <button
                      key={mainGroup}
                      onClick={() => {
                        setSelectedMainGroup(mainGroup);
                        setPrimaryMuscle("");
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedMainGroup === mainGroup
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {mainGroup}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subsection Selection */}
              {availableSubsections.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                    Select Sub-section
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSubsections.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setPrimaryMuscle(sub)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          primaryMuscle === sub
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Muscles */}
          {primaryMuscle && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Secondary Muscles (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MUSCLE_HIERARCHY)
                  .flatMap(([_, subs]) => subs)
                  .filter((sub) => sub !== primaryMuscle)
                  .filter((sub, idx, arr) => arr.indexOf(sub) === idx) // Remove duplicates
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