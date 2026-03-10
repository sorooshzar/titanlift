import React from "react";

const RANKS = [
  { name: "Wood",     color: "#8B6914", bg: "#3d2c00" },
  { name: "Bronze",   color: "#CD7F32", bg: "#3d2200" },
  { name: "Silver",   color: "#C0C0C0", bg: "#2a2a2a" },
  { name: "Gold",     color: "#FFD700", bg: "#3d3000" },
  { name: "Platinum", color: "#B0E0E6", bg: "#002a2e" },
  { name: "Diamond",  color: "#7DF9FF", bg: "#003040" },
  { name: "Champion", color: "#c084fc", bg: "#2d0050" },
  { name: "Titan",    color: "#F87171", bg: "#400000" },
  { name: "Olympian", color: "#FF6B35", bg: "#3d1500" },
];

export default function RankLegend() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {RANKS.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ backgroundColor: r.bg }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: r.color, boxShadow: `0 0 4px ${r.color}` }}
          />
          <span className="text-[10px] font-semibold" style={{ color: r.color }}>
            {r.name}
          </span>
        </div>
      ))}
    </div>
  );
}