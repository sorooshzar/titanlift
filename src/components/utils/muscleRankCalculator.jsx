import { base44 } from "@/api/base44Client";

export async function calculateMuscleRanks() {
  try {
    // Fetch all workout logs to compute muscle ranks locally using Power Pool logic
    const logs = await base44.entities.WorkoutLog.list("-finished_at", 100);
    
    // Build muscle pools: last 15 exercises per muscle (primary 1.0x, secondary 0.5x)
    const musclePools = {};
    
    logs.forEach(log => {
      log.exercises?.forEach(ex => {
        if (ex.impressiveness_score && ex.muscle_group) {
          // Primary muscle: 1.0x weight
          if (!musclePools[ex.muscle_group]) {
            musclePools[ex.muscle_group] = [];
          }
          musclePools[ex.muscle_group].push({
            score: ex.impressiveness_score,
            weight: 1.0
          });

          // Secondary muscles: 0.5x weight
          const secondaryMuscles = ex.secondary_muscles || [];
          secondaryMuscles.forEach(muscle => {
            if (!musclePools[muscle]) {
              musclePools[muscle] = [];
            }
            musclePools[muscle].push({
              score: ex.impressiveness_score,
              weight: 0.5
            });
          });
        }
      });
    });

    // Calculate rank: average of top 5 weighted scores in pool of 15
    const muscleRanks = {};
    Object.entries(musclePools).forEach(([muscle, pool]) => {
      const last15 = pool.slice(0, 15);
      const weightedScores = last15.map(entry => entry.score * entry.weight);
      const top5 = weightedScores.sort((a, b) => b - a).slice(0, 5);
      const avgTop5 = top5.length > 0 ? top5.reduce((a, b) => a + b, 0) / top5.length : 0;
      
      // Use getRankFromScore to determine rank name
      muscleRanks[muscle] = getRankFromScore(avgTop5, muscle);
    });

    return muscleRanks;
  } catch (error) {
    console.error("Error calculating muscle ranks:", error);
    return {};
  }
}

function getRankFromScore(score, muscleName) {
  const RANKS = [
    { name: "wood" },
    { name: "bronze" },
    { name: "silver" },
    { name: "gold" },
    { name: "platinum" },
    { name: "diamond" },
    { name: "champion" },
    { name: "titan" },
    { name: "olympian" },
  ];
  
  const MUSCLE_SCALE = {
    "Quads": 1.0, "Hamstrings": 0.85, "Glutes": 0.9, "Erectors": 1.0,
    "Upper Chest": 0.75, "Mid/Low Chest": 0.8, "Lats": 0.7, "Mid Back": 0.8,
    "Traps": 0.7, "Rear Delt": 0.4, "Front Delt": 0.5, "Side Delt": 0.3,
    "Biceps": 0.45, "Triceps": 0.55, "Calves": 0.6, "Abs": 0.4,
    "Obliques": 0.35, "Adductors": 0.5, "Abductors": 0.45,
    "Wrist Flexor": 0.2, "Brachioradialis": 0.4,
  };

  const BASE_THRESHOLDS = [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 99];
  const scale = MUSCLE_SCALE[muscleName] || 0.7;
  const thresholds = BASE_THRESHOLDS.map(t => t * scale);
  
  let rankIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (score >= thresholds[i]) rankIndex = i;
    else break;
  }
  
  return RANKS[rankIndex].name;
}