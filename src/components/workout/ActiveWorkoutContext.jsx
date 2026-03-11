import React, { createContext, useContext, useState } from "react";

const ActiveWorkoutContext = createContext(null);

export function ActiveWorkoutProvider({ children }) {
  const [workout, setWorkout] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [completedLog, setCompletedLog] = useState(null);

  const startWorkout = (template) => {
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
  };

  const endWorkout = (logData) => {
    setWorkout(null);
    setMinimized(false);
    if (logData) setCompletedLog(logData);
  };

  const clearCompletedLog = () => setCompletedLog(null);

  const minimize = () => setMinimized(true);
  const expand = () => setMinimized(false);

  return (
    <ActiveWorkoutContext.Provider value={{ workout, setWorkout, minimized, startWorkout, endWorkout, minimize, expand, completedLog, clearCompletedLog }}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  return useContext(ActiveWorkoutContext);
}

export function useActiveWorkout() {
  return useContext(ActiveWorkoutContext);
}