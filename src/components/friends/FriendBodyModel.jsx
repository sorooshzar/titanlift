import React from "react";
import MuscleModel from "../profile/MuscleModel";
import RankLegend from "../profile/RankLegend";

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

      {/* Rank Legend — right side */}
      <div className="flex flex-col items-start ml-2 flex-1 self-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Rank</p>
        <RankLegend />
      </div>
    </div>
  );
}