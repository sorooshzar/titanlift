import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

export default function WeightChart({ data = [], goalWeight = null }) {
  const { unit, toDisplay } = useWeightUnit();

  // Deduplicate: keep only the latest entry per day
  const byDay = {};
  data.forEach(d => {
    if (!byDay[d.date] || new Date(d.created_date) > new Date(byDay[d.date].created_date)) {
      byDay[d.date] = d;
    }
  });
  // Convert stored kg to display unit
  const chartData = Object.values(byDay)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(d => ({
      date: format(new Date(d.date), "MMM d"),
      weight: toDisplay(d.weight),
    }));

  // goalWeight is stored in kg — convert for display
  const goalWeightDisplay = goalWeight ? toDisplay(goalWeight) : null;

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No weight data yet. Start logging!
      </div>
    );
  }

  const weights = chartData.map(d => d.weight);
  const allValues = goalWeightDisplay ? [...weights, goalWeightDisplay] : weights;
  const domainMin = Math.min(...allValues) - 2;
  const domainMax = Math.max(...allValues) + 2;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            domain={[domainMin, domainMax]}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value) => [`${value} kg`, "Weight"]}
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(var(--primary))"
              strokeDasharray="5 4"
              strokeOpacity={0.6}
              label={{ value: `Goal: ${goalWeight}kg`, position: "insideTopRight", fontSize: 9, fill: "hsl(var(--primary))" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 3 }}
            activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}