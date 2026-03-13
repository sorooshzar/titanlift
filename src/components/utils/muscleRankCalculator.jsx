import { base44 } from "@/api/base44Client";

export async function calculateMuscleRanks() {
  try {
    // Fetch all workout logs
    const logs = await base44.entities.WorkoutLog.list("-finished_at", 200);
    
    const muscleRanks = {};
    
    // Collect the MOST RECENT rank for each muscle
    // This way we use the backend-calculated ranks directly
    logs.forEach(log => {
      log.exercises?.forEach(ex => {
        const muscle = ex.muscle_group;
        const rank = ex.rank;
        
        // Only store if we haven't seen this muscle yet (most recent first)
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