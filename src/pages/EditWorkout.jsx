import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Save, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Reorder, AnimatePresence } from "framer-motion";
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
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const isDirty = useRef(false);
  const draftKey = `edit-draft-${id}`;

  const { data: template } = useQuery({
    queryKey: ["template-edit", id],
    queryFn: () => base44.entities.WorkoutTemplate.list(),
    enabled: !!id,
    select: (data) => data.find((t) => t.id === id),
  });

  useEffect(() => {
    if (template) {
      // Check if there's a draft version first
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const { name: draftName, exercises: draftExercises } = JSON.parse(draft);
          setName(draftName);
          setExercises(draftExercises);
          isDirty.current = true;
        } catch {
          // Fallback to template if draft is corrupted
          setName(template.name);
          setExercises(template.exercises || []);
          isDirty.current = false;
        }
      } else {
        setName(template.name);
        setExercises(template.exercises || []);
        isDirty.current = false;
      }
    }
  }, [template, draftKey]);

  // Auto-save draft
  useEffect(() => {
    if (isDirty.current && (name || exercises.length > 0)) {
      localStorage.setItem(draftKey, JSON.stringify({ name, exercises }));
    }
  }, [name, exercises, draftKey]);

  const markDirty = (fn) => (...args) => { isDirty.current = true; fn(...args); };

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
    await base44.entities.WorkoutTemplate.update(id, { name, exercises });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    localStorage.removeItem(draftKey);
    isDirty.current = false;
    setSaving(false);
    navigate(createPageUrl("Lifts"));
  };

  const handleClose = () => {
    if (isDirty.current) {
      setShowUnsavedConfirm(true);
    } else {
      navigate(createPageUrl("Lifts"));
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem(draftKey);
    setShowUnsavedConfirm(false);
    navigate(createPageUrl("Lifts"));
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleClose} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            value={name}
            onChange={(e) => { isDirty.current = true; setName(e.target.value); }}
            className="bg-transparent text-center text-sm font-bold focus:outline-none flex-1 mx-4"
            placeholder="Workout Name"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-5 rounded-xl text-sm font-semibold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Exercises — Drag to reorder */}
      <Reorder.Group axis="y" values={exercises} onReorder={(newOrder) => { isDirty.current = true; setExercises(newOrder); }} className="px-4 pt-4 space-y-3">
        <AnimatePresence>
          {exercises.map((exercise, index) => (
            <Reorder.Item key={exercise.exercise_id || index} value={exercise}>
              <ExerciseBlock
                exercise={exercise}
                index={index}
                onChange={(updated) => { isDirty.current = true; handleExerciseChange(index, updated); }}
                onRemove={() => { isDirty.current = true; handleRemoveExercise(index); }}
                isActive={false}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-dashed text-muted-foreground"
          onClick={() => setShowPicker(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </Reorder.Group>

      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(ex) => { isDirty.current = true; handleAddExercise(ex); }}
      />

      {showUnsavedConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUnsavedConfirm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <h2 className="text-base font-bold mb-1">Unsaved Changes</h2>
            <p className="text-sm text-muted-foreground mb-5">You have unsaved changes. Are you sure you want to leave without saving?</p>
            <div className="flex flex-col gap-2">
               <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save & Exit"}</Button>
               <Button variant="destructive" onClick={handleDiscard}>Discard Changes</Button>
               <Button variant="ghost" onClick={() => setShowUnsavedConfirm(false)}>Keep Editing</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}