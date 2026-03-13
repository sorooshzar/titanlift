import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import WaterTracker from "./WaterTracker";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FF9500";

function MacroBarRow({ label, value, goal, color }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  const remaining = Math.max(goal - value, 0);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold" style={{ color }}>{label}</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(value)}g <span className="text-muted-foreground/50">/ {goal}g</span>
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{Math.round(remaining)}g remaining</p>
    </div>
  );
}

export default function MacrosDashboard({ date, macroGoals }) {
  // Fetch 7 days of entries for the weekly chart
  const dates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(date), 6 - i), "yyyy-MM-dd"));

  const weekQueries = useQuery({
    queryKey: ["macroWeek", date],
    queryFn: async () => {
      const results = await Promise.all(
        dates.map(d => base44.entities.MacroEntry.filter({ date: d }, "-created_date", 200))
      );
      return results;
    },
  });

  const weekData = useMemo(() => {
    if (!weekQueries.data) return dates.map(d => ({ day: format(new Date(d), "EEE")[0], protein: 0, carbs: 0, fat: 0 }));
    return dates.map((d, i) => {
      const entries = weekQueries.data[i] || [];
      return {
        day: format(new Date(d), "EEE")[0],
        protein: Math.round(entries.reduce((s, e) => s + (e.protein || 0), 0)),
        carbs: Math.round(entries.reduce((s, e) => s + (e.carbs || 0), 0)),
        fat: Math.round(entries.reduce((s, e) => s + (e.fat || 0), 0)),
        calories: Math.round(entries.reduce((s, e) => s + (e.calories || 0), 0)),
        isToday: d === date,
      };
    });
  }, [weekQueries.data, date, dates]);

  // Today's totals (from parent via prop — pass entries)
  const todayData = weekData[6] || { protein: 0, carbs: 0, fat: 0, calories: 0 };
  const avg = {
    protein: Math.round(weekData.reduce((s, d) => s + d.protein, 0) / 7),
    carbs: Math.round(weekData.reduce((s, d) => s + d.carbs, 0) / 7),
    fat: Math.round(weekData.reduce((s, d) => s + d.fat, 0) / 7),
    calories: Math.round(weekData.reduce((s, d) => s + d.calories, 0) / 7),
  };

  const hasData = weekData.some(d => d.calories > 0);

  return (
    <div className="space-y-4">
      {/* Weekly Chart */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">Macronutrients</h2>
        </div>

        {!hasData ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">Log a meal to see this week's nutrition trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weekData} barCategoryGap="20%" barGap={1}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: "hsl(var(--secondary))" }}
              />
              <Bar dataKey="protein" stackId="a" fill={PROTEIN_COLOR} radius={[0, 0, 0, 0]} />
              <Bar dataKey="carbs" stackId="a" fill={CARBS_COLOR} radius={[0, 0, 0, 0]} />
              <Bar dataKey="fat" stackId="a" fill={FAT_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend + targets */}
        <div className="grid grid-cols-4 gap-1 mt-3">
          {[
            { label: "Protein", value: todayData.protein, goal: macroGoals.protein, color: PROTEIN_COLOR },
            { label: "Carbs", value: todayData.carbs, goal: macroGoals.carbs, color: CARBS_COLOR },
            { label: "Fat", value: todayData.fat, goal: macroGoals.fat, color: FAT_COLOR },
            { label: "kCal", value: todayData.calories, goal: macroGoals.calories, color: KCAL_COLOR, isKcal: true },
          ].map(m => (
            <div key={m.label} className="flex flex-col items-center gap-0.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.label}</p>
              <p className="text-xs font-semibold">{m.value}{m.isKcal ? "" : "g"}</p>
              <p className="text-[9px] text-muted-foreground">{m.goal}{m.isKcal ? "" : "g"}</p>
            </div>
          ))}
        </div>

        {/* 7-day avg */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground mb-1.5 font-semibold">7 day avg.</p>
          <div className="grid grid-cols-4 gap-1">
            {[
              { value: avg.protein, color: PROTEIN_COLOR, isKcal: false },
              { value: avg.carbs, color: CARBS_COLOR, isKcal: false },
              { value: avg.fat, color: FAT_COLOR, isKcal: false },
              { value: avg.calories, color: KCAL_COLOR, isKcal: true },
            ].map((m, i) => (
              <p key={i} className="text-[11px] font-semibold text-center" style={{ color: m.color }}>
                {m.value}{m.isKcal ? "" : "g"}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Calories eaten - fixed label alignment */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Calories Eaten</p>
            <p className="text-3xl font-bold" style={{ color: KCAL_COLOR }}>{todayData.calories}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Remaining</p>
            <p className="text-3xl font-bold">{Math.max(macroGoals.calories - todayData.calories, 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Goal</p>
            <p className="text-xl font-semibold text-muted-foreground">{macroGoals.calories}</p>
          </div>
        </div>
      </div>

      {/* Macro progress bars */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <MacroBarRow label="Protein" value={todayData.protein} goal={macroGoals.protein} color={PROTEIN_COLOR} />
        <MacroBarRow label="Carbs" value={todayData.carbs} goal={macroGoals.carbs} color={CARBS_COLOR} />
        <MacroBarRow label="Fat" value={todayData.fat} goal={macroGoals.fat} color={FAT_COLOR} />
      </div>

      {/* Water */}
      <div className="bg-card rounded-2xl border border-border px-4 py-2">
        <WaterTracker date={date} />
      </div>
    </div>
  );
}