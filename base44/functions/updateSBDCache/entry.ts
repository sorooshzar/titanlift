import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Calculate estimated 1RM using Epley formula
function calcE1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Flexible matchers — catches variations like "Back Squat", "Low Bar Squat", "Bench Press", etc.
const SBD_MATCHERS = {
  squat: (name) => /squat/i.test(name) && !/hack/i.test(name),
  bench: (name) => /bench/i.test(name),
  deadlift: (name) => /deadlift/i.test(name),
};

function getBestFromExercises(exercises) {
  const bests = { squat: 0, bench: 0, deadlift: 0 };
  for (const ex of (exercises || [])) {
    const name = ex.exercise_name || '';
    let key = null;
    if (SBD_MATCHERS.squat(name)) key = 'squat';
    else if (SBD_MATCHERS.bench(name)) key = 'bench';
    else if (SBD_MATCHERS.deadlift(name)) key = 'deadlift';
    if (!key) continue;
    for (const set of (ex.sets || [])) {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        const e1rm = calcE1RM(set.weight, set.reps);
        if (e1rm > bests[key]) bests[key] = e1rm;
      }
    }
  }
  return bests;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { exercises, rebuildFromHistory } = body;

    // Fetch existing cache record
    const existing = await base44.entities.UserSBDCache.filter({ created_by: user.email });
    const current = existing[0] || null;

    let allTimeBests = {
      squat: current?.squat_1rm || 0,
      bench: current?.bench_1rm || 0,
      deadlift: current?.deadlift_1rm || 0,
    };

    // If no cache exists yet OR rebuild requested, scan all historical workout logs
    if (!current || rebuildFromHistory) {
      const allLogs = await base44.entities.WorkoutLog.filter({ created_by: user.email });
      for (const log of allLogs) {
        const bests = getBestFromExercises(log.exercises || []);
        if (bests.squat > allTimeBests.squat) allTimeBests.squat = bests.squat;
        if (bests.bench > allTimeBests.bench) allTimeBests.bench = bests.bench;
        if (bests.deadlift > allTimeBests.deadlift) allTimeBests.deadlift = bests.deadlift;
      }
    }

    // Also factor in the current workout's exercises if provided
    if (exercises && Array.isArray(exercises)) {
      const workoutBests = getBestFromExercises(exercises);
      if (workoutBests.squat > allTimeBests.squat) allTimeBests.squat = workoutBests.squat;
      if (workoutBests.bench > allTimeBests.bench) allTimeBests.bench = workoutBests.bench;
      if (workoutBests.deadlift > allTimeBests.deadlift) allTimeBests.deadlift = workoutBests.deadlift;
    }

    const updates = {
      squat_1rm: Math.round(allTimeBests.squat),
      bench_1rm: Math.round(allTimeBests.bench),
      deadlift_1rm: Math.round(allTimeBests.deadlift),
      updated_at: new Date().toISOString(),
    };

    if (current) {
      await base44.entities.UserSBDCache.update(current.id, updates);
    } else {
      await base44.entities.UserSBDCache.create(updates);
    }

    return Response.json({ updated: true, sbdCache: updates });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});