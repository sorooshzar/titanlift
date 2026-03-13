import { base44 } from "@/api/base44Client";

export async function calculateMuscleRanks() {
  try {
    // Fetch muscle ranks from user entity (calculated by backend)
    const user = await base44.auth.me();
    if (user?.muscle_ranks) {
      return user.muscle_ranks;
    }
    
    // Fallback: collect from recent exercise ranks
    const logs = await base44.entities.WorkoutLog.list("-finished_at", 200);
    const muscleRanks = {};
    
    logs.forEach(log => {
      log.exercises?.forEach(ex => {
        const muscle = ex.muscle_group;
        const rank = ex.rank;
        
        if (muscle && rank && !muscleRanks[muscle]) {
          muscleRanks[muscle] = rank;
        }
      });
    });

    return muscleRanks;
  } catch (error) {
    console.error("Error calculating muscle ranks:", error);
    return {};
  }
}