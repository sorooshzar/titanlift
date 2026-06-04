import React, { useState } from "react";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FriendWorkoutHistory({ workoutLogs = [], friend }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getDay(startOfMonth(currentDate));

  // Group workouts by date
  const workoutsByDate = {};
  workoutLogs?.forEach(log => {
    const dateKey = log.started_at ? format(new Date(log.started_at), 'yyyy-MM-dd') : null;
    if (dateKey) {
      if (!workoutsByDate[dateKey]) {
        workoutsByDate[dateKey] = [];
      }
      workoutsByDate[dateKey].push(log);
    }
  });

  // Get all workouts sorted by most recent
  const recentWorkouts = workoutLogs
    .sort((a, b) => new Date(b.started_at || 0) - new Date(a.started_at || 0));

  // Calendar days
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDate(null);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar View */}
      <div className="mb-4">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-secondary rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-sm">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-secondary rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} />;
            }

            const dateKey = format(date, 'yyyy-MM-dd');
            const hasWorkout = workoutsByDate[dateKey];
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square text-xs font-black rounded-lg transition-all flex items-center justify-center ${
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : hasWorkout
                    ? 'bg-secondary text-primary'
                    : today
                    ? 'border-2 border-primary text-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-3" />

      {/* Recent Workouts List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {recentWorkouts.length > 0 ? (
          <div className="space-y-2">
            {recentWorkouts.map((log) => (
              <div
                key={log.id}
                className="bg-secondary rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{log.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.started_at ? format(new Date(log.started_at), 'MMM d') : 'Unknown date'} • {log.duration_minutes ? `${log.duration_minutes} min` : 'Duration unknown'} • {log.total_sets || 0} sets
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {log.total_volume ? `${Math.round(log.total_volume)} kg` : '--'}
                  </p>
                </div>

                {log.exercises?.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {log.exercises.length} exercise{log.exercises.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No workouts found
          </p>
        )}
      </div>
    </div>
  );
}