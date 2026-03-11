// Hierarchical muscle group mapping - ordered as specified
export const MUSCLE_HIERARCHY = {
  Chest: ["Upper Chest", "Mid/Low Chest"],
  Back: ["Lats", "Traps", "Mid Back", "Erectors"],
  Shoulders: ["Front Delt", "Side Delt", "Rear Delt"],
  Arms: ["Biceps", "Triceps"],
  Legs: ["Quads", "Hamstrings", "Glutes", "Adductors", "Abductors", "Calves"],
  Core: ["Abs", "Obliques", "Erectors"],
  Forearms: ["Wrist Flexor", "Wrist Extensor", "Brachioradialis"],
  Neck: ["Neck"],
};

// Get all sub-sections for filtering
export const getAllSubSections = () => {
  const subs = [];
  Object.values(MUSCLE_HIERARCHY).forEach(children => {
    subs.push(...children);
  });
  return [...new Set(subs)]; // Remove duplicates (e.g., Erectors)
};

// Get parent groups (mains)
export const getMainGroups = () => Object.keys(MUSCLE_HIERARCHY);

// Get children for a given main group
export const getSubsectionsForMain = (mainGroup) => {
  return MUSCLE_HIERARCHY[mainGroup] || [];
};

// Get main groups that contain a subsection
export const getMainGroupsForSubsection = (subsection) => {
  return Object.entries(MUSCLE_HIERARCHY)
    .filter(([_, subs]) => subs.includes(subsection))
    .map(([main, _]) => main);
};

// Normalize subsection to lowercase with underscores for filtering
export const normalizeSubsection = (sub) => {
  return sub.toLowerCase().replace(/\s+/g, "_");
};

// Denormalize back to display name
export const denormalizeSubsection = (normalized) => {
  const all = getAllSubSections();
  return all.find(sub => normalizeSubsection(sub) === normalized) || normalized;
};