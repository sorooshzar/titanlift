import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useWorkoutFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: () => base44.entities.WorkoutFolder.list("order", 100),
  });
}

export function useWorkoutTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.WorkoutTemplate.list("order", 100),
  });
}

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 500),
  });
}

export function useWorkoutLogs() {
  return useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });
}