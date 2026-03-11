import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Save, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExerciseBlock from "../components/workout/ExerciseBlock";
import ExercisePicker from "../components/workout/ExercisePicker";

export default function EditWorkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: template } = useQuery({
    queryKey: ["template-edit", id],
    queryFn: () => base44.entities.WorkoutTemplate.list(),
    enabled: !!id,
    select: (data) => data.find((t) => t.id === id),
  });

  useEffect(() => {
    if (template) {
      setName(template.name);
      setExercises(template.exercises || []);
    }
  }, [template]);

  const handleAddExercise = (exercise) => {
    setExercises([
      ...exercises,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.muscle_group,
        color: null,
        superset_group: null,
        order: exercises.length,
        sets: [{ type: "working", weight: 0, reps: 0, rir: 2 }],
      },
    ]);
  };

  const handleExerciseChange = (index, updated) => {
    const newExercises = [...exercises];
    newExercises[index] = updated;
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.WorkoutTemplate.update(id, {
      name,
      exercises,
    });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    setSaving(false);
    navigate(createPageUrl("Workouts"));
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl("Workouts"))} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent text-center text-sm font-bold focus:outline-none flex-1 mx-4"
            placeholder="Workout Name"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 px-3 rounded-lg text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {saving ? "..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Exercises */}
      <div className="px-4 pt-4 space-y-3">
        {exercises.map((exercise, index) => (
          <ExerciseBlock
            key={index}
            exercise={exercise}
            index={index}
            onChange={(updated) => handleExerciseChange(index, updated)}
            onRemove={() => handleRemoveExercise(index)}
            isActive={false}
          />
        ))}

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-dashed text-muted-foreground"
          onClick={() => setShowPicker(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}