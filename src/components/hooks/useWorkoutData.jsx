import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

async function getMyEmail() {
  const user = await base44.auth.me();
  return user?.email;
}

export function useWorkoutFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      const email = await getMyEmail();
      return base44.entities.WorkoutFolder.filter({ created_by: email }, "order", 100);
    },
  });
}

export function useWorkoutTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const email = await getMyEmail();
      return base44.entities.WorkoutTemplate.filter({ created_by: email }, "order", 100);
    },
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
    queryFn: async () => {
      const email = await getMyEmail();
      return base44.entities.WorkoutLog.filter({ created_by: email }, "-created_date", 200);
    },
  });
}