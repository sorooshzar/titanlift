import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Calculate estimated 1RM using Epley formula
function calcE1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

// SBD exercise name matchers
const SBD_MATCHERS = {
  squat: (name) => /barbell squat/i.test(name),
  bench: (name) => /barbell bench press/i.test(name),
  deadlift: (name) => /barbell deadlift/i.test(name),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exercises } = await req.json();

    if (!exercises || !Array.isArray(exercises)) {
      return Response.json({ error: 'Missing exercises array' }, { status: 400 });
    }

    // Find best e1RM for each SBD lift from this workout's completed sets
    const newBests = { squat: 0, bench: 0, deadlift: 0 };

    for (const ex of exercises) {
      const name = ex.exercise_name || '';
      let key = null;
      if (SBD_MATCHERS.squat(name)) key = 'squat';
      else if (SBD_MATCHERS.bench(name)) key = 'bench';
      else if (SBD_MATCHERS.deadlift(name)) key = 'deadlift';

      if (!key) continue;

      for (const set of (ex.sets || [])) {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          const e1rm = calcE1RM(set.weight, set.reps);
          if (e1rm > newBests[key]) newBests[key] = e1rm;
        }
      }
    }

    // Only proceed if at least one SBD exercise was found
    const hasAny = newBests.squat > 0 || newBests.bench > 0 || newBests.deadlift > 0;
    if (!hasAny) {
      return Response.json({ updated: false, reason: 'No SBD exercises found in workout' });
    }

    // Fetch existing cache record for this user
    const existing = await base44.entities.UserSBDCache.filter({ created_by: user.email });
    const current = existing[0] || null;

    // Merge: take the max of old vs new for each lift
    const updates = {
      squat_1rm: Math.round(Math.max(newBests.squat, current?.squat_1rm || 0)),
      bench_1rm: Math.round(Math.max(newBests.bench, current?.bench_1rm || 0)),
      deadlift_1rm: Math.round(Math.max(newBests.deadlift, current?.deadlift_1rm || 0)),
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