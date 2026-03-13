import React from "react";
import { RANKS } from "@/components/utils/rankEngine";

export default function RankLegend() {
  return (
    <div className="flex flex-col gap-1.5">
      {RANKS.map((r) => (
        <div key={r.name} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: r.color }}
          />
          <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: r.color }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}