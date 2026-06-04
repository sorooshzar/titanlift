import React from "react";
import { MuscleHighlighter } from "react-muscle-highlighter";

const RANK_COLORS = {
  wood: "#B8860B",
  bronze: "#CD7F32",
  silver: "#E8E8E8",
  gold: "#FFD700",
  emerald: "#50C878",
  diamond: "#00CED1",
  champion: "#9370DB",
  titan: "#FF6B6B",
  olympian: "#FF8C42",
};

const MUSCLE_GROUPS = {
  // Upper body
  chest: ["Chest"],
  lats: ["Lats"],
  shoulders: ["Shoulders"],
  biceps: ["Biceps"],
  triceps: ["Triceps"],
  forearms: ["Forearms"],
  traps: ["Traps"],
  // Lower body
  quads: ["Quads"],
  hamstrings: ["Hamstrings"],
  glutes: ["Glutes"],
  calves: ["Calves"],
  // Core
  abs: ["Abs"],
};

export default function FriendBodyModel({ nutritionRanks = [] }) {
  // Build muscle highlight map
  const highlightedMuscles = {};
  const muscleToRank = {};

  nutritionRanks?.forEach(rank => {
    const muscleKey = rank.muscle?.toLowerCase().replace(/\s+/g, '');
    const color = RANK_COLORS[rank.rank] || "#666";
    
    // Find matching muscle group
    Object.entries(MUSCLE_GROUPS).forEach(([key, muscles]) => {
      if (muscles.some(m => m.toLowerCase().includes(rank.muscle?.toLowerCase()))) {
        highlightedMuscles[key] = { color };
        muscleToRank[key] = rank;
      }
    });
  });

  return (
    <div className="flex gap-4">
      {/* Body Model */}
      <div className="flex-1">
        <MuscleHighlighter
          muscles={highlightedMuscles}
          isBodyPart={true}
          side="front"
          scale={1}
        />
      </div>

      {/* Ranks List */}
      <div className="w-32 space-y-2 overflow-y-auto">
        {nutritionRanks && nutritionRanks.length > 0 ? (
          nutritionRanks.map((rank, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl p-2.5 text-center"
            >
              <p className="text-xs font-bold text-foreground mb-1">
                {rank.muscle}
              </p>
              <div
                className="h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: RANK_COLORS[rank.rank] || "#666" }}
              >
                {rank.rank}
              </div>
              {rank.impressiveness_score && (
                <p className="text-[9px] text-muted-foreground mt-1">
                  {Math.round(rank.impressiveness_score)}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No ranks yet
          </p>
        )}
      </div>
    </div>
  );
}