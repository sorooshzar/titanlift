import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, X, ScanLine, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFoodIcon } from "./foodIcons";
import FoodDetailModal from "./FoodDetailModal";
import ScanFoodModalNew from "./ScanFoodModalNew";
import RecipesTab from "./RecipesTab";
import { motion, AnimatePresence } from "framer-motion";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

function FoodRow({ food, onSelect }) {
  const icon = getFoodIcon(food.name);
  const ratio = (food.serving_size || 100) / 100;
  const cal = Math.round((food.calories_per_100g || 0) * ratio);
  const protein = Math.round((food.protein_per_100g || 0) * ratio);
  const carbs = Math.round((food.carbs_per_100g || 0) * ratio);
  const fat = Math.round((food.fat_per_100g || 0) * ratio);
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1 min-w-0">
          <p className="text-sm font-semibold truncate">{food.name}</p>
          {food.brand && <span className="text-[10px] text-muted-foreground shrink-0 italic">{food.brand}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[10px] font-bold" style={{ color: PROTEIN_COLOR }}>P:{protein}g</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] font-bold" style={{ color: CARBS_COLOR }}>C:{carbs}g</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] font-bold" style={{ color: FAT_COLOR }}>F:{fat}g</span>
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <span className="text-sm font-bold" style={{ color: KCAL_COLOR }}>🔥{cal}</span>
      </div>
    </button>
  );
}

