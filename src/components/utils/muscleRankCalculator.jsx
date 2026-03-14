import { base44 } from "@/api/base44Client";

const RANKS = ["wood", "bronze", "silver", "gold", "emerald", "diamond", "champion", "titan", "olympian"];

const MUSCLE_SCALE = {
  "Quads": 1.0, "Hamstrings": 0.85, "Glutes": 0.9, "Erectors": 1.0,
  "Upper Chest": 0.75, "Mid/Low Chest": 0.8, "Lats": 0.7, "Mid Back": 0.8,
  "Traps": 0.7, "Rear Delt": 0.4, "Front Delt": 0.5, "Side Delt": 0.3,
  "Biceps": 0.45, "Triceps": 0.55, "Calves": 0.6, "Abs": 0.4,
  "Obliques": 0.35, "Adductors": 0.5, "Abductors": 0.45,
  "Wrist Flexor": 0.2, "Brachioradialis": 0.4,
};

const BASE_THRESHOLDS = [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2];

function getRankFromScore(score, muscleName) {
  const scale = MUSCLE_SCALE[muscleName] || 0.7;
  const thresholds = BASE_THRESHOLDS.map(t => t * scale);
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (score >= thresholds[i]) idx = i;
    else break;
  }
  return RANKS[idx];
}

export async function calculateMuscleRanks() {
  const user = await base44.auth.me();
  if (!user) return {};

  // Fetch more logs to get a fuller picture (last 100)
  const logs = await base44.entities.WorkoutLog.filter({ created_by: user.email }, "-finished_at", 100);

  // Step 1: For each exercise (by name), track the BEST impressiveness_score ever logged
  // This prevents penalizing a muscle when a less impressive version of the exercise was done
  const bestScorePerExercise = {};

  logs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (!ex.impressiveness_score || !ex.muscle_group) return;
      const key = `${ex.muscle_group}::${ex.exercise_name || ex.exercise_id}`;
      if (!bestScorePerExercise[key] || ex.impressiveness_score > bestScorePerExercise[key].score) {
        bestScorePerExercise[key] = {
          score: ex.impressiveness_score,
          muscle: ex.muscle_group,
        };
      }
    });
  });

  // Step 2: Group best scores by muscle
  const muscleScores = {};
  Object.values(bestScorePerExercise).forEach(({ muscle, score }) => {
    if (!muscleScores[muscle]) muscleScores[muscle] = [];
    muscleScores[muscle].push(score);
  });

  // Step 3: Rank each muscle using the TOP scores (best up to 5 exercises for that muscle)
  const rankedMuscles = {};
  Object.entries(muscleScores).forEach(([muscle, scores]) => {
    // Sort descending, take top 5, average them
    const top = [...scores].sort((a, b) => b - a).slice(0, 5);
    const avg = top.reduce((a, b) => a + b, 0) / top.length;
    rankedMuscles[muscle] = getRankFromScore(avg, muscle);
  });

  return rankedMuscles;
}