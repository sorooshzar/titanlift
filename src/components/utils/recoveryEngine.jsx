/**
 * Science-based muscle recovery engine (SRA curve model)
 * 
 * Fatigue score per session = sum(reps × intensity_multiplier) per muscle
 * Decays exponentially with a half-life specific to each muscle group.
 * Multiple sessions accumulate. Recovery state mapped from remaining fatigue.
 */

// Half-lives in hours — based on SRA research & Israetel volume work
const HALF_LIVES = {
  chest:      60,   // ~2.5 days
  back:       72,   // ~3 days
  lats:       72,
  traps:      48,
  shoulders:  36,   // ~1.5 days (smaller muscles, recover faster)
  biceps:     48,
  triceps:    48,
  forearms:   24,
  quads:      72,   // large compound — takes longest
  hamstrings: 84,   // very demanding, prone to soreness
  glutes:     84,
  calves:     36,
  abs:        36,
  core:       36,
};

// RIR → relative intensity multiplier
function rirToIntensity(rir) {
  if (rir == null) return 0.75; // unknown — assume moderate
  if (rir === 0)   return 1.0;  // absolute failure
  if (rir === 1)   return 0.9;
  if (rir === 2)   return 0.8;
  if (rir === 3)   return 0.65;
  return 0.5;                   // RIR 4+ — easy work, low fatigue
}

// Fatigue thresholds — calibrated to typical session:
// 3 sets × 10 reps × 0.8 intensity = 24 fatigue units before decay
const THRESHOLDS = {
  light:    8,
  moderate: 20,
  heavy:    38,
  sore:     60,
};

export function computeRecovery(workoutLogs) {
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000; // only look at last 7 days

  // Accumulated decayed fatigue per muscle group (keyed by lowercase group name)
  const fatigue = {};

  workoutLogs.forEach(log => {
    const logTime = new Date(log.finished_at || log.started_at || log.created_date).getTime();
    if (logTime < cutoff) return;

    const hoursAgo = (now - logTime) / (1000 * 60 * 60);

    log.exercises?.forEach(ex => {
      const muscle = ex.muscle_group?.toLowerCase();
      if (!muscle) return;

      const halfLife = HALF_LIVES[muscle] || 48;
      // Exponential decay: remaining = initial × e^(-ln2 × t / halfLife)
      const decayFactor = Math.exp((-0.693 * hoursAgo) / halfLife);

      let sessionFatigue = 0;
      ex.sets?.forEach(s => {
        if (!s.completed) return;
        const reps = s.reps || 0;
        const intensity = rirToIntensity(s.rir != null ? s.rir : null);
        sessionFatigue += reps * intensity;
      });

      fatigue[muscle] = (fatigue[muscle] || 0) + sessionFatigue * decayFactor;
    });
  });

  // Map fatigue score → recovery state
  const recovery = {};
  Object.entries(fatigue).forEach(([muscle, score]) => {
    if (score >= THRESHOLDS.sore)     recovery[muscle] = "sore";
    else if (score >= THRESHOLDS.heavy)    recovery[muscle] = "heavy";
    else if (score >= THRESHOLDS.moderate) recovery[muscle] = "moderate";
    else if (score >= THRESHOLDS.light)    recovery[muscle] = "light";
    else                                   recovery[muscle] = "fresh";
  });

  return recovery; // e.g. { chest: "moderate", shoulders: "fresh", quads: "heavy" }
}