import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RANKS = [
  { name: "wood",     label: "Wood" },
  { name: "bronze",   label: "Bronze" },
  { name: "silver",   label: "Silver" },
  { name: "gold",     label: "Gold" },
  { name: "platinum", label: "Platinum" },
  { name: "diamond",  label: "Diamond" },
  { name: "champion", label: "Champion" },
  { name: "titan",    label: "Titan" },
  { name: "olympian", label: "Olympian" },
];

// Thresholds for impressiveness score (after applying gender-adjusted factors)
// Ranges from beginner to world-class
const BASE_THRESHOLDS = [0.2, 0.5, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 99];

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

// Impressiveness factors: multiply the (e1rm / bodyweight) ratio
// Compound lifts (low factor) | Isolation (medium) | Weak isolation (high)
// This creates realistic progressions where compound lifts are hardest to impress with
const IMPRESSIVENESS_FACTORS = {
  // Powerlifts & Main Compounds (0.5-1.0x multiplier)
  "Barbell Deadlift (Conventional)": { male: 0.5, female: 0.5 },
  "Barbell Deadlift (Sumo)": { male: 0.55, female: 0.55 },
  "Barbell Squat (High Bar)": { male: 0.65, female: 0.65 },
  "Barbell Squat (Low Bar)": { male: 0.60, female: 0.60 },
  "Barbell Bench Press": { male: 0.7, female: 0.7 },
  
  // Secondary Compounds (0.8-1.2x)
  "Barbell Row (Bent-Over)": { male: 0.85, female: 0.85 },
  "Dumbbell Bench Press": { male: 0.9, female: 0.9 },
  "Incline Barbell Press": { male: 1.0, female: 1.0 },
  "Barbell Overhead Press (Standing)": { male: 1.1, female: 1.1 },
  "Hip Thrust (Barbell)": { male: 0.8, female: 0.8 },
  "Romanian Deadlift (Barbell)": { male: 0.75, female: 0.75 },
  
  // Pull Variations (0.9-1.3x)
  "Pull-up (Bodyweight)": { male: 1.0, female: 1.2 },
  "Chin-up (Bodyweight)": { male: 1.0, female: 1.2 },
  "Weighted Pull-up": { male: 0.9, female: 1.1 },
  "Lat Pulldown (Machine)": { male: 1.2, female: 1.3 },
  "Seated Cable Row": { male: 1.15, female: 1.2 },
  
  // Machine Movements (1.5-2.0x)
  "Leg Press (Machine)": { male: 2.0, female: 2.0 },
  "Leg Extension (Machine)": { male: 2.0, female: 2.0 },
  "Leg Curl (Machine)": { male: 1.8, female: 1.8 },
  "Calf Raise (Standing)": { male: 1.5, female: 1.5 },
  
  // Isolation - Arms (2.5-3.5x multiplier)
  "Barbell Bicep Curl": { male: 2.8, female: 3.0 },
  "Dumbbell Bicep Curl": { male: 3.0, female: 3.2 },
  "Tricep Pushdown (Cable)": { male: 3.0, female: 3.0 },
  "Close-Grip Bench Press": { male: 0.8, female: 0.8 },
  "Overhead Dumbbell Extension": { male: 2.8, female: 3.0 },
  
  // Isolation - Shoulders (2.0-3.0x)
  "Dumbbell Shoulder Press (Seated)": { male: 1.3, female: 1.4 },
  "Dumbbell Lateral Raise": { male: 3.0, female: 3.2 },
  "Dumbbell Front Raise": { male: 2.8, female: 3.0 },
  "Face Pull (Cable)": { male: 2.5, female: 2.5 },
  
  // Other (1.5-2.0x)
  "Good Mornings (Barbell)": { male: 1.2, female: 1.2 },
  "Kettlebell Swing": { male: 1.0, female: 1.0 },
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

function calculateImpressionessScore(e1rm, bodyweightKg, exerciseName, userGender) {
   let factors = IMPRESSIVENESS_FACTORS[exerciseName];

   // If not found, try matching partial name (remove brackets for matching)
   if (!factors) {
     const cleanName = exerciseName.replace(/\[.*?\]/g, '').trim();
     for (const [key, value] of Object.entries(IMPRESSIVENESS_FACTORS)) {
       if (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase())) {
         factors = value;
         break;
       }
     }
   }

   // Default if still not found - use 1.0 (no amplification, just e1rm/bodyweight ratio)
   if (!factors) {
     factors = { male: 1.0, female: 1.0 };
   }

   const factor = userGender === "female" ? factors.female : factors.male;
   const ratio = e1rm / bodyweightKg;
   return ratio * factor;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutLogId, userGender } = await req.json();

    if (!workoutLogId) {
      return Response.json({ error: 'workoutLogId required' }, { status: 400 });
    }

    // Get workout log
    const workoutLog = await base44.entities.WorkoutLog.get(workoutLogId);
    if (!workoutLog) {
      return Response.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Get latest body weight
    const bodyWeights = await base44.entities.BodyWeight.list("-date", 1);
    const bodyweightKg = bodyWeights[0]?.weight || 80;

    // Calculate impressiveness score for each exercise
    const updatedExercises = workoutLog.exercises?.map(ex => {
      const workingSets = ex.sets?.filter(s => s.completed && s.type !== "warmup") || [];
      if (workingSets.length === 0) {
        return { ...ex, impressiveness_score: 0, rank: "wood" };
      }

      // Find highest weight × reps set
      let maxE1rm = 0;
      workingSets.forEach(s => {
        if (s.weight && s.reps && s.reps > 0) {
          const e1rm = s.weight * (1 + s.reps / 30); // Epley
          if (e1rm > maxE1rm) maxE1rm = e1rm;
        }
      });

      const score = calculateImpressionessScore(maxE1rm, bodyweightKg, ex.exercise_name, userGender);
      const rank = getRankFromScore(score, ex.muscle_group);

      return { 
        ...ex, 
        impressiveness_score: Math.round(score * 100) / 100, 
        rank 
      };
    }) || [];

    // Update workout log with impressiveness data
    await base44.entities.WorkoutLog.update(workoutLogId, {
      exercises: updatedExercises
    });

    // Calculate muscle ranks using Power Pool system
    // Pool: last 15 exercises affecting each muscle (primary or secondary)
    // Weight: Primary = 1.0x, Secondary = 0.5x
    // Rank: Average of top 5 weighted scores in the pool
    const allLogs = await base44.entities.WorkoutLog.list("-finished_at", 100);
    const musclePools = {};

    allLogs.forEach(log => {
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
      // Keep only the last 15 entries
      const last15 = pool.slice(0, 15);
      
      // Calculate weighted scores
      const weightedScores = last15.map(entry => entry.score * entry.weight);
      
      // Get top 5 highest weighted scores
      const top5 = weightedScores.sort((a, b) => b - a).slice(0, 5);
      
      // Calculate average of top 5
      const avgTop5 = top5.length > 0 ? top5.reduce((a, b) => a + b, 0) / top5.length : 0;
      
      muscleRanks[muscle] = getRankFromScore(avgTop5, muscle);
    });

    return Response.json({ 
      updatedLog: { ...workoutLog, exercises: updatedExercises },
      muscleRanks 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});