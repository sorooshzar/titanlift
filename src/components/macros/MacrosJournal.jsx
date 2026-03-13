import React from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FF9500";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function MealSection({ meal, entries, macroGoals, onAdd, onDelete }) {
  const totals = entries.reduce(
    (acc, e) => ({
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
      calories: acc.calories + (e.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );

  const mealCalGoal = Math.round(macroGoals.calories / 3); // rough per-meal target

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Meal header */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold capitalize">{meal}</span>
          <button
            onClick={onAdd}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${KCAL_COLOR}22` }}
          >
            <Plus className="w-3.5 h-3.5" style={{ color: KCAL_COLOR }} />
          </button>
        </div>

        {/* Macro totals row */}
        <div className="grid grid-cols-4 gap-1">
          <div>
            <p className="text-[11px] font-bold" style={{ color: PROTEIN_COLOR }}>
              P{Math.round(totals.protein)}
            </p>
            <div className="h-0.5 bg-secondary rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((totals.protein / (macroGoals.protein || 1)) * 100, 100)}%`,
                  backgroundColor: PROTEIN_COLOR,
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {totals.protein > 0 ? `${Math.round((totals.protein / macroGoals.protein) * 100)}%` : `> ${macroGoals.protein}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: CARBS_COLOR }}>
              C{Math.round(totals.carbs)}
            </p>
            <div className="h-0.5 bg-secondary rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((totals.carbs / (macroGoals.carbs || 1)) * 100, 100)}%`,
                  backgroundColor: CARBS_COLOR,
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {totals.carbs > 0 ? `${Math.round((totals.carbs / macroGoals.carbs) * 100)}%` : `> ${macroGoals.carbs}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: FAT_COLOR }}>
              F{Math.round(totals.fat)}
            </p>
            <div className="h-0.5 bg-secondary rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((totals.fat / (macroGoals.fat || 1)) * 100, 100)}%`,
                  backgroundColor: FAT_COLOR,
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {totals.fat > 0 ? `${Math.round((totals.fat / macroGoals.fat) * 100)}%` : `> ${macroGoals.fat}`}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: KCAL_COLOR }}>
              {Math.round(totals.calories)}
            </p>
            <div className="h-0.5 bg-secondary rounded-full mt-0.5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((totals.calories / (mealCalGoal || 1)) * 100, 100)}%`,
                  backgroundColor: KCAL_COLOR,
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {totals.calories > 0 ? `${Math.round((totals.calories / mealCalGoal) * 100)}%` : `> ${mealCalGoal}`}
            </p>
          </div>
        </div>
      </div>

      {/* Food entries */}
      {entries.length > 0 && (
        <div className="divide-y divide-border/30">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center px-4 py-2.5 gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{entry.food_name}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: PROTEIN_COLOR }}>P{Math.round(entry.protein || 0)}</span>
                  <span className="text-[10px] font-bold" style={{ color: CARBS_COLOR }}>C{Math.round(entry.carbs || 0)}</span>
                  <span className="text-[10px] font-bold" style={{ color: FAT_COLOR }}>F{Math.round(entry.fat || 0)}</span>
                  <span className="text-[10px] text-muted-foreground">{entry.quantity}{entry.unit}</span>
                </div>
              </div>
              <span className="text-sm font-semibold shrink-0" style={{ color: KCAL_COLOR }}>
                {Math.round(entry.calories || 0)}
              </span>
              <button
                onClick={() => onDelete(entry.id)}
                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MacrosJournal({ date, entries, macroGoals, onAddToMeal, onDeleteEntry, onDateChange }) {
  const dateObj = new Date(date + "T12:00:00"); // avoid timezone offset issues
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isCurrentDay = date === todayStr;

  const goBack = () => onDateChange(format(subDays(dateObj, 1), "yyyy-MM-dd"));
  const goForward = () => {
    if (!isCurrentDay) onDateChange(format(addDays(dateObj, 1), "yyyy-MM-dd"));
  };

  const displayLabel = isCurrentDay
    ? "Today"
    : format(dateObj, "MMM d");

  return (
    <div className="space-y-4">
      {/* Minimal date nav header */}
      <div className="flex items-center justify-center gap-4 py-1">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center min-w-[100px]">
          <p className="text-sm font-bold">{displayLabel}</p>
          <p className="text-[10px] text-muted-foreground">{format(dateObj, "EEEE, MMM d")}</p>
        </div>
        <button
          onClick={goForward}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isCurrentDay ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary"}`}
          disabled={isCurrentDay}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Meal sections */}
      {MEAL_TYPES.map(meal => (
        <MealSection
          key={meal}
          meal={meal}
          entries={entries.filter(e => e.meal_type === meal)}
          macroGoals={macroGoals}
          onAdd={() => onAddToMeal(meal)}
          onDelete={onDeleteEntry}
        />
      ))}
    </div>
  );
}