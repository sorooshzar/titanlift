import { base44 } from "@/api/base44Client";

export async function calculateMuscleRanks() {
  const logs = await base44.entities.WorkoutLog.list("-finished_at", 30);
  const muscleRanks = {};

  logs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (ex.impressiveness_score && ex.muscle_group) {
        if (!muscleRanks[ex.muscle_group]) {
          muscleRanks[ex.muscle_group] = [];
        }
        muscleRanks[ex.muscle_group].push(ex.impressiveness_score);
      }
    });
  });

  const rankedMuscles = {};
  Object.entries(muscleRanks).forEach(([muscle, scores]) => {
    const avgScore = scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(scores.length, 5);
    rankedMuscles[muscle] = getRankFromScore(avgScore, muscle);
  });

  return rankedMuscles;
}

function getRankFromScore(score, muscleName) {
  const RANKS = ["wood", "bronze", "silver", "gold", "platinum", "diamond", "champion", "titan", "olympian"];
  const MUSCLE_SCALE = { "Quads": 1.0, "Hamstrings": 0.85, "Glutes": 0.9, "Erectors": 1.0, "Upper Chest": 0.75, "Mid/Low Chest": 0.8, "Lats": 0.7, "Mid Back": 0.8, "Traps": 0.7, "Rear Delt": 0.4, "Front Delt": 0.5, "Side Delt": 0.3, "Biceps": 0.45, "Triceps": 0.55, "Calves": 0.6, "Abs": 0.4, "Obliques": 0.35, "Adductors": 0.5, "Abductors": 0.45, "Wrist Flexor": 0.2, "Brachioradialis": 0.4 };
  const BASE_THRESHOLDS = [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2];
  const scale = MUSCLE_SCALE[muscleName] || 0.7;
  const thresholds = BASE_THRESHOLDS.map(t => t * scale);
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (score >= thresholds[i]) idx = i;
    else break;
  }
  return RANKS[idx];
}