import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import MacrosDashboard from "../components/macros/MacrosDashboard";
import MacrosJournal from "../components/macros/MacrosJournal";
import MacrosFoods from "../components/macros/MacrosFoods";

function useMacroGoals() {
  const [goals, setGoals] = React.useState({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  React.useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.daily_calories) {
        setGoals({
          calories: user.daily_calories || 2000,
          protein: user.daily_protein || 150,
          carbs: user.daily_carbs || 200,
          fat: user.daily_fat || 65,
        });
      } else {
        const cal = parseInt(localStorage.getItem("gym-macro-calories"));
        if (cal) setGoals({
          calories: cal,
          protein: parseInt(localStorage.getItem("gym-macro-protein")) || 150,
          carbs: parseInt(localStorage.getItem("gym-macro-carbs")) || 200,
          fat: parseInt(localStorage.getItem("gym-macro-fat")) || 65,
        });
      }
    }).catch(() => {});
  }, []);
  return goals;
}

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "journal", label: "Journal" },
  { id: "foods", label: "Foods" },
];

export default function Macros() {
  const macroGoals = useMacroGoals();
  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get("tab") || "dashboard");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["macroEntries", date],
    queryFn: () => base44.entities.MacroEntry.filter({ date }, "-created_date", 100),
  });

  const dailyTotals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAddEntry = async (data) => {
    await base44.entities.MacroEntry.create(data);
    queryClient.invalidateQueries({ queryKey: ["macroEntries", date] });
  };

  const handleDelete = async (id) => {
    await base44.entities.MacroEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ["macroEntries", date] });
  };

  // When journal plus is clicked → navigate to Foods tab with meal context
  const [addingMeal, setAddingMeal] = useState(null);

  const handleAddToMeal = (meal) => {
    setAddingMeal(meal);
    setTab("foods");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Macros</h1>
        {addingMeal && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Adding to</span>
            <span className="text-xs font-bold capitalize bg-secondary px-2 py-1 rounded-lg">{addingMeal}</span>
            <button
              onClick={() => setAddingMeal(null)}
              className="text-xs text-muted-foreground underline"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex bg-secondary rounded-xl p-1 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <MacrosDashboard date={date} macroGoals={macroGoals} />
      )}

      {tab === "journal" && (
        <MacrosJournal
          date={date}
          entries={entries}
          macroGoals={macroGoals}
          onAddToMeal={handleAddToMeal}
          onDeleteEntry={handleDelete}
          onDateChange={setDate}
        />
      )}

      {tab === "foods" && (
        <MacrosFoods
          macroGoals={macroGoals}
          dailyTotals={dailyTotals}
          date={date}
          addingMeal={addingMeal}
          onAdd={handleAddEntry}
          onClearMeal={() => setAddingMeal(null)}
        />
      )}
    </div>
  );
}