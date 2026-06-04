import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function getLevelData(volume) {
  if (!volume || volume <= 0) return { level: 1, xpIntoLevel: 0, xpNeeded: 500, progress: 0 };
  let level = 1;
  let xpUsed = 0;
  while (level <= 999) {
    const xpNeeded = Math.floor(Math.pow(level, 1.5) * 500);
    if (xpNeeded <= 0) break;
    if (xpUsed + xpNeeded > volume) {
      return { level, xpIntoLevel: volume - xpUsed, xpNeeded, progress: Math.min((volume - xpUsed) / xpNeeded, 1) };
    }
    xpUsed += xpNeeded;
    level++;
  }
  return { level: 999, xpIntoLevel: 0, xpNeeded: 1, progress: 1 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendEmail } = await req.json();

    if (!friendEmail) {
      return Response.json({ error: 'Missing friendEmail' }, { status: 400 });
    }

    // Use service role to bypass RLS
    const workoutLogs = await base44.asServiceRole.entities.WorkoutLog.filter({
      created_by: friendEmail
    });

    const bodyWeights = await base44.asServiceRole.entities.BodyWeight.filter({
      created_by: friendEmail
    });

    const nutritionRanks = await base44.asServiceRole.entities.UserMuscleRank.filter({
      created_by: friendEmail
    });

    // Calculate total volume and XP
    const totalVolume = (workoutLogs || []).reduce((sum, log) => sum + (log.total_volume || 0), 0);
    const xp = getLevelData(totalVolume);

    return Response.json({
      workoutLogs,
      bodyWeights,
      nutritionRanks,
      totalVolume,
      xp
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});