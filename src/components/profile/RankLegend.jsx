import React from "react";
import { RANKS } from "@/components/utils/rankEngine";

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