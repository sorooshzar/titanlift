import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, Plus, Trash2, Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

function calcTotals(ingredients) {
  return ingredients.reduce(
    (acc, ing) => {
      const ratio = (ing.quantity || 0) / 100;
      return {
        calories: acc.calories + (ing.calories_per_100g || 0) * ratio,
        protein: acc.protein + (ing.protein_per_100g || 0) * ratio,
        carbs: acc.carbs + (ing.carbs_per_100g || 0) * ratio,
        fat: acc.fat + (ing.fat_per_100g || 0) * ratio,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function FoodPicker({ foods, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = foods.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 flex flex-col" style={{ maxHeight: "75vh" }}>
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto mt-3 mb-2" />
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="font-bold text-sm">Select Food</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search foods..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0 rounded-xl h-10"
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-1.5">
          {filtered.slice(0, 40).map(food => (
            <button
              key={food.id}
              onClick={() => onSelect(food)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary hover:bg-border transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{food.name}</p>
                {food.brand && <p className="text-[10px] text-muted-foreground">{food.brand}</p>}
              </div>
              <span className="text-xs font-bold shrink-0" style={{ color: KCAL_COLOR }}>
                🔥{Math.round(food.calories_per_100g || 0)}/100g
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No foods found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecipeBuilder({ recipe, onClose, onSaved }) {
  const [name, setName] = useState(recipe?.name || "");
  const [ingredients, setIngredients] = useState(recipe?.ingredients || []);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: foods = [] } = useQuery({
    queryKey: ["foods"],
    queryFn: () => base44.entities.Food.list("name", 500),
  });

  const totals = useMemo(() => calcTotals(ingredients), [ingredients]);

  const addIngredient = (food) => {
    setIngredients(prev => [...prev, {
      food_id: food.id,
      food_name: food.name,
      quantity: food.serving_size || 100,
      unit: "g",
      calories_per_100g: food.calories_per_100g || 0,
      protein_per_100g: food.protein_per_100g || 0,
      carbs_per_100g: food.carbs_per_100g || 0,
      fat_per_100g: food.fat_per_100g || 0,
    }]);
    setShowPicker(false);
  };

  const updateQty = (idx, val) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, quantity: parseFloat(val) || 0 } : ing));
  };

  const removeIngredient = (idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim() || ingredients.length === 0) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      ingredients,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein),
      total_carbs: Math.round(totals.carbs),
      total_fat: Math.round(totals.fat),
    };
    if (recipe?.id) {
      await base44.entities.Recipe.update(recipe.id, payload);
    } else {
      await base44.entities.Recipe.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 flex flex-col" style={{ maxHeight: "92vh" }}>
        {/* Handle */}
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto mt-3 mb-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="font-bold text-base">{recipe ? "Edit Recipe" : "New Recipe"}</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 space-y-4 pb-4">
          {/* Recipe Name */}
          <Input
            placeholder="Recipe name (e.g. Ham Sandwich)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-secondary border-0 h-12 rounded-xl font-semibold text-base"
          />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ingredients</p>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Add Food
              </button>
            </div>

            {ingredients.length === 0 && (
              <div className="text-center py-8 bg-secondary/50 rounded-2xl">
                <p className="text-2xl mb-1">🥗</p>
                <p className="text-sm text-muted-foreground">Tap "Add Food" to build your recipe</p>
              </div>
            )}

            <div className="space-y-2">
              {ingredients.map((ing, idx) => {
                const ratio = (ing.quantity || 0) / 100;
                const cal = Math.round((ing.calories_per_100g || 0) * ratio);
                return (
                  <div key={idx} className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ing.food_name}</p>
                      <p className="text-[10px] font-bold mt-0.5" style={{ color: KCAL_COLOR }}>🔥{cal} kcal</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        value={ing.quantity}
                        onChange={e => updateQty(idx, e.target.value)}
                        className="w-16 h-8 text-right bg-background border-0 rounded-lg text-sm font-bold p-1"
                      />
                      <span className="text-xs text-muted-foreground">g</span>
                    </div>
                    <button onClick={() => removeIngredient(idx)} className="w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 ml-1 shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Totals */}
          {ingredients.length > 0 && (
            <div className="bg-secondary rounded-2xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">Total Macros</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Calories", val: Math.round(totals.calories), color: KCAL_COLOR },
                  { label: "Protein", val: `${Math.round(totals.protein)}g`, color: PROTEIN_COLOR },
                  { label: "Carbs", val: `${Math.round(totals.carbs)}g`, color: CARBS_COLOR },
                  { label: "Fat", val: `${Math.round(totals.fat)}g`, color: FAT_COLOR },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <p className="text-sm font-black" style={{ color: m.color }}>{m.val}</p>
                    <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="p-4 shrink-0 border-t border-border/30">
          <Button
            className="w-full h-12 rounded-xl font-bold text-base"
            disabled={!name.trim() || ingredients.length === 0 || saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : recipe ? "Update Recipe" : "Save Recipe"}
          </Button>
        </div>
      </div>

      {showPicker && (
        <FoodPicker
          foods={foods}
          onSelect={addIngredient}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}