import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Dumbbell, ChevronRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function formatDuration(mins) {
  if (!mins) return "--";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function CalendarView({ logs, onSelectDay }) {
  const [month, setMonth] = useState(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const firstDayOffset = getDay(startOfMonth(month)); // 0=Sun

  const logsByDay = {};
  logs.forEach((log) => {
    const d = new Date(log.started_at || log.created_date);
    const key = format(d, "yyyy-MM-dd");
    if (!logsByDay[key]) logsByDay[key] = [];
    logsByDay[key].push(log);
  });

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className="text-muted-foreground px-2 text-sm font-medium">‹</button>
        <span className="text-sm font-bold">{format(month, "MMMM yyyy")}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className="text-muted-foreground px-2 text-sm font-medium">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayLogs = logsByDay[key] || [];
          const hasLog = dayLogs.length > 0;
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={key}
              onClick={() => hasLog && onSelectDay(day, dayLogs)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold relative transition-all
                ${isToday ? "ring-1 ring-primary" : ""}
                ${hasLog ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary"}`}
            >
              {format(day, "d")}
              {hasLog && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutDetailModal({ log, onClose }) {
  const weightUnit = localStorage.getItem("gym-weight-unit") || "kg";
  if (!log) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed inset-0 z-50 bg-background/95 overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{log.name}</h2>
            <p className="text-xs text-muted-foreground">
              {log.started_at ? format(new Date(log.started_at), "EEEE, MMM d yyyy · h:mm a") : ""}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Duration", value: formatDuration(log.duration_minutes) },
            { label: "Volume", value: log.total_volume ? `${log.total_volume.toLocaleString()} ${weightUnit}` : "--" },
            { label: "Sets", value: log.total_sets || "--" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {log.exercises?.map((ex, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4"
              style={ex.color ? { borderLeftWidth: "3px", borderLeftColor: ex.color } : {}}>
              <div className="flex items-center gap-2 mb-2">
                {/* Reserved rank icon space */}
                <div className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold flex-1">{ex.exercise_name}</p>
              </div>
              <div className="space-y-1">
                {ex.sets?.filter(s => s.completed).map((s, j) => (
                  <div key={j} className="flex gap-4 text-xs text-muted-foreground">
                    <span className="text-foreground font-medium w-6">{j + 1}</span>
                    <span>{s.weight || 0} {weightUnit} × {s.reps || 0}</span>
                    {s.rir != null && <span>RIR {s.rir}</span>}
                    {s.type === "failure" && <span className="text-destructive font-semibold">F</span>}
                    {s.type === "dropset" && <span className="text-amber-500 font-semibold">D</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dayLogs, setDayLogs] = useState(null);

  const { data: logs = [] } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => base44.entities.WorkoutLog.list("-created_date", 200),
  });

  const handleSelectDay = (day, dayLogsArr) => {
    if (dayLogsArr.length === 1) {
      setSelectedLog(dayLogsArr[0]);
    } else {
      setDayLogs({ day, logs: dayLogsArr });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">History</h1>
        <Button
          variant={showCalendar ? "default" : "secondary"}
          size="sm"
          className="gap-1.5 text-xs rounded-full"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <Calendar className="w-3.5 h-3.5" />
          Calendar
        </Button>
      </div>

      {showCalendar && (
        <CalendarView logs={logs} onSelectDay={handleSelectDay} />
      )}

      {/* Day drill-down */}
      {dayLogs && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">{format(dayLogs.day, "EEEE, MMM d")}</p>
            <button onClick={() => setDayLogs(null)} className="text-xs text-muted-foreground">Close</button>
          </div>
          {dayLogs.logs.map((log) => (
            <button key={log.id} onClick={() => { setSelectedLog(log); setDayLogs(null); }}
              className="w-full flex items-center gap-3 py-2 text-left hover:bg-secondary/50 rounded-lg px-2 transition-colors">
              <Dumbbell className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{log.name}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {/* Workout list */}
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No workouts logged yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 text-left hover:border-primary/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{log.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {log.started_at ? format(new Date(log.started_at), "EEE, MMM d") : ""}
                  {log.duration_minutes ? ` · ${formatDuration(log.duration_minutes)}` : ""}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {log.total_volume > 0 && (
                  <p className="text-sm font-bold text-primary">{(log.total_volume).toLocaleString()} kg</p>
                )}
                <p className="text-[10px] text-muted-foreground">{log.total_sets || 0} sets</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedLog && (
          <WorkoutDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}