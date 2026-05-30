// Superset utility helpers

const SUPERSET_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Returns a map of superset_group -> label letter (e.g. 1 -> "A", 2 -> "B")
 * based on order of first appearance in the exercises array.
 */
export function buildSupersetLabelMap(exercises) {
  const map = {};
  let counter = 0;
  exercises.forEach(ex => {
    const g = ex.superset_group;
    if (g && !map[g]) {
      map[g] = SUPERSET_LABELS[counter % SUPERSET_LABELS.length];
      counter++;
    }
  });
  return map;
}

/** Generate a unique superset group ID (numeric timestamp-based) */
export function generateSupersetId() {
  return Date.now();
}

/**
 * Group exercises into superset groups for rendering.
 * Returns array of { supersetId, label, exercises: [{exercise, index}] } | { exercise, index }
 */
export function groupExercisesForRender(exercises, labelMap) {
  const result = [];
  const seen = new Set();

  exercises.forEach((exercise, index) => {
    const g = exercise.superset_group;
    if (!g) {
      result.push({ type: "single", exercise, index });
    } else if (!seen.has(g)) {
      seen.add(g);
      const members = exercises
        .map((ex, i) => ({ exercise: ex, index: i }))
        .filter(({ exercise: ex }) => ex.superset_group === g);
      result.push({ type: "superset", supersetId: g, label: labelMap[g] || "?", members });
    }
  });

  return result;
}

/**
 * Assign a superset group to a set of exercise indices.
 * Returns new exercises array.
 */
export function createSuperset(exercises, indices) {
  const id = generateSupersetId();
  return exercises.map((ex, i) => indices.includes(i) ? { ...ex, superset_group: id } : ex);
}

/**
 * Add an exercise index to an existing superset group.
 */
export function addToSuperset(exercises, index, supersetId) {
  return exercises.map((ex, i) => i === index ? { ...ex, superset_group: supersetId } : ex);
}

/**
 * Remove an exercise from its superset. If superset drops below 2, dissolve entire group.
 */
export function removeFromSuperset(exercises, index) {
  const targetGroup = exercises[index]?.superset_group;
  if (!targetGroup) return exercises;

  const updated = exercises.map((ex, i) => i === index ? { ...ex, superset_group: null } : ex);
  // Count remaining members
  const remaining = updated.filter(ex => ex.superset_group === targetGroup);
  if (remaining.length < 2) {
    // Dissolve
    return updated.map(ex => ex.superset_group === targetGroup ? { ...ex, superset_group: null } : ex);
  }
  return updated;
}

/**
 * Dissolve an entire superset group.
 */
export function dissolveSuperset(exercises, supersetId) {
  return exercises.map(ex => ex.superset_group === supersetId ? { ...ex, superset_group: null } : ex);
}