import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RANKS = [
  { name: "wood",     label: "Wood" },
  { name: "bronze",   label: "Bronze" },
  { name: "silver",   label: "Silver" },
  { name: "gold",     label: "Gold" },
  { name: "emerald",  label: "Emerald" },
  { name: "diamond",  label: "Diamond" },
  { name: "champion", label: "Champion" },
  { name: "titan",    label: "Titan" },
  { name: "olympian", label: "Olympian" },
];

// ─── CANONICAL CONSTANTS ────────────────────────────────────────────────────
// Source of truth: src/components/utils/rankEngine.jsx
// Keep these in sync manually — Deno functions cannot import frontend modules.
// ────────────────────────────────────────────────────────────────────────────
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

const MUSCLE_ANCHOR = {
  "Upper Chest":     "Incline Bench Press",
  "Mid/Low Chest":   "Bench Press",
  "Quads":           "Squat",
  "Hamstrings":      "Romanian Deadlift",
  "Glutes":          "Hip Thrust",
  "Lats":            "Lat Pulldown",
  "Mid Back":        "Barbell Row",
  "Traps":           "Barbell Shrug",
  "Rear Delt":       "Face Pull",
  "Front Delt":      "Overhead Press",
  "Side Delt":       "Lateral Raise",
  "Biceps":          "Barbell Curl",
  "Triceps":         "Tricep Pushdown",
  "Calves":          "Calf Raise",
  "Abs":             "Cable Crunch",
  "Erectors":        "Deadlift",
  "Obliques":        "Weighted Side Bend",
  "Adductors":       "Adductor Machine",
  "Abductors":       "Abductor Machine",
  "Wrist Flexor":    "Wrist Curl",
  "Brachioradialis": "Hammer Curl",
};
// ─────────────────────────────────────────────────────────────────────────────

