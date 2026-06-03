import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createSuperset } from "./supersetUtils";
import { userStorage } from "@/components/utils/userStorage";

export function getRestDurationForSet(setType, movementType) {
  if (setType === "warmup") {
    return parseInt(userStorage.getItem("gym-warmup-rest") || "60");
  }
  if (movementType === "compound") {
    return parseInt(userStorage.getItem("gym-compound-rest") || "180");
  }
  return parseInt(userStorage.getItem("gym-isolation-rest") || "90");
}

const STORAGE_KEY = "titanlift-active-workout";

const ActiveWorkoutContext = createContext(null);

export function ActiveWorkoutProvider({ children }) {
  const [workout, setWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [minimized, setMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) !== null : false;
    } catch {
      return false;
    }
  });
  const [completedLog, setCompletedLog] = useState(null);

  // Persist workout to localStorage on every change
  useEffect(() => {
    if (workout) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workout));
    }
  }, [workout]);

  const startWorkout = useCallback((template) => {
    const session = {
      name: template?.name || "Quick Workout",
      template_id: template?.id || null,
      exercises: (template?.exercises || []).map(ex => ({
        ...ex,
        sets: (ex.sets || []).map(s => ({
          ...s,
          completed: false,
          rest_duration: s.rest_duration_locked ? s.rest_duration : getRestDurationForSet(s.type, ex.movement_type),
          rest_duration_locked: s.rest_duration_locked ?? false,
        })),
      })),
      startTime: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setWorkout(session);
    setMinimized(false);
  }, []);

  const endWorkout = useCallback((logData) => {
    localStorage.removeItem(STORAGE_KEY);
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

  const addExercisesToWorkout = useCallback((exercisesToAdd, asSuperset = false) => {
    setWorkout(prev => {
      if (!prev) return prev;
      const newExercises = exercisesToAdd.map((exercise, i) => ({
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        muscle_group: exercise.primary_muscle,
        movement_type: exercise.movement_type || null,
        color: null,
        superset_group: null,
        notes: exercise.notes || null,
        order: prev.exercises.length + i,
        sets: [
          { type: "warmup",  weight: 0, reps: 10, rir: 4, completed: false, rest_duration: getRestDurationForSet("warmup", exercise.movement_type), rest_duration_locked: false },
          { type: "working", weight: 0, reps: 8,  rir: 2, completed: false, rest_duration: getRestDurationForSet("working", exercise.movement_type), rest_duration_locked: false },
        ],
      }));
      const combined = [...prev.exercises, ...newExercises];
      if (asSuperset && newExercises.length >= 2) {
        const indices = Array.from({ length: newExercises.length }, (_, i) => prev.exercises.length + i);
        return { ...prev, exercises: createSuperset(combined, indices) };
      }
      return { ...prev, exercises: combined };
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