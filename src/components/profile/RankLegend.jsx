import React from "react";
import { RANKS } from "@/components/utils/rankEngine";

export default function RankLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {RANKS.map((r) => (
        <div key={r.name} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 border border-border"
            style={{ backgroundColor: r.color }}
          />
          <span className="text-xs font-medium">{r.label}</span>
        </div>
      ))}
    </div>
  );
}