// Impressiveness factors per exercise
const IMPRESSIVENESS_FACTORS = {
  // Powerlifts & Main Compounds
  "Barbell Deadlift (Conventional)": { male: 0.5, female: 0.5 },
  "Barbell Deadlift (Sumo)": { male: 0.55, female: 0.55 },
  "Barbell Squat (High Bar)": { male: 0.65, female: 0.65 },
  "Barbell Squat (Low Bar)": { male: 0.60, female: 0.60 },
  "Barbell Bench Press": { male: 0.7, female: 0.7 },
  // Secondary Compounds
  "Barbell Row (Bent-Over)": { male: 0.85, female: 0.85 },
  "Dumbbell Bench Press": { male: 0.9, female: 0.9 },
  "Incline Barbell Press": { male: 1.0, female: 1.0 },
  "Barbell Overhead Press (Standing)": { male: 1.1, female: 1.1 },
  "Hip Thrust (Barbell)": { male: 0.8, female: 0.8 },
  "Romanian Deadlift (Barbell)": { male: 0.75, female: 0.75 },
  // Pull Variations
  "Pull-up (Bodyweight)": { male: 1.0, female: 1.2 },
  "Chin-up (Bodyweight)": { male: 1.0, female: 1.2 },
  "Weighted Pull-up": { male: 0.9, female: 1.1 },
  "Lat Pulldown (Machine)": { male: 1.2, female: 1.3 },
  "Seated Cable Row": { male: 1.15, female: 1.2 },
  // Machine Movements
  "Leg Press (Machine)": { male: 2.0, female: 2.0 },
  "Leg Extension (Machine)": { male: 2.0, female: 2.0 },
  "Leg Curl (Machine)": { male: 1.8, female: 1.8 },
  "Calf Raise (Standing)": { male: 1.5, female: 1.5 },
  // Isolation - Arms
  "Barbell Bicep Curl": { male: 2.8, female: 3.0 },
  "Dumbbell Bicep Curl": { male: 3.0, female: 3.2 },
  "Tricep Pushdown (Cable)": { male: 3.0, female: 3.0 },
  "Close-Grip Bench Press": { male: 0.8, female: 0.8 },
  "Overhead Dumbbell Extension": { male: 2.8, female: 3.0 },
  // Isolation - Shoulders
  "Dumbbell Shoulder Press (Seated)": { male: 1.3, female: 1.4 },
  "Dumbbell Lateral Raise": { male: 3.0, female: 3.2 },
  "Dumbbell Front Raise": { male: 2.8, female: 3.0 },
  "Face Pull (Cable)": { male: 2.5, female: 2.5 },
  // Other
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

function getImpressionessFactors(exerciseName) {
  // Exact match first
  if (IMPRESSIVENESS_FACTORS[exerciseName]) return IMPRESSIVENESS_FACTORS[exerciseName];
  // Partial match
  const cleanName = exerciseName.replace(/\[.*?\]/g, '').trim().toLowerCase();
  for (const [key, value] of Object.entries(IMPRESSIVENESS_FACTORS)) {
    if (cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
      return value;
    }
  }
  return { male: 1.0, female: 1.0 };
}

function calculateImpressivenessScore(e1rm, bodyweightKg, exerciseName, userGender) {
  if (!e1rm || !bodyweightKg || bodyweightKg <= 0 || e1rm <= 0) return 0;
  const factors = getImpressionessFactors(exerciseName);
  const factor = userGender === "female" ? factors.female : factors.male;
  const ratio = e1rm / bodyweightKg;
  return ratio * factor;
}

function getBestE1RM(sets) {
  let maxE1rm = 0;
  (sets || []).forEach(s => {
    if (s.completed && s.type !== "warmup" && s.weight > 0 && s.reps > 0) {
      const e1rm = s.weight * (1 + s.reps / 30); // Epley
      if (e1rm > maxE1rm) maxE1rm = e1rm;
    }
  });
  return maxE1rm;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutLogId, userGender, exercises: clientExercises } = await req.json();

    if (!workoutLogId) {
      return Response.json({ error: 'workoutLogId required' }, { status: 400 });
    }

    // Get the just-completed workout log
    const [workoutLog] = await base44.entities.WorkoutLog.filter({ id: workoutLogId });
    if (!workoutLog) {
      return Response.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Get latest body weight — default to 80kg if none logged
    // Load all exercises for muscle group lookup — run in parallel
    const [bodyWeights, allExercises, allLogs] = await Promise.all([
      base44.entities.BodyWeight.filter({ created_by: user.email }, "-date", 1),
      base44.asServiceRole.entities.Exercise.list(null, 500),
      base44.entities.WorkoutLog.filter({ created_by: user.email }, "-finished_at", 200),
    ]);
    const rawBW = bodyWeights[0]?.weight;
    const bodyweightKg = (rawBW && rawBW > 0) ? rawBW : 80;

    // Build exercise id → primary_muscle lookup
    const exerciseMuscleMap = {};
    allExercises.forEach(ex => { exerciseMuscleMap[ex.id] = ex.primary_muscle; });

    // Build a map: exercise_id → best historical e1RM (from ALL logs excluding current)
    const historicalBestE1RM = {};
    allLogs.forEach(log => {
      if (log.id === workoutLogId) return; // skip the just-completed log
      log.exercises?.forEach(ex => {
        const bestE1rm = getBestE1RM(ex.sets);
        if (bestE1rm > 0) {
          const key = ex.exercise_id || ex.exercise_name;
          if (!historicalBestE1RM[key] || bestE1rm > historicalBestE1RM[key]) {
            historicalBestE1RM[key] = bestE1rm;
          }
        }
      });
    });

    // Use client-provided exercises (live data with completed sets) if available, else DB copy
    const sourceExercises = clientExercises || workoutLog.exercises || [];

    // Calculate impressiveness score for each exercise in the new log
    const updatedExercises = sourceExercises.map(ex => {
      // Enrich muscle_group from Exercise entity if missing
      if (!ex.muscle_group && ex.exercise_id) {
        ex = { ...ex, muscle_group: exerciseMuscleMap[ex.exercise_id] || null };
      }
      const workingSets = (ex.sets || []).filter(s => s.completed && s.type !== "warmup");
      if (workingSets.length === 0) {
        return { ...ex, impressiveness_score: 0, rank: "wood", is_anchor_lift: false };
      }

      const maxE1rm = getBestE1RM(ex.sets);
      if (maxE1rm === 0) return { ...ex, impressiveness_score: 0, rank: "wood", is_anchor_lift: false };

      const score = calculateImpressivenessScore(maxE1rm, bodyweightKg, ex.exercise_name, userGender || user.sex || "male");
      const rank = getRankFromScore(score, ex.muscle_group);

      // Anchor lift: check if this exercise matches the canonical anchor for its muscle
      const anchorKeyword = MUSCLE_ANCHOR[ex.muscle_group];
      const isAnchorLift = anchorKeyword
        ? ex.exercise_name.toLowerCase().includes(anchorKeyword.toLowerCase())
        : false;

      // Personal best detection
      const exKey = ex.exercise_id || ex.exercise_name;
      const prevBest = historicalBestE1RM[exKey] || 0;
      const isPersonalBest = maxE1rm > prevBest;

      return {
        ...ex,
        impressiveness_score: Math.round(score * 100) / 100,
        rank,
        is_anchor_lift: isAnchorLift,
        is_personal_best: isPersonalBest,
        best_e1rm: Math.round(maxE1rm * 10) / 10,
      };
    });

    // Persist updated exercises back to the log (use user-scoped client to satisfy RLS)
    await base44.entities.WorkoutLog.update(workoutLogId, {
      exercises: updatedExercises,
    });

    // Recalculate muscle ranks using Power Pool system
    // Pool: ALL logs (including new one), primary muscle = 1.0x, secondary = 0.5x
    const musclePools = {};

    // Include newly computed exercises in the pool
    const allLogsWithNew = [
      { ...workoutLog, exercises: updatedExercises },
      ...allLogs.filter(l => l.id !== workoutLogId),
    ];

    allLogsWithNew.forEach(log => {
      (log.exercises || []).forEach(ex => {
        if (!ex.impressiveness_score || !ex.muscle_group) return;

        // Primary muscle: full weight
        if (!musclePools[ex.muscle_group]) musclePools[ex.muscle_group] = [];
        musclePools[ex.muscle_group].push(ex.impressiveness_score);

        // Secondary muscles: half weight
        (ex.secondary_muscles || []).forEach(muscle => {
          if (!musclePools[muscle]) musclePools[muscle] = [];
          musclePools[muscle].push(ex.impressiveness_score * 0.5);
        });
      });
    });

    // Rank each muscle: top 5 of last 15 entries averaged
    const muscleRanks = {};
    Object.entries(musclePools).forEach(([muscle, pool]) => {
      const last15 = pool.slice(0, 15);
      const top5 = [...last15].sort((a, b) => b - a).slice(0, 5);
      const avg = top5.length > 0 ? top5.reduce((a, b) => a + b, 0) / top5.length : 0;
      muscleRanks[muscle] = getRankFromScore(avg, muscle);
    });

    // Persist muscle ranks to UserMuscleRank entity
    const existing = await base44.entities.UserMuscleRank.filter({ created_by: user.email }, null, 1000);
    await Promise.all(existing.map(e => base44.entities.UserMuscleRank.delete(e.id)));
    await Promise.all(
      Object.entries(muscleRanks).map(([muscle, rank]) =>
        base44.entities.UserMuscleRank.create({ muscle, rank })
      )
    );

    return Response.json({
      updatedLog: { ...workoutLog, exercises: updatedExercises },
      muscleRanks,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});