import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendId } = await req.json();

    if (!friendId) {
      return Response.json({ error: 'Missing friendId' }, { status: 400 });
    }

    // Use service role to bypass RLS
    const workoutLogs = await base44.asServiceRole.entities.WorkoutLog.filter({
      created_by_id: friendId
    });

    const bodyWeights = await base44.asServiceRole.entities.BodyWeight.filter({
      created_by_id: friendId
    });

    const nutritionRanks = await base44.asServiceRole.entities.UserMuscleRank.filter({
      created_by_id: friendId
    });

    return Response.json({
      workoutLogs,
      bodyWeights,
      nutritionRanks
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});