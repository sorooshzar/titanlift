import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
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
  // Rolling 7 days: index 0 = 6 days ago, index 6 = today (current date)
  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => format(subDays(new Date(date + "T12:00:00"), 6 - i), "yyyy-MM-dd")),
    [date]
  );

  const { data: weekRaw } = useQuery({
    queryKey: ["macroWeek", date],
    queryFn: async () => {
      const results = await Promise.all(
        dates.map(d => base44.entities.MacroEntry.filter({ date: d }, "-created_date", 200))
      );
      return results;
    },
  });

  const weekData = useMemo(() => {
    return dates.map((d, i) => {
      const entries = (weekRaw && weekRaw[i]) || [];
      const dayLabel = format(new Date(d + "T12:00:00"), "EEE").slice(0, 1);
      return {
        day: dayLabel,
        fullDate: d,
        protein: Math.round(entries.reduce((s, e) => s + (e.protein || 0), 0)),
        carbs: Math.round(entries.reduce((s, e) => s + (e.carbs || 0), 0)),
        fat: Math.round(entries.reduce((s, e) => s + (e.fat || 0), 0)),
        calories: Math.round(entries.reduce((s, e) => s + (e.calories || 0), 0)),
        isToday: d === date,
      };
    });
  }, [weekRaw, dates, date]);

  const todayData = weekData[6] || { protein: 0, carbs: 0, fat: 0, calories: 0 };
  const hasData = weekData.some(d => d.calories > 0);

  return (
    <div className="space-y-4">
      {/* Weekly Chart */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h2 className="text-sm font-bold mb-2">Macronutrients</h2>

        {!hasData ? (
          <div className="h-28 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">Log a meal to see this week's trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={weekData} barCategoryGap="22%" barGap={1}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: "hsl(var(--secondary))" }}
                formatter={(value, name) => [`${value}g`, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Bar dataKey="protein" stackId="a" fill={PROTEIN_COLOR} />
              <Bar dataKey="carbs" stackId="a" fill={CARBS_COLOR} />
              <Bar dataKey="fat" stackId="a" fill={FAT_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="grid grid-cols-4 gap-1 mt-2">
          {[
            { label: "Protein", value: todayData.protein, goal: macroGoals.protein, color: PROTEIN_COLOR, isKcal: false },
            { label: "Carbs", value: todayData.carbs, goal: macroGoals.carbs, color: CARBS_COLOR, isKcal: false },
            { label: "Fat", value: todayData.fat, goal: macroGoals.fat, color: FAT_COLOR, isKcal: false },
            { label: "kCal", value: todayData.calories, goal: macroGoals.calories, color: KCAL_COLOR, isKcal: true },
          ].map(m => (
            <div key={m.label} className="flex flex-col items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
              <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.label}</p>
              <p className="text-xs font-semibold">
                {m.isKcal ? "🔥" : ""}{m.value}{m.isKcal ? "" : "g"}
              </p>
              <p className="text-[9px] text-muted-foreground">{m.goal}{m.isKcal ? "" : "g"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Water directly below chart */}
      <div className="bg-card rounded-2xl border border-border px-4 py-2">
        <WaterTracker date={date} />
      </div>

      {/* Calories eaten */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Calories Eaten</p>
            <p className="text-3xl font-bold" style={{ color: KCAL_COLOR }}>🔥{todayData.calories}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Remaining</p>
            <p className="text-3xl font-bold">🔥{Math.max(macroGoals.calories - todayData.calories, 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Goal</p>
            <p className="text-xl font-semibold text-muted-foreground">🔥{macroGoals.calories}</p>
          </div>
        </div>
      </div>

      {/* Macro progress bars */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <MacroBarRow label="Protein" value={todayData.protein} goal={macroGoals.protein} color={PROTEIN_COLOR} />
        <MacroBarRow label="Carbs" value={todayData.carbs} goal={macroGoals.carbs} color={CARBS_COLOR} />
        <MacroBarRow label="Fat" value={todayData.fat} goal={macroGoals.fat} color={FAT_COLOR} />
      </div>
    </div>
  );
}