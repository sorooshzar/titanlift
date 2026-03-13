import { base44 } from "@/api/base44Client";

export async function calculateMuscleRanks() {
  try {
    // Fetch all UserMuscleRank entries (calculated by backend's Power Pool system)
    const ranks = await base44.entities.UserMuscleRank.list("muscle", 1000);
    const muscleRanks = {};
    
    ranks.forEach(entry => {
      if (entry.muscle && entry.rank) {
        muscleRanks[entry.muscle] = entry.rank;
      }
    });

    return muscleRanks;
  } catch (error) {
    console.error("Error calculating muscle ranks:", error);
    return {};
  }
}