import React from "react";

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

// Simple muscle diagram layout
const MUSCLE_POSITIONS = {
  chest: { x: 50, y: 30, width: 20, height: 15 },
  shoulders: { x: 20, y: 20, width: 12, height: 15 },
  biceps: { x: 15, y: 35, width: 10, height: 20 },
  triceps: { x: 75, y: 35, width: 10, height: 20 },
  forearms: { x: 15, y: 55, width: 8, height: 15 },
  lats: { x: 30, y: 40, width: 15, height: 20 },
  abs: { x: 50, y: 45, width: 15, height: 20 },
  traps: { x: 50, y: 15, width: 10, height: 8 },
  quads: { x: 45, y: 70, width: 15, height: 20 },
  hamstrings: { x: 35, y: 70, width: 12, height: 20 },
  glutes: { x: 50, y: 65, width: 12, height: 12 },
  calves: { x: 45, y: 92, width: 10, height: 10 },
};

export default function FriendBodyModel({ nutritionRanks = [] }) {
  // Build rank map by muscle
  const rankByMuscle = {};
  nutritionRanks?.forEach(rank => {
    rankByMuscle[rank.muscle?.toLowerCase()] = rank;
  });

  return (
    <div className="flex gap-6">
      {/* Body Diagram */}
      <div className="flex-1 flex items-center justify-center">
        <svg width="150" height="300" viewBox="0 0 100 200" className="bg-secondary rounded-2xl p-4">
          {/* Stylized body outline */}
          <circle cx="50" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
          
          {/* Muscle boxes */}
          {Object.entries(MUSCLE_POSITIONS).map(([muscle, pos]) => {
            const rank = rankByMuscle[muscle];
            const color = rank ? RANK_COLORS[rank.rank] || "#666" : "#ddd";
            const opacity = rank ? 1 : 0.2;
            
            return (
              <g key={muscle}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.width}
                  height={pos.height}
                  fill={color}
                  opacity={opacity}
                  rx="2"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                />
                <title>{`${muscle}: ${rank?.rank || 'no rank'}`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Ranks List */}
      <div className="w-40 space-y-2 overflow-y-auto max-h-96">
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
                  style={{ backgroundColor: RANK_COLORS[rank.rank] || "#666" }}
                >
                  {rank.rank?.toUpperCase()}
                </div>
                {rank.impressiveness_score && (
                  <p className="text-[9px] text-muted-foreground">
                    Score: {Math.round(rank.impressiveness_score)}
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