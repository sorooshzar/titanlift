import React, { createContext, useContext, useState, useCallback } from "react";

const ActiveWorkoutContext = createContext(null);

export function ActiveWorkoutProvider({ children }) {
  const [workout, setWorkout] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [completedLog, setCompletedLog] = useState(null);

  const startWorkout = useCallback((template) => {
    setWorkout({
      name: template?.name || "Quick Workout",
      template_id: template?.id || null,
      exercises: (template?.exercises || []).map(ex => ({
        ...ex,
        sets: (ex.sets || []).map(s => ({ ...s, completed: false })),
      })),
      startTime: new Date().toISOString(),
    });
    setMinimized(false);
  }, []);

  const endWorkout = useCallback((logData) => {
    setWorkout(null);
    setMinimized(false);
    if (logData) setCompletedLog(logData);
  }, []);

  // Safe updater — always uses functional form so callers get latest state
  const updateWorkout = useCallback((updater) => {
    setWorkout(prev => {
      if (!prev) return prev;
      return typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
    });
  }, []);

  const addExercisesToWorkout = useCallback((exercisesToAdd) => {
    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = exercisesToAdd.map((exercise, i) => ({
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.primary_muscle,
        color: null,
        superset_group: null,
        notes: exercise.notes || null,
        order: prev.exercises.length + i,
        sets: [{ type: "working", weight: 0, reps: 0, rir: 2, completed: false }],
      }));
      return { ...prev, exercises: [...prev.exercises, ...newExercises] };
    });
  }, []);

  const clearCompletedLog = useCallback(() => setCompletedLog(null), []);
  const minimize = useCallback(() => setMinimized(true), []);
  const expand = useCallback(() => setMinimized(false), []);

  return (
    <ActiveWorkoutContext.Provider value={{
      workout, setWorkout, updateWorkout, addExercisesToWorkout,
      minimized, startWorkout, endWorkout, minimize, expand,
      completedLog, clearCompletedLog,
    }}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  return useContext(ActiveWorkoutContext);
}