import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Apple, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import WaterTracker from "../components/macros/WaterTracker";

const MACRO_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
        <span className="text-xs text-muted-foreground">{Math.round(value)}g / {goal}g</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function AddFoodModal({ mealType, date, onClose, onAdd }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState("100");

  const { data: foods = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: () => base44.entities.Food.list("name", 200),
  });

  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!selected && !search) return;
    const food = selected || { name: search, calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 };
    const qty = parseFloat(quantity) || 100;
    const factor = qty / 100;
    onAdd({
      date, meal_type: mealType, food_name: food.name, food_id: food.id,
      quantity: qty, unit: "g",
      calories: Math.round((food.calories_per_100g || 0) * factor),
      protein: Math.round((food.protein_per_100g || 0) * factor * 10) / 10,
      carbs: Math.round((food.carbs_per_100g || 0) * factor * 10) / 10,
      fat: Math.round((food.fat_per_100g || 0) * factor * 10) / 10,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-5 space-y-4" style={{ maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold capitalize">Add to {mealType}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search food..." value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
            className="pl-9 bg-secondary border-0 rounded-xl" autoFocus />
        </div>
        <div className="overflow-y-auto space-y-1" style={{ maxHeight: "30vh" }}>
          {filtered.slice(0, 20).map(food => (
            <button key={food.id} onClick={() => setSelected(food)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${selected?.id === food.id ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 hover:bg-secondary"}`}>
              <div>
                <p className="text-sm font-medium">{food.name}</p>
                {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{food.calories_per_100g}</p>
                <p className="text-[10px] text-muted-foreground">kcal/100g</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No foods found. Type a name and add manually.</p>
          )}
        </div>
        {(selected || search) && (
          <div className="flex gap-2 items-center">
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="w-24 bg-secondary border-0 text-center" placeholder="100" />
            <span className="text-sm text-muted-foreground">g</span>
            <Button onClick={handleAdd} className="flex-1 rounded-xl gap-2">
              <Check className="w-4 h-4" /> Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardTab({ entries, date }) {
  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const remaining = MACRO_GOALS.calories - totals.calories;
  const pieData = [
    { name: "Protein", value: totals.protein * 4, color: "#3b82f6" },
    { name: "Carbs", value: totals.carbs * 4, color: "#f59e0b" },
    { name: "Fat", value: totals.fat * 9, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Calories ring */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={pieData.length > 0 ? pieData : [{ name: "Empty", value: 1, color: "hsl(var(--secondary))" }]}
                  cx={45} cy={45} innerRadius={30} outerRadius={45} dataKey="value" strokeWidth={0}>
                  {(pieData.length > 0 ? pieData : [{ color: "hsl(var(--secondary))" }]).map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{Math.round(totals.calories)}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Calories eaten</p>
            <p className="text-3xl font-bold">{Math.round(remaining)}</p>
            <p className="text-xs text-muted-foreground">remaining of {MACRO_GOALS.calories}</p>
          </div>
        </div>
      </div>

      {/* Water Tracker */}
       <WaterTracker date={date} />

       {/* Macro bars */}
       <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
         <MacroBar label="Protein" value={totals.protein} goal={MACRO_GOALS.protein} color="#3b82f6" />
         <MacroBar label="Carbs" value={totals.carbs} goal={MACRO_GOALS.carbs} color="#f59e0b" />
         <MacroBar label="Fat" value={totals.fat} goal={MACRO_GOALS.fat} color="#ef4444" />
       </div>

      {/* Macro summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Protein", value: totals.protein, color: "#3b82f6" },
          { label: "Carbs", value: totals.carbs, color: "#f59e0b" },
          { label: "Fat", value: totals.fat, color: "#ef4444" },
        ].map(m => (
          <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-lg font-bold" style={{ color: m.color }}>{Math.round(m.value)}g</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalTab({ entries, date, onAddToMeal, onDeleteEntry }) {
   const mealGoal = 500; // kcal per meal
   return (
     <div className="space-y-4">
       {MEAL_TYPES.map(meal => {
         const mealEntries = entries.filter(e => e.meal_type === meal);
         const mealCals = mealEntries.reduce((s, e) => s + (e.calories || 0), 0);
         const mealProtein = mealEntries.reduce((s, e) => s + (e.protein || 0), 0);
         const mealCarbs = mealEntries.reduce((s, e) => s + (e.carbs || 0), 0);
         const mealFat = mealEntries.reduce((s, e) => s + (e.fat || 0), 0);
         return (
           <div key={meal} className="bg-card rounded-xl border border-border overflow-hidden">
             <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
               <div className="flex items-center gap-2 flex-1">
                 <div>
                   <p className="text-sm font-bold capitalize">{meal}</p>
                   <p className="text-xs text-muted-foreground">{Math.round(mealCals)} kcal</p>
                 </div>
                 {/* Micro circles for macros */}
                 <div className="flex items-center gap-1 ml-auto mr-3">
                   <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] font-bold text-red-600">{Math.round(mealProtein)}</div>
                   <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-600">{Math.round(mealCarbs)}</div>
                   <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[9px] font-bold text-green-600">{Math.round(mealFat)}</div>
                 </div>
                 {/* Calorie progress bar */}
                 <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                   <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.min((mealCals / mealGoal) * 100, 100)}%` }} />
                 </div>
               </div>
               <button onClick={() => onAddToMeal(meal)}
                 className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                 <Plus className="w-4 h-4" />
               </button>
             </div>
            {mealEntries.length > 0 && (
              <div className="divide-y divide-border/30">
                {mealEntries.map(entry => (
                  <div key={entry.id} className="flex items-center px-4 py-2.5 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{entry.food_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.quantity}{entry.unit} · P:{Math.round(entry.protein || 0)}g C:{Math.round(entry.carbs || 0)}g F:{Math.round(entry.fat || 0)}g
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">{Math.round(entry.calories || 0)}</span>
                    <button onClick={() => onDeleteEntry(entry.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FoodsTab() {
  const [search, setSearch] = useState("");
  const [showAddFood, setShowAddFood] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", calories_per_100g: "", protein_per_100g: "", carbs_per_100g: "", fat_per_100g: "" });
  const queryClient = useQueryClient();

  const { data: foods = [] } = useQuery({ queryKey: ["foods"], queryFn: () => base44.entities.Food.list("name", 200) });
  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.name || !form.calories_per_100g) return;
    await base44.entities.Food.create({ ...form, calories_per_100g: parseFloat(form.calories_per_100g), protein_per_100g: parseFloat(form.protein_per_100g) || 0, carbs_per_100g: parseFloat(form.carbs_per_100g) || 0, fat_per_100g: parseFloat(form.fat_per_100g) || 0, is_custom: true });
    queryClient.invalidateQueries({ queryKey: ["foods"] });
    setShowAddFood(false);
    setForm({ name: "", brand: "", calories_per_100g: "", protein_per_100g: "", carbs_per_100g: "", fat_per_100g: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-0 rounded-xl h-10" />
        </div>
        <Button size="sm" onClick={() => setShowAddFood(true)} className="h-10 px-3 rounded-xl text-xs gap-1 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {showAddFood && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <p className="text-sm font-bold">New Food</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Food name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="bg-secondary border-0 col-span-2" />
            <Input placeholder="Brand (optional)" value={form.brand} onChange={e => setForm(p => ({...p, brand: e.target.value}))} className="bg-secondary border-0 col-span-2" />
            <Input type="number" placeholder="Calories /100g" value={form.calories_per_100g} onChange={e => setForm(p => ({...p, calories_per_100g: e.target.value}))} className="bg-secondary border-0" />
            <Input type="number" placeholder="Protein /100g" value={form.protein_per_100g} onChange={e => setForm(p => ({...p, protein_per_100g: e.target.value}))} className="bg-secondary border-0" />
            <Input type="number" placeholder="Carbs /100g" value={form.carbs_per_100g} onChange={e => setForm(p => ({...p, carbs_per_100g: e.target.value}))} className="bg-secondary border-0" />
            <Input type="number" placeholder="Fat /100g" value={form.fat_per_100g} onChange={e => setForm(p => ({...p, fat_per_100g: e.target.value}))} className="bg-secondary border-0" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddFood(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl" onClick={handleCreate} disabled={!form.name || !form.calories_per_100g}>Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.slice(0, 50).map(food => (
          <div key={food.id} className="flex items-center bg-secondary/50 rounded-xl px-4 py-3 gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{food.name}</p>
              {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold">{food.calories_per_100g}</p>
              <p className="text-[10px] text-muted-foreground">kcal/100g</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Apple className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No foods found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Macros() {
   const urlParams = new URLSearchParams(window.location.search);
   const [tab, setTab] = useState(urlParams.get("tab") || "dashboard");
   const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
   const [addingMeal, setAddingMeal] = useState(null);
   const queryClient = useQueryClient();
   const touchStartX = useRef(null);

  const { data: entries = [] } = useQuery({
    queryKey: ["macroEntries", date],
    queryFn: () => base44.entities.MacroEntry.filter({ date }, "-created_date", 100),
  });

  const handleAddEntry = async (data) => {
    await base44.entities.MacroEntry.create(data);
    queryClient.invalidateQueries({ queryKey: ["macroEntries", date] });
    setAddingMeal(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.MacroEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ["macroEntries", date] });
  };

  const tabs = [
     { id: "dashboard", label: "Dashboard" },
     { id: "journal", label: "Journal" },
     { id: "foods", label: "Foods" },
   ];

   const handleDateSwipe = (e) => {
     if (!touchStartX.current) return;
     const diff = (e.changedTouches?.[0]?.clientX || 0) - touchStartX.current;
     if (Math.abs(diff) > 60) {
       if (diff > 0) setDate(format(subDays(new Date(date), 1), "yyyy-MM-dd"));
       else setDate(format(addDays(new Date(date), 1), "yyyy-MM-dd"));
     }
     touchStartX.current = null;
   };

   return (
     <div className="max-w-lg mx-auto px-4 pt-5 pb-4">
       <div className="flex items-center justify-between mb-4">
         <h1 className="text-2xl font-bold">Macros</h1>
         <input type="date" value={date} onChange={e => setDate(e.target.value)}
           className="text-xs bg-secondary border-0 rounded-lg px-2 py-1.5 text-foreground" />
       </div>

       {/* Tab bar */}
       <div className="flex bg-secondary rounded-xl p-1 mb-5">
         {tabs.map(t => (
           <button key={t.id} onClick={() => setTab(t.id)}
             className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
             {t.label}
           </button>
         ))}
       </div>

       {/* Swipeable date nav for Journal */}
       {tab === "journal" && (
         <div className="flex items-center justify-center gap-3 mb-5" onTouchStart={(e) => touchStartX.current = e.touches[0].clientX} onTouchEnd={handleDateSwipe}>
           <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setDate(format(subDays(new Date(date), 1), "yyyy-MM-dd"))}>
             <ChevronLeft className="w-4 h-4" />
           </Button>
           <div className="text-center">
             <p className="text-sm font-bold">{format(new Date(date), "MMM d")}</p>
             <p className="text-xs text-muted-foreground">{format(new Date(date), "EEEE")}</p>
           </div>
           <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setDate(format(addDays(new Date(date), 1), "yyyy-MM-dd"))}>
             <ChevronRight className="w-4 h-4" />
           </Button>
         </div>
       )}

      {tab === "dashboard" && <DashboardTab entries={entries} date={date} />}
      {tab === "journal" && (
        <JournalTab entries={entries} date={date}
          onAddToMeal={meal => setAddingMeal(meal)}
          onDeleteEntry={handleDelete} />
      )}
      {tab === "foods" && <FoodsTab />}

      {addingMeal && (
        <AddFoodModal mealType={addingMeal} date={date}
          onClose={() => setAddingMeal(null)}
          onAdd={handleAddEntry} />
      )}
    </div>
  );
}