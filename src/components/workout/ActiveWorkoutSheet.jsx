import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Plus, Check, Timer, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExerciseBlock from "./ExerciseBlock";
import ExercisePicker from "./ExercisePicker";
import { useActiveWorkout } from "@/components/workout/ActiveWorkoutContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import confetti from "canvas-confetti";

function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel, confirmDestructive }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <h2 className="text-base font-bold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground mb-5">{description}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={onConfirm} className={confirmDestructive ? "bg-destructive hover:bg-destructive/90" : ""}>{confirmLabel}</Button>
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ActiveWorkoutSheet() {
  const { workout, setWorkout, minimized, minimize, expand, endWorkout } = useActiveWorkout();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const dragStartY = useRef(null);

  // Load recent workout logs for previous-set data
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 100),
    enabled: !!workout,
  });

  // Load exercises to get saved notes
  const { data: allExercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list(),
    enabled: !!workout,
  });

  // Build a map: exercise_id -> last completed sets array (across all logs, not just last workout)
  const prevSetsMap = {};
  workoutLogs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (ex.exercise_id && !prevSetsMap[ex.exercise_id]) {
        prevSetsMap[ex.exercise_id] = ex.sets || [];
      }
    });
  });

  // Patch saved notes from Exercise entity into workout exercises once per workout session
  const notesInitializedFor = useRef(null);
  useEffect(() => {
    if (!workout || !allExercises.length) return;
    const workoutKey = workout.startTime;
    if (notesInitializedFor.current === workoutKey) return;
    notesInitializedFor.current = workoutKey;
    const exerciseMap = {};
    allExercises.forEach(ex => { exerciseMap[ex.id] = ex; });
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => ({
        ...ex,
        notes: ex.notes || exerciseMap[ex.exercise_id]?.notes || null,
      })),
    }));
  }, [allExercises, workout?.startTime]);

  useEffect(() => {
    if (!workout) return;
    const startTime = new Date(workout.startTime);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [workout?.startTime]);

  if (!workout) return null;

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleAddExercise = (exercise) => {
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.primary_muscle,
        color: null,
        superset_group: null,
        notes: exercise.notes || null,
        order: prev.exercises.length,
        sets: [{ type: "working", weight: 0, reps: 0, rir: 2, completed: false }],
      }],
    }));
  };

  const handleExerciseChange = (index, updated) => {
    setWorkout(prev => {
      const exercises = [...prev.exercises];
      exercises[index] = updated;
      return { ...prev, exercises };
    });
  };

  const handleRemoveExercise = (index) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const doFinish = async () => {
    const finished = new Date();
    const startTime = new Date(workout.startTime);
    const duration = Math.floor((finished - startTime) / 60000);

    let totalVolume = 0;
    let totalSets = 0;
    workout.exercises.forEach(ex => {
      ex.sets?.forEach(s => {
        if (s.completed) {
          totalVolume += (s.weight || 0) * (s.reps || 0);
          totalSets++;
        }
      });
    });

    const logData = {
      name: workout.name,
      template_id: workout.template_id || null,
      started_at: startTime.toISOString(),
      finished_at: finished.toISOString(),
      duration_minutes: duration,
      exercises: workout.exercises,
      total_volume: totalVolume,
      total_sets: totalSets,
    };

    await base44.entities.WorkoutLog.create(logData);
    queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });

    // Confetti
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, ticks: 120 });

    endWorkout(logData);
    navigate(createPageUrl("WorkoutSummary"));
  };

  const handleDragHandleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleDragHandleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - (dragStartY.current || 0);
    if (diff > 60) minimize();
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className="fixed bottom-20 left-0 right-0 z-50 px-3"
      >
        <button
          onClick={expand}
          className="w-full bg-primary text-primary-foreground rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
        >
          <div className="flex-1 text-left">
            <p className="text-sm font-bold truncate">{workout.name}</p>
            <p className="text-xs opacity-75">Tap to resume</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-mono opacity-90">
            <Timer className="w-4 h-4" />
            <span>{formatTime(elapsed)}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-70 -rotate-180" />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="workout-sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Drag handle */}
          <div
            className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
            onTouchStart={handleDragHandleTouchStart}
            onTouchEnd={handleDragHandleTouchEnd}
          >
            <button onClick={minimize} className="w-10 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center justify-between">
              <button onClick={() => setShowCancelConfirm(true)} className="p-1">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="text-center">
                <input
                  value={workout.name}
                  onChange={(e) => setWorkout(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent text-center text-sm font-bold focus:outline-none w-44"
                />
                <div className="flex items-center justify-center gap-1 text-xs text-primary">
                  <Timer className="w-3 h-3" />
                  <span className="font-mono">{formatTime(elapsed)}</span>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowFinishConfirm(true)} className="h-8 px-3 rounded-lg text-xs font-semibold">
                <Check className="w-3.5 h-3.5 mr-1" />
                Finish
              </Button>
            </div>
          </div>

          {/* Exercises - scrollable */}
          <div className="flex-1 overflow-y-auto pt-4 pb-8">
          <div className="max-w-lg mx-auto px-4 space-y-3">
            {workout.exercises.map((exercise, index) => (
              <ExerciseBlock
                key={index}
                exercise={exercise}
                index={index}
                onChange={(updated) => handleExerciseChange(index, updated)}
                onRemove={() => handleRemoveExercise(index)}
                isActive={true}
                previousSets={prevSetsMap[exercise.exercise_id] || []}
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
          </div>

          <ExercisePicker
            open={showPicker}
            onClose={() => setShowPicker(false)}
            onSelect={(ex) => { handleAddExercise(ex); setShowPicker(false); }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Close Workout?"
        description="This will discard your unsaved sets. Are you sure you want to close the workout?"
        confirmLabel="Close Workout"
        cancelLabel="Cancel"
        confirmDestructive
        onConfirm={() => { setShowCancelConfirm(false); endWorkout(); }}
        onCancel={() => setShowCancelConfirm(false)}
      />

      {/* Finish confirmation */}
      <ConfirmDialog
        open={showFinishConfirm}
        title="Complete Workout?"
        description="Are you sure you want to complete this workout and log your sets?"
        confirmLabel="Yes — Log Sets"
        cancelLabel="Return to Workout"
        onConfirm={() => { setShowFinishConfirm(false); doFinish(); }}
        onCancel={() => setShowFinishConfirm(false)}
      />
    </>
  );
}