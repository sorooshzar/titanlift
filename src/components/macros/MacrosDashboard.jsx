import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, LineChart, Line, YAxis } from "recharts";
import { NutritionBadge, computeNutritionStreak, getNutritionLevelFromStreak } from "./NutritionRank";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

// Estimated daily goals for electrolytes (mg) and sugar (g)
const ELECTROLYTE_GOALS = { Sodium: 2300, Potassium: 4700, Magnesium: 420, Calcium: 1000 };
const ELECTROLYTE_COLORS = { Sodium: "#F97316", Potassium: "#A78BFA", Magnesium: "#34D399", Calcium: "#60A5FA" };
const SUGAR_GOAL = 50; // g/day

// Estimate electrolytes from macros (rough approximation when no dedicated tracking)
function estimateElectrolytes(protein, carbs, fat, calories) {
  return {
    Sodium: Math.round(protein * 4 + carbs * 1.5),
    Potassium: Math.round(protein * 10 + carbs * 3),
    Magnesium: Math.round(protein * 1.2 + carbs * 0.4),
    Calcium: Math.round(protein * 3 + fat * 0.5),
  };
}

function ElectrolyteBar({ label, value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold w-16 shrink-0" style={{ color }}>{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-20 text-right">{value}/{goal}mg</span>
    </div>
  );
}

function SugarBar({ value, goal }) {
  const pct = Math.min((value / goal) * 100, 100);
  const over = value > goal;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold w-16 shrink-0" style={{ color: over ? "#EF4444" : "#F59E0B" }}>Sugar</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: over ? "#EF4444" : "#F59E0B" }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-20 text-right">{Math.round(value)}/{goal}g</span>
    </div>
  );
}



export default function MacrosDashboard({ date, macroGoals }) {
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

  // Water logs for past 7 days
  const { data: waterRaw } = useQuery({
    queryKey: ["waterWeek", date],
    queryFn: async () => {
      const results = await Promise.all(
        dates.map(d => base44.entities.WaterLog.filter({ date: d }, "-created_date", 50))
      );
      return results;
    },
  });

  const weekData = useMemo(() => {
    return dates.map((d, i) => {
      const entries = (weekRaw && weekRaw[i]) || [];
      return {
        day: format(new Date(d + "T12:00:00"), "EEE").slice(0, 1),
        protein: Math.round(entries.reduce((s, e) => s + (e.protein || 0), 0)),
        carbs: Math.round(entries.reduce((s, e) => s + (e.carbs || 0), 0)),
        fat: Math.round(entries.reduce((s, e) => s + (e.fat || 0), 0)),
        calories: Math.round(entries.reduce((s, e) => s + (e.calories || 0), 0)),
      };
    });
  }, [weekRaw, dates]);

  const waterData = useMemo(() => {
    return dates.map((d, i) => {
      const logs = (waterRaw && waterRaw[i]) || [];
      return {
        day: format(new Date(d + "T12:00:00"), "EEE").slice(0, 1),
        ml: Math.round(logs.reduce((s, l) => s + (l.amount_ml || 0), 0)),
      };
    });
  }, [waterRaw, dates]);

  const todayData = weekData[6] || { protein: 0, carbs: 0, fat: 0, calories: 0 };
  const hasData = weekData.some(d => d.calories > 0);
  const hasWaterData = waterData.some(d => d.ml > 0);

  const electrolytes = estimateElectrolytes(todayData.protein, todayData.carbs, todayData.fat, todayData.calories);
  const estimatedSugar = Math.round(todayData.carbs * 0.35);

  // Compute streak-based rank from raw entries
  const allMacroForStreak = useMemo(() => (weekRaw || []).flat(), [weekRaw]);
  const allWaterForStreak = useMemo(() => (waterRaw || []).flat(), [waterRaw]);
  const streak = computeNutritionStreak(allMacroForStreak, allWaterForStreak);
  const rank = getNutritionLevelFromStreak(streak);

  return (
    <div className="space-y-4">
      {/* Weekly Chart */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold">Macronutrients</h2>
          {/* Nutrition Rank badge */}
          <div className="flex items-center gap-2">
            <NutritionBadge levelData={rank} size="sm" />
            <div>
              <p className="text-[9px] text-muted-foreground leading-none">Level {rank.level}</p>
              <p className="text-[11px] font-bold leading-tight" style={{ color: rank.color }}>{rank.name}</p>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="h-28 flex items-center justify-center">
            <p className="text-xs text-muted-foreground text-center">Log a meal to see trends.</p>
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
            { label: "Protein", value: todayData.protein, color: PROTEIN_COLOR, suffix: "g" },
            { label: "Carbs", value: todayData.carbs, color: CARBS_COLOR, suffix: "g" },
            { label: "Fat", value: todayData.fat, color: FAT_COLOR, suffix: "g" },
            { label: "kCal", value: todayData.calories, color: KCAL_COLOR, suffix: "", fire: true },
          ].map(m => (
            <div key={m.label} className="flex flex-col items-center gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
              <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.label}</p>
              <p className="text-xs font-semibold">{m.fire ? "🔥" : ""}{m.value}{m.suffix}</p>
            </div>
          ))}
        </div>
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
            <p className="text-3xl font-bold">{Math.max(macroGoals.calories - todayData.calories, 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Goal</p>
            <p className="text-xl font-semibold text-muted-foreground">{macroGoals.calories}</p>
          </div>
        </div>
      </div>

      {/* Electrolytes + Sugar */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-xs font-bold">Electrolytes <span className="text-muted-foreground font-normal">(estimated)</span></h3>
        {Object.entries(electrolytes).map(([name, val]) => (
          <ElectrolyteBar key={name} label={name} value={val} goal={ELECTROLYTE_GOALS[name]} color={ELECTROLYTE_COLORS[name]} />
        ))}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <h3 className="text-xs font-bold">Sugar <span className="text-muted-foreground font-normal">(estimated)</span></h3>
          <SugarBar value={estimatedSugar} goal={SUGAR_GOAL} />
        </div>
      </div>

      {/* Water consumption graph */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-xs font-bold mb-2">Water (7 days)</h3>
        {!hasWaterData ? (
          <div className="h-20 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Log water to see trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={waterData} barCategoryGap="25%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [`${v}ml`, "Water"]}
              />
              <Bar dataKey="ml" fill="#60A5FA" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}