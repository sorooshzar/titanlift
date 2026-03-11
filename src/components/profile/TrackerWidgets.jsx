import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { X } from "lucide-react";

// ─── Measurement Tracker ──────────────────────────────────────────────────────
export function MeasurementTracker({ tracker, onRemove }) {
  const bodyPart = tracker.config?.body_part;
  const { data: measurements = [] } = useQuery({
    queryKey: ["bodyMeasurements"],
    queryFn: () => base44.entities.BodyMeasurement.list("-date", 500),
  });
  const filtered = measurements.filter(m => m.body_part === bodyPart).slice(0, 12).reverse();

  const latest = filtered[filtered.length - 1];
  const chartData = filtered.map(m => ({ date: format(new Date(m.date), "MMM d"), value: m.value }));

  return (
    <TrackerCard title={bodyPart} subtitle={latest ? `${latest.value} ${latest.unit}` : "No data"} onRemove={onRemove}>
      {chartData.length > 1 ? (
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="text-xs text-muted-foreground text-center py-4">Log more entries to see a chart</p>}
    </TrackerCard>
  );
}

// ─── Exercise Tracker (1RM) ───────────────────────────────────────────────────
export function ExerciseTracker({ tracker, onRemove }) {
  const exId = tracker.config?.exercise_id;
  const exName = tracker.config?.exercise_name || tracker.label;
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 100),
  });

  const points = [];
  workoutLogs.forEach(log => {
    const ex = log.exercises?.find(e => e.exercise_id === exId);
    if (!ex) return;
    let best1rm = 0;
    ex.sets?.forEach(s => {
      if (s.completed && s.weight && s.reps) {
        const orm = s.weight * (1 + s.reps / 30);
        if (orm > best1rm) best1rm = orm;
      }
    });
    if (best1rm > 0) {
      const date = log.started_at || log.created_date;
      points.push({ date: format(new Date(date), "MMM d"), orm: Math.round(best1rm) });
    }
  });
  points.reverse();
  const latest = points[points.length - 1];

  return (
    <TrackerCard title={exName} subtitle={latest ? `est. 1RM: ${latest.orm} kg` : "No data"} onRemove={onRemove}>
      {points.length > 1 ? (
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={points}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="orm" stroke="#4ade80" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="text-xs text-muted-foreground text-center py-4">Complete more workouts with this exercise</p>}
    </TrackerCard>
  );
}

// ─── Habits Tracker ───────────────────────────────────────────────────────────
export function HabitsTracker({ tracker, onRemove }) {
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 20),
  });
  const { data: bodyWeights = [] } = useQuery({
    queryKey: ["bodyWeights"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 20),
  });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const workoutsThisWeek = workoutLogs.filter(l => {
    const d = new Date(l.started_at || l.created_date);
    return d >= weekStart && d <= weekEnd;
  }).length;

  const weightsThisWeek = bodyWeights.filter(w => {
    const d = new Date(w.date);
    return d >= weekStart && d <= weekEnd;
  }).length;

  const habits = [
    { label: "Workouts logged", count: workoutsThisWeek, goal: 4, color: "bg-primary" },
    { label: "Weight tracked", count: weightsThisWeek, goal: 3, color: "bg-green-500" },
  ];

  return (
    <TrackerCard title="Habits" subtitle="This week" onRemove={onRemove}>
      <div className="space-y-3 mt-1">
        {habits.map(h => (
          <div key={h.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{h.label}</span>
              <span className="font-semibold">{h.count} / {h.goal}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full ${h.color} rounded-full transition-all`}
                style={{ width: `${Math.min((h.count / h.goal) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </TrackerCard>
  );
}

// ─── Macros Tracker ───────────────────────────────────────────────────────────
export function MacrosTracker({ tracker, onRemove }) {
  const { data: macroEntries = [] } = useQuery({
    queryKey: ["macroEntries"],
    queryFn: () => base44.entities.MacroEntry.list("-date", 500),
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dayEntries = macroEntries.filter(e => e.date === dateStr);
    const calories = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const protein = dayEntries.reduce((s, e) => s + (e.protein || 0), 0);
    const carbs = dayEntries.reduce((s, e) => s + (e.carbs || 0), 0);
    const fat = dayEntries.reduce((s, e) => s + (e.fat || 0), 0);
    return { date: format(d, "EEE"), calories, protein, carbs, fat };
  });

  const maxCal = Math.max(...days.map(d => d.calories), 1);

  return (
    <TrackerCard title="Macros" subtitle="Past 7 days" onRemove={onRemove}>
      <div className="flex items-end justify-between gap-1 mt-2" style={{ height: 80 }}>
        {days.map((d, i) => {
          const h = d.calories > 0 ? Math.max((d.calories / maxCal) * 72, 4) : 0;
          const total = (d.protein || 0) + (d.carbs || 0) + (d.fat || 0);
          const pPct = total > 0 ? (d.protein / total) * 100 : 33;
          const cPct = total > 0 ? (d.carbs / total) * 100 : 33;
          const fPct = total > 0 ? (d.fat / total) * 100 : 34;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {d.calories > 0 ? (
                <div className="w-full rounded-sm overflow-hidden flex flex-col-reverse" style={{ height: h }}>
                  <div style={{ height: `${pPct}%`, background: "#ef4444" }} title={`Protein ${Math.round(d.protein)}g`} />
                  <div style={{ height: `${cPct}%`, background: "#3b82f6" }} title={`Carbs ${Math.round(d.carbs)}g`} />
                  <div style={{ height: `${fPct}%`, background: "#22c55e" }} title={`Fat ${Math.round(d.fat)}g`} />
                </div>
              ) : (
                <div className="w-full rounded-sm bg-secondary/40" style={{ height: 4 }} />
              )}
              <span className="text-[9px] text-muted-foreground">{d.date}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 justify-center mt-2">
        {[{ color: "bg-red-500", label: "Protein" }, { color: "bg-blue-500", label: "Carbs" }, { color: "bg-green-500", label: "Fat" }].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </TrackerCard>
  );
}

// ─── Shared card shell ────────────────────────────────────────────────────────
function TrackerCard({ title, subtitle, children, onRemove }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 relative">
      <button onClick={onRemove}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-3 h-3" />
      </button>
      <p className="text-sm font-bold pr-6">{title}</p>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      {children}
    </div>
  );
}