import React from "react";

const RANKS = [
  { name: "Wood", color: "#8B6914" },
  { name: "Bronze", color: "#CD7F32" },
  { name: "Silver", color: "#C0C0C0" },
  { name: "Gold", color: "#FFD700" },
  { name: "Platinum", color: "#E5E4E2" },
  { name: "Diamond", color: "#B9F2FF" },
  { name: "Champion", color: "#9B59B6" },
  { name: "Titan", color: "#E74C3C" },
  { name: "Olympian", color: "#FF6B35" },
];

export default function RankLegend() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {RANKS.map((rank) => (
        <div key={rank.name} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: rank.color }}
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {rank.name}
          </span>
        </div>
      ))}
    </div>
  );
}