function AddFoodForm({ onClose, onCreate, prefill }) {
  const [form, setForm] = useState({
    name: prefill?.name || "",
    brand: prefill?.brand || "",
    calories_per_100g: prefill?.calories_per_100g || "",
    protein_per_100g: prefill?.protein_per_100g || "",
    carbs_per_100g: prefill?.carbs_per_100g || "",
    fat_per_100g: prefill?.fat_per_100g || "",
    fiber_per_100g: prefill?.fiber_per_100g || "",
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const macroFields = [
    { key: "calories_per_100g", label: "Calories", unit: "kcal", color: KCAL_COLOR },
    { key: "protein_per_100g", label: "Protein", unit: "g", color: PROTEIN_COLOR },
    { key: "carbs_per_100g", label: "Carbs", unit: "g", color: CARBS_COLOR },
    { key: "fat_per_100g", label: "Fat", unit: "g", color: FAT_COLOR },
    { key: "fiber_per_100g", label: "Fiber", unit: "g", color: "#8B5CF6" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
        <p className="text-sm font-bold">New Food</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Name & Brand */}
        <div className="space-y-2">
          <Input
            placeholder="Food name *"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            className="bg-secondary border-0 h-11 rounded-xl font-medium"
          />
          <Input
            placeholder="Brand (optional)"
            value={form.brand}
            onChange={e => set("brand", e.target.value)}
            className="bg-secondary border-0 rounded-xl text-sm"
          />
        </div>

        {/* Per 100g label */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground font-semibold px-2">Per 100g</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Macro inputs — card style */}
        <div className="grid grid-cols-1 gap-2">
          {macroFields.map(f => (
            <div key={f.key} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
              <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{f.label}</span>
              <Input
                type="number"
                placeholder="0"
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="flex-1 bg-transparent border-0 text-right font-bold h-7 p-0 focus:ring-0"
              />
              <span className="text-[10px] text-muted-foreground w-6 shrink-0">{f.unit}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 rounded-xl font-bold"
            disabled={!form.name || !form.calories_per_100g}
            onClick={() => onCreate(form)}
          >
            Save Food
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MacrosFoods({ macroGoals, dailyTotals, date, addingMeal, onAdd, onClearMeal }) {
  const [foodsView, setFoodsView] = useState("foods"); // "foods" | "recipes"
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const queryClient = useQueryClient();

  const { data: foods = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      return base44.entities.Food.list("name", 500);
    },
  });

  // Recent = last 5 distinct foods the current user has logged, derived from MacroEntries
  const { data: recentEntries = [] } = useQuery({
    queryKey: ["recentFoodEntries"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.MacroEntry.filter({ created_by: user.email }, "-created_date", 50);
    },
  });

  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  // Build recent list: unique food_ids from user's recent entries, matched against the food library
  const recent = (() => {
    const seen = new Set();
    const result = [];
    for (const entry of recentEntries) {
      if (result.length >= 5) break;
      const key = entry.food_id || entry.food_name;
      if (seen.has(key)) continue;
      seen.add(key);
      const food = entry.food_id
        ? foods.find(f => f.id === entry.food_id)
        : foods.find(f => f.name === entry.food_name);
      if (food) result.push(food);
    }
    return result;
  })();

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
    setPrefillData(null);
  };

  const handleScanResult = (foodData) => {
    // Pre-fill the add food form with scanned data
    setPrefillData(foodData);
    setShowAddForm(true);
    setShowScan(false);
  };

  return (
    <div className="space-y-3">
      {/* Foods / Recipes toggle */}
      <div className="flex bg-secondary/80 rounded-xl p-0.5">
        {["foods", "recipes"].map(v => (
          <button key={v} onClick={() => setFoodsView(v)}
            className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold capitalize transition-all duration-200 ${
              foodsView === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}>
            {v === "foods" ? "Foods" : "Recipes"}
          </button>
        ))}
      </div>

      {/* Recipes view */}
      {foodsView === "recipes" && (
        <RecipesTab date={date} addingMeal={addingMeal} onAdd={onAdd} onClearMeal={onClearMeal} />
      )}

      {/* Foods view */}
      {foodsView === "foods" && <>

      {/* Meal context banner */}
      {addingMeal && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-primary">
            Adding to <span className="capitalize">{addingMeal}</span>
          </p>
          <button onClick={onClearMeal} className="text-[10px] text-muted-foreground underline">cancel</button>
        </div>
      )}

      {/* Top action bar: Scan | Search | Add */}
      <div className="flex gap-2 items-center">
        {/* Scan button */}
        <button
          onClick={() => setShowScan(true)}
          className="h-10 w-10 shrink-0 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
          title="Scan barcode or label"
        >
          <ScanLine className="w-4 h-4 text-primary" />
        </button>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search foods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-0 rounded-xl h-10"
          />
        </div>

        {/* Add button */}
        <button
          onClick={() => { setShowAddForm(v => !v); setPrefillData(null); }}
          className="h-10 px-3 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5 text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Add Food Form */}
      <AnimatePresence>
        {showAddForm && (
          <AddFoodForm
            onClose={() => { setShowAddForm(false); setPrefillData(null); }}
            onCreate={handleCreate}
            prefill={prefillData}
          />
        )}
      </AnimatePresence>

      {/* Food list */}
      {search ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-semibold px-1">Results ({filtered.length})</p>
          {filtered.slice(0, 30).map(food => (
            <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm text-muted-foreground">No foods found for "{search}"</p>
              <button
                onClick={() => { setShowAddForm(true); setPrefillData({ name: search }); }}
                className="mt-2 text-xs text-primary underline"
              >
                Add "{search}" as new food
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-semibold px-1">Recent</p>
              {recent.map(food => (
                <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
              ))}
            </div>
          )}

          {saved.length > 0 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-xs text-muted-foreground font-semibold px-1">My Foods</p>
              {saved.map(food => (
                <FoodRow key={food.id} food={food} onSelect={setSelectedFood} />
              ))}
            </div>
          )}

          {foods.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-sm font-semibold mb-1">No foods yet</p>
              <p className="text-xs text-muted-foreground">Scan a barcode or add manually</p>
            </div>
          )}
        </>
      )}

      {/* Food detail modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          macroGoals={macroGoals}
          dailyTotals={dailyTotals}
          mealType={addingMeal}
          date={date}
          onClose={() => setSelectedFood(null)}
          onAdd={(data) => { onAdd(data); onClearMeal(); setSelectedFood(null); }}
        />
      )}

      {/* Scan modal */}
      {showScan && (
        <ScanFoodModalNew
          onClose={() => setShowScan(false)}
        />
      )}

      </> /* end foods view */}
    </div>
  );
}