import React from "react";
import { RANKS } from "@/components/utils/rankEngine";

export default function RankLegend() {
  return (
    <div className="flex flex-col gap-2">
      {RANKS.map((r) => (
        <div key={r.name} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: r.color }}
          />
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: r.color }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}