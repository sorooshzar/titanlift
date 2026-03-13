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

const IMPRESSIVENESS_FACTORS = {
  "Barbell Bench Press": { male: 83.72, female: 136.36 },
  "Dumbbell Bench Press": { male: 100.00, female: 166.67 },
  "Incline Barbell Press": { male: 105.88, female: 176.47 },
  "Dumbbell Shoulder Press (Seated)": { male: 163.64, female: 250.00 },
  "Barbell Overhead Press (Standing)": { male: 133.33, female: 214.29 },
  "Dumbbell Lateral Raise": { male: 450.00, female: 600.00 },
  "Dumbbell Front Raise": { male: 360.00, female: 500.00 },
  "Barbell Deadlift (Conventional)": { male: 48.00, female: 75.00 },
  "Barbell Deadlift (Sumo)": { male: 45.57, female: 83.33 },
  "Barbell Squat (High Bar)": { male: 64.29, female: 100.00 },
  "Barbell Squat (Low Bar)": { male: 61.02, female: 93.75 },
  "Leg Press (Machine)": { male: 30.00, female: 42.86 },
  "Barbell Row (Bent-Over)": { male: 97.30, female: 150.00 },
  "Pull-up (Bodyweight)": { male: 100.00, female: 100.00 },
  "Chin-up (Bodyweight)": { male: 100.00, female: 100.00 },
  "Weighted Pull-up": { male: 85.71, female: 90.91 },
  "Lat Pulldown (Machine)": { male: 100.00, female: 150.00 },
  "Seated Cable Row": { male: 128.57, female: 166.67 },
  "Barbell Bicep Curl": { male: 225.00, female: 333.33 },
  "Dumbbell Bicep Curl": { male: 257.14, female: 375.00 },
  "Tricep Pushdown (Cable)": { male: 225.00, female: 214.29 },
  "Close-Grip Bench Press": { male: 92.31, female: 166.67 },
  "Overhead Dumbbell Extension": { male: 300.00, female: 428.57 },
  "Leg Extension (Machine)": { male: 100.00, female: 150.00 },
  "Leg Curl (Machine)": { male: 112.50, female: 166.67 },
  "Calf Raise (Standing)": { male: 72.00, female: 93.75 },
  "Hip Thrust (Barbell)": { male: 60.00, female: 83.33 },
  "Good Mornings (Barbell)": { male: 150.00, female: 214.29 },
  "Romanian Deadlift (Barbell)": { male: 80.00, female: 125.00 },
  "Face Pull (Cable)": { male: 225.00, female: 300.00 },
  "Kettlebell Swing": { male: 180.00, female: 214.29 },
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
  const factors = IMPRESSIVENESS_FACTORS[exerciseName] || { male: 100, female: 100 };
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

    // Calculate muscle ranks (last 5 rule)
    const allLogs = await base44.entities.WorkoutLog.list("-finished_at", 100);
    const muscleScores = {};

    allLogs.forEach(log => {
      log.exercises?.forEach(ex => {
        if (ex.impressiveness_score && ex.muscle_group) {
          if (!muscleScores[ex.muscle_group]) {
            muscleScores[ex.muscle_group] = [];
          }
          muscleScores[ex.muscle_group].push(ex.impressiveness_score);
        }
      });
    });

    // Calculate average of last 5 for each muscle
    const muscleRanks = {};
    Object.entries(muscleScores).forEach(([muscle, scores]) => {
      const last5 = scores.slice(0, 5);
      const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
      muscleRanks[muscle] = getRankFromScore(avg, muscle);
    });

    return Response.json({ 
      updatedLog: { ...workoutLog, exercises: updatedExercises },
      muscleRanks 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});