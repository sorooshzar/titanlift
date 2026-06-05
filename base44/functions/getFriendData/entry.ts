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

    // Authorization: only allow viewing data for an accepted friend (or yourself).
    // Without this guard, any authenticated user could read anyone's full training
    // history just by passing their email. Mirrors the client-side friend check.
    if (friendEmail !== user.email) {
      const friendships = await base44.asServiceRole.entities.Friendship.list();
      const isAcceptedFriend = friendships.some(f =>
        f.status === 'accepted' &&
        ((f.requester_email === user.email && f.recipient_email === friendEmail) ||
         (f.requester_email === friendEmail && f.recipient_email === user.email))
      );
      if (!isAcceptedFriend) {
        return Response.json({ error: 'Not authorized to view this user' }, { status: 403 });
      }
    }

    // Use service role to bypass RLS
    const [workoutLogs, bodyWeights, allMuscleRankRecords, allSbdCaches, allUsers] = await Promise.all([
      base44.asServiceRole.entities.WorkoutLog.filter({ created_by: friendEmail }),
      base44.asServiceRole.entities.BodyWeight.filter({ created_by: friendEmail }),
      base44.asServiceRole.entities.UserMuscleRank.list(),
      base44.asServiceRole.entities.UserSBDCache.list(),
      base44.asServiceRole.entities.User.list(),
    ]);

    // Filter in JS — created_by is a system field that may not be filterable directly
    const muscleRankRecords = allMuscleRankRecords.filter(r => r.created_by === friendEmail);
    const sbdCacheList = allSbdCaches.filter(r => r.created_by === friendEmail);

    const sbdCache = sbdCacheList[0] || null;
    const friendUser = allUsers.find(u => u.email === friendEmail) || null;

    // Build muscle rank map: { "Quads": "gold", "Lats": "silver", ... }
    const muscleRanks = muscleRankRecords.reduce((acc, r) => {
      if (r.muscle && r.rank) acc[r.muscle] = r.rank;
      return acc;
    }, {});

    // Calculate total volume and XP
    const totalVolume = (workoutLogs || []).reduce((sum, log) => sum + (log.total_volume || 0), 0);
    const xp = getLevelData(totalVolume);

    return Response.json({
      workoutLogs,
      bodyWeights,
      muscleRanks,
      // keep nutritionRanks as alias for backward compat
      nutritionRanks: muscleRankRecords,
      sbdCache,
      friendUser,
      totalVolume,
      xp
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});