import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, ChevronDown } from "lucide-react";
import { getAllSubSections } from "@/components/utils/muscleHierarchy";

const CATEGORIES = ["barbell", "dumbbell", "machine", "smith_machine", "cable", "bodyweight", "other"];

export default function CreateExerciseModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [primaryMuscle, setPrimaryMuscle] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState([]);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!open) return null;

  const allMuscles = getAllSubSections();

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
    onClose();
  };

  const toggleSecondary = (muscle) => {
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
        <div className="flex items-center justify-between sticky top-0 bg-card z-10 pb-1">
          <h2 className="text-lg font-bold">New Exercise</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Exercise Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Exercise Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Dumbbell Press"
              className="bg-secondary border-0"
            />
          </div>

          {/* Primary Muscle — single dropdown */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Primary Muscle *</label>
            <div className="relative">
              <select
                value={primaryMuscle}
                onChange={(e) => {
                  setPrimaryMuscle(e.target.value);
                  setSecondaryMuscles((prev) => prev.filter((m) => m !== e.target.value));
                }}
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm font-medium appearance-none pr-9 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select primary muscle…</option>
                {allMuscles.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Equipment — single dropdown */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Equipment *</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm font-medium capitalize appearance-none pr-9 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select equipment…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Secondary Muscles — multi-select chips */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Secondary Muscles <span className="opacity-60">(optional, select any)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allMuscles
                .filter((m) => m !== primaryMuscle)
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleSecondary(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      secondaryMuscles.includes(m)
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {m}
                    {secondaryMuscles.includes(m) && <Check className="w-3 h-3" />}
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