import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Clock, Flame, MapPin, Bike, TrendingUp, ChevronRight, Activity, Plus } from "lucide-react";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ActiveCardioSession({ type, onFinish }) {
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [activity, setActivity] = useState("");
  const timerRef = useRef(null);
  const startedAt = useRef(new Date().toISOString());

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const activities = type === "stationary"
    ? ["Treadmill", "Cycling", "Elliptical", "Rowing", "Stair Master"]
    : ["Running", "Walking", "Cycling", "Hiking"];

  const handleFinish = () => {
    clearInterval(timerRef.current);
    onFinish({
      type,
      activity: activity || (type === "stationary" ? "Treadmill" : "Running"),
      date: format(new Date(), "yyyy-MM-dd"),
      started_at: startedAt.current,
      finished_at: new Date().toISOString(),
      duration_seconds: elapsed,
      distance: parseFloat(distance) || null,
      calories: parseInt(calories) || null,
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <div className="text-6xl font-mono font-bold tabular-nums tracking-tight">{formatDuration(elapsed)}</div>
        <p className="text-sm text-muted-foreground mt-1">{type === "mobile" ? "GPS Active" : "Session Active"}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {activities.map(a => (
          <button key={a} onClick={() => setActivity(a)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activity === a ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1.5">Distance (km)</p>
          <Input type="number" step="0.1" placeholder="0.0" value={distance}
            onChange={e => setDistance(e.target.value)}
            className="bg-transparent border-0 text-lg font-bold p-0 h-auto" />
        </div>
        <div className="bg-secondary rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1.5">Calories (kcal)</p>
          <Input type="number" placeholder="0" value={calories}
            onChange={e => setCalories(e.target.value)}
            className="bg-transparent border-0 text-lg font-bold p-0 h-auto" />
        </div>
      </div>

      <Button variant="destructive" className="w-full h-14 rounded-xl font-bold text-base gap-2" onClick={handleFinish}>
        <Square className="w-5 h-5" /> Finish Session
      </Button>
    </div>
  );
}

function CardioHistoryItem({ log }) {
  return (
    <div className="flex items-center bg-secondary/50 rounded-xl p-3.5 gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        {log.type === "mobile" ? <MapPin className="w-5 h-5 text-primary" /> : <Bike className="w-5 h-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{log.activity || (log.type === "mobile" ? "Outdoor" : "Stationary")}</p>
        <p className="text-xs text-muted-foreground">
          {log.date} · {log.duration_seconds ? formatDuration(log.duration_seconds) : "--"}
          {log.distance ? ` · ${log.distance}km` : ""}
          {log.calories ? ` · ${log.calories}kcal` : ""}
        </p>
      </div>
    </div>
  );
}

export default function Cardio() {
  const [activeSession, setActiveSession] = useState(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const urlType = urlParams.get("type");

  useEffect(() => {
    if (urlType) { setActiveSession(urlType); setShowNewSession(false); }
  }, [urlType]);

  const { data: logs = [] } = useQuery({
    queryKey: ["cardioLogs"],
    queryFn: () => base44.entities.CardioLog.list("-created_date", 50),
  });

  const handleFinish = async (data) => {
    await base44.entities.CardioLog.create(data);
    queryClient.invalidateQueries({ queryKey: ["cardioLogs"] });
    setActiveSession(null);
  };

  // Weekly chart data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const dayLogs = logs.filter(l => l.date === d);
    const mins = dayLogs.reduce((sum, l) => sum + Math.round((l.duration_seconds || 0) / 60), 0);
    return { day: format(subDays(new Date(), 6 - i), "EEE"), mins };
  });

  const totalMins = logs.reduce((s, l) => s + Math.round((l.duration_seconds || 0) / 60), 0);
  const totalSessions = logs.length;

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cardio</h1>
        {!activeSession && (
          <Button size="sm" onClick={() => setShowNewSession(true)} className="gap-1.5 h-8 text-xs rounded-xl">
            <Plus className="w-3.5 h-3.5" /> New
          </Button>
        )}
      </div>

      {/* Active session type selector */}
      {showNewSession && !activeSession && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "stationary", icon: Bike, label: "Stationary", sub: "Treadmill, bike..." },
            { id: "mobile", icon: MapPin, label: "Mobile", sub: "Run, walk, cycle..." },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { setActiveSession(item.id); setShowNewSession(false); }}
                className="flex flex-col items-center gap-2 bg-secondary rounded-xl p-5 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Active session */}
      {activeSession && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-500">Session Active</span>
          </div>
          <ActiveCardioSession type={activeSession} onFinish={handleFinish} />
        </div>
      )}

      {/* Stats summary */}
      {!activeSession && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Minutes</p>
              <p className="text-2xl font-bold">{totalMins}</p>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-3">This Week</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weekData} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`${v} min`]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="mins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Recent Sessions</h3>
            {logs.length === 0 ? (
              <div className="text-center py-10">
                <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No cardio sessions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 20).map(log => <CardioHistoryItem key={log.id} log={log} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}