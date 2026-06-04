import React from "react";
import MuscleModel from "../profile/MuscleModel";
import { RANKS } from "@/components/utils/rankEngine";

const RANK_COLORS_MAP = RANKS.reduce((acc, rank) => {
  acc[rank.name] = rank.color;
  return acc;
}, {});

export default function FriendBodyModel({ nutritionRanks = [] }) {
  // Convert nutritionRanks to muscleRanks format for MuscleModel
  const muscleRanks = nutritionRanks.reduce((acc, rank) => {
    if (rank.muscle && rank.rank) {
      acc[rank.muscle] = rank.rank;
    }
    return acc;
  }, {});

  return (
    <div className="flex gap-6">
      {/* Body Model — left side */}
      <div className="flex-1">
        <MuscleModel muscleRanks={muscleRanks} compact={true} />
      </div>

      {/* Ranks list — right side */}
      <div className="w-40 space-y-2 overflow-y-auto max-h-80">
        <h3 className="text-xs font-bold text-foreground mb-3">Ranks</h3>
        {nutritionRanks && nutritionRanks.length > 0 ? (
          nutritionRanks
            .sort((a, b) => (b.impressiveness_score || 0) - (a.impressiveness_score || 0))
            .map((rank, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-3 text-center"
              >
                <p className="text-xs font-bold text-foreground mb-1.5 capitalize">
                  {rank.muscle}
                </p>
                <div
                  className="h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white mb-1.5"
                  style={{ backgroundColor: RANK_COLORS_MAP[rank.rank] || "#666" }}
                >
                  {rank.rank?.toUpperCase()}
                </div>
                {rank.impressiveness_score && (
                  <p className="text-[9px] text-muted-foreground">
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