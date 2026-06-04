import React from "react";
import MuscleModel from "../profile/MuscleModel";
import RankLegend from "../profile/RankLegend";

// Accepts muscleRanks as a plain map: { "Quads": "gold", "Lats": "silver", ... }
export default function FriendBodyModel({ muscleRanks = {} }) {
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