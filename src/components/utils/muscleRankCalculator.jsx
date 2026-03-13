import { base44 } from "@/api/base44Client";

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

const BASE_THRESHOLDS = [0.1, 0.4, 0.7, 1.1, 1.5, 2.0, 2.5, 3.0, 3.5, 99];

const MUSCLE_SCALE = {
  "Quads":           1.0,
  "Hamstrings":      0.85,
  "Glutes":          0.9,
  "Erectors":        1.0,
  "Upper Chest":     0.75,
  "Mid/Low Chest":   0.8,
  "Lats":            0.7,
  "Mid Back":        0.8,
  "Traps":           0.7,
  "Rear Delt":       0.4,
  "Front Delt":      0.5,
  "Side Delt":       0.3,
  "Biceps":          0.45,
  "Triceps":         0.55,
  "Calves":          0.6,
  "Abs":             0.4,
  "Obliques":        0.35,
  "Adductors":       0.5,
  "Abductors":       0.45,
  "Wrist Flexor":    0.2,
  "Brachioradialis": 0.4,
};

function getRankFromScore(score, muscleName) {
  const scale = MUSCLE_SCALE[muscleName] || 0.7;
  const thresholds = BASE_THRESHOLDS.map(t => t * scale);
  
  let rankIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (score >= thresholds[i]) rankIndex = i;
    else break;
  }
  
  return RANKS[rankIndex].name;
}

export async function calculateMuscleRanks() {
  try {
    // Fetch all workout logs
    const logs = await base44.entities.WorkoutLog.list("-finished_at", 200);
    
    const muscleScores = {};

    // Collect impressiveness scores per muscle (last 5)
    logs.forEach(log => {
      log.exercises?.forEach(ex => {
        if (ex.impressiveness_score && ex.muscle_group) {
          if (!muscleScores[ex.muscle_group]) {
            muscleScores[ex.muscle_group] = [];
          }
          muscleScores[ex.muscle_group].push(ex.impressiveness_score);
        }
      });
    });

    // Calculate average of last 5 scores per muscle
    const muscleRanks = {};
    Object.entries(muscleScores).forEach(([muscle, scores]) => {
      const last5 = scores.slice(0, 5);
      if (last5.length > 0) {
        const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
        muscleRanks[muscle] = getRankFromScore(avg, muscle);
      }
    });

    return muscleRanks;
  } catch (error) {
    console.error("Error calculating muscle ranks:", error);
    return {};
  }
}

export function getRankName(rankString) {
  return RANKS.find(r => r.name === rankString)?.name || null;
}