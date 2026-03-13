import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Plus, Check, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExerciseBlock from "../components/workout/ExerciseBlock";
import ExercisePicker from "../components/workout/ExercisePicker";

export default function ActiveWorkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("templateId");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [workoutName, setWorkoutName] = useState("Quick Workout");
  const [exercises, setExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [startTime] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Load template if provided
  const { data: template } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => base44.entities.WorkoutTemplate.list(),
    enabled: !!templateId,
    select: (data) => data.find((t) => t.id === templateId),
  });

  useEffect(() => {
    if (template) {
      setWorkoutName(template.name);
      setExercises(
        (template.exercises || []).map((ex) => ({
          ...ex,
          sets: (ex.sets || []).map((s) => ({ ...s, completed: false })),
        }))
      );
    }
  }, [template]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleAddExercise = (exercise) => {
    setExercises([
      ...exercises,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.primary_muscle,
        secondary_muscles: exercise.secondary_muscles || [],
        color: null,
        superset_group: null,
        order: exercises.length,
        sets: [{ type: "working", weight: 0, reps: 0, rir: 2, completed: false }],
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

  const handleFinish = async () => {
    const finished = new Date();
    const duration = Math.floor((finished - startTime) / 60000);
    
    let totalVolume = 0;
    let totalSets = 0;
    exercises.forEach((ex) => {
      ex.sets?.forEach((s) => {
        if (s.completed) {
          totalVolume += (s.weight || 0) * (s.reps || 0);
          totalSets++;
        }
      });
    });

    await base44.entities.WorkoutLog.create({
      name: workoutName,
      template_id: templateId || null,
      started_at: startTime.toISOString(),
      finished_at: finished.toISOString(),
      duration_minutes: duration,
      exercises: exercises,
      total_volume: totalVolume,
      total_sets: totalSets,
    });

    queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
    navigate(createPageUrl("Lifts"));
  };

  const handleCancel = () => {
    if (exercises.length > 0) {
      if (!confirm("Discard this workout?")) return;
    }
    navigate(createPageUrl("Lifts"));
  };

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleCancel} className="p-1">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="text-center">
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-transparent text-center text-sm font-bold focus:outline-none w-40"
            />
            <div className="flex items-center justify-center gap-1 text-xs text-primary">
              <Timer className="w-3 h-3" />
              <span className="font-mono">{formatTime(elapsed)}</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleFinish}
            className="h-8 px-3 rounded-lg text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Finish
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
            isActive={true}
          />
        ))}

        {/* Add Exercise Button */}
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