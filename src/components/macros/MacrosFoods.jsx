import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFoodIcon } from "./foodIcons";
import FoodDetailModal from "./FoodDetailModal";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FF9500";

function FoodRow({ food, onSelect }) {
  const icon = getFoodIcon(food.name);
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors text-left"
    >
      <span className="text-xl w-8 text-center shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{food.name}</p>
        {food.brand && <p className="text-xs text-muted-foreground truncate">{food.brand}</p>}
      </div>
      <div className="flex gap-2 shrink-0 items-center">
        <span className="text-[11px] font-bold" style={{ color: PROTEIN_COLOR }}>
          P{Math.round(food.protein_per_100g || 0)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: CARBS_COLOR }}>
          C{Math.round(food.carbs_per_100g || 0)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: FAT_COLOR }}>
          F{Math.round(food.fat_per_100g || 0)}
        </span>
        <span className="text-[11px] font-bold" style={{ color: KCAL_COLOR }}>
          {Math.round(food.calories_per_100g || 0)}
        </span>
      </div>
    </button>
  );
}

function AddFoodForm({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "", brand: "", calories_per_100g: "", protein_per_100g: "",
    carbs_per_100g: "", fat_per_100g: "", fiber_per_100g: "",
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">New Food</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <Input placeholder="Food name *" value={form.name} onChange={e => set("name", e.target.value)}
        className="bg-secondary border-0" />
      <Input placeholder="Brand (optional)" value={form.brand} onChange={e => set("brand", e.target.value)}
        className="bg-secondary border-0" />

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "calories_per_100g", label: "Calories /100g *", color: KCAL_COLOR },
          { key: "protein_per_100g", label: "Protein /100g", color: PROTEIN_COLOR },
          { key: "carbs_per_100g", label: "Carbs /100g", color: CARBS_COLOR },
          { key: "fat_per_100g", label: "Fat /100g", color: FAT_COLOR },
          { key: "fiber_per_100g", label: "Fiber /100g", color: "#8B5CF6" },
        ].map(f => (
          <div key={f.key} className="relative">
            <Input
              type="number"
              placeholder={f.label}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              className="bg-secondary border-0 pl-3"
              style={{ borderLeft: `3px solid ${f.color}` }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
        <Button
          className="flex-1 rounded-xl"
          disabled={!form.name || !form.calories_per_100g}
          onClick={() => onCreate(form)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default function MacrosFoods({ macroGoals, dailyTotals, date }) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const queryClient = useQueryClient();

  const { data: foods = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: () => base44.entities.Food.list("name", 200),
  });

  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  const recent = foods.slice(0, 5); // last 5 by creation order
  const saved = foods.filter(f => f.is_custom);

  const handleCreate = async (form) => {
    await base44.entities.Food.create({
      ...form,
      calories_per_100g: parseFloat(form.calories_per_100g) || 0,
      protein_per_100g: parseFloat(form.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
      fat_per_100g: parseFloat(form.fat_per_100g) || 0,
      fiber_per_100g: parseFloat(form.fiber_per_100g) || 0,
      is_custom: true,
    });
    queryClient.invalidateQueries({ queryKey: ["foods"] });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0 rounded-xl h-10"
            autoFocus={false}
          />
        </div>
        <Button size="sm" onClick={() => setShowAddForm(v => !v)} className="h-10 px-3 rounded-xl text-xs gap-1 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {showAddForm && <AddFoodForm onClose={() => setShowAddForm(false)} onCreate={handleCreate} />}

      {/* Search results */}
      {search ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-semibold px-1">Results</p>
          {filtered.slice(0, 30).map(food => (
            <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No foods found</p>
          )}
        </div>
      ) : (
        <>
          {/* Recent */}
          {recent.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground font-semibold">Recent</p>
                <p className="text-[10px] text-muted-foreground">Most Recent</p>
              </div>
              {recent.map(food => (
                <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
              ))}
            </div>
          )}

          {/* Saved / Custom */}
          {saved.length > 0 && (
            <div className="space-y-1 mt-2">
              <p className="text-xs text-muted-foreground font-semibold px-1">Saved</p>
              {saved.map(food => (
                <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
              ))}
            </div>
          )}

          {foods.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-sm text-muted-foreground">No foods yet. Add one to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Food detail modal — view only from Foods tab (no add) */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          macroGoals={macroGoals}
          dailyTotals={dailyTotals}
          mealType={null}
          date={date}
          onClose={() => setSelectedFood(null)}
          onAdd={null}
        />
      )}
    </div>
  );
}