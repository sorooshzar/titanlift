import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, Plus, Trash2, Search, ChevronLeft, Delete, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

const BASE_UNITS = ["g", "serving", "cup", "tsp", "tbsp", "fl oz", "ml", "oz", "lb"];
const UNIT_TO_G = { cup: 240, tsp: 5, tbsp: 15, "fl oz": 30, ml: 1, oz: 28.35, lb: 453.6, g: 1 };

function toGrams(qty, unit, servingSize = 100) {
  if (unit === "serving") return qty * servingSize;
  return qty * (UNIT_TO_G[unit] || 1);
}

function calcTotals(ingredients) {
  return ingredients.reduce(
    (acc, ing) => {
      const grams = toGrams(ing.qty, ing.unit, ing.food_serving_size);
      const ratio = grams / 100;
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

// Inline quantity picker that appears below an ingredient row
function IngredientQtyPicker({ ingredient, onConfirm, onClose }) {
  const [display, setDisplay] = useState(String(ingredient.qty || 1));
  const [unit, setUnit] = useState(ingredient.unit || "g");

  const qty = parseFloat(display) || 0;
  const grams = toGrams(qty, unit, ingredient.food_serving_size);
  const ratio = grams / 100;
  const cal = Math.round((ingredient.calories_per_100g || 0) * ratio);
  const protein = ((ingredient.protein_per_100g || 0) * ratio).toFixed(1);
  const carbs = ((ingredient.carbs_per_100g || 0) * ratio).toFixed(1);
  const fat = ((ingredient.fat_per_100g || 0) * ratio).toFixed(1);

  const press = (val) => {
    if (val === "⌫") {
      setDisplay(p => p.length > 1 ? p.slice(0, -1) : "0");
    } else if (val === ".") {
      if (!display.includes(".")) setDisplay(p => p + ".");
    } else {
      setDisplay(p => p === "0" ? val : p.length >= 6 ? p : p + val);
    }
  };

  const KEYS = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];
  const unitLabel = unit === "serving"
    ? `serving (${ingredient.food_serving_size || 100}g)`
    : unit === "g" ? `${Math.round(grams)}g` : `${unit} (${Math.round(grams)}g)`;

  return (
    <div className="fixed inset-0 bg-black/70 z-[80] flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-sm font-bold truncate max-w-[220px]">{ingredient.food_name}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display + macro preview */}
        <div className="px-5 pb-2">
          <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-4xl font-bold tracking-tight">{display}</span>
            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">{unitLabel}</p>
              <p className="text-xs mt-0.5">
                <span style={{ color: KCAL_COLOR }}>🔥{cal}</span>
                {" "}<span style={{ color: PROTEIN_COLOR }}>P{protein}</span>
                {" "}<span style={{ color: CARBS_COLOR }}>C{carbs}</span>
                {" "}<span style={{ color: FAT_COLOR }}>F{fat}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Unit selector */}
        <div className="px-5 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {BASE_UNITS.map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  unit === u ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground"
                }`}
              >{u}</button>
            ))}
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-1 px-3 pb-2">
          {KEYS.map(k => (
            <button key={k} onClick={() => press(k)}
              className={`h-12 rounded-xl text-lg font-semibold transition-colors ${
                k === "⌫" ? "bg-secondary/60 text-muted-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >{k}</button>
          ))}
        </div>

        {/* Done */}
        <div className="px-3 pb-5">
          <button
            onClick={() => onConfirm({ qty, unit, grams })}
            className="w-full h-12 rounded-xl font-semibold text-sm bg-primary text-primary-foreground"
          >Done</button>
        </div>
      </div>
    </div>
  );
}

function FoodPicker({ foods, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end justify-center">
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
            <Input placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0 rounded-xl h-10" autoFocus />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-1.5">
          {filtered.slice(0, 40).map(food => (
            <button key={food.id} onClick={() => onSelect(food)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary hover:bg-border transition-colors text-left">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{food.name}</p>
                {food.brand && <p className="text-[10px] text-muted-foreground">{food.brand}</p>}
              </div>
              <span className="text-xs font-bold shrink-0" style={{ color: KCAL_COLOR }}>
                🔥{Math.round(food.calories_per_100g || 0)}/100g
              </span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No foods found</p>}
        </div>
      </div>
    </div>
  );
}

export default function RecipeBuilder({ recipe, onClose, onSaved }) {
  const [name, setName] = useState(recipe?.name || "");
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [ingredients, setIngredients] = useState(
    (recipe?.ingredients || []).map(ing => ({
      ...ing,
      qty: ing.qty ?? ing.quantity ?? 100,
      unit: ing.unit ?? "g",
    }))
  );
  const [steps, setSteps] = useState(recipe?.steps || []);
  const [showPicker, setShowPicker] = useState(false);
  const [editingIngredientIdx, setEditingIngredientIdx] = useState(null);
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
      qty: 1,
      unit: "serving",
      food_serving_size: food.serving_size || 100,
      calories_per_100g: food.calories_per_100g || 0,
      protein_per_100g: food.protein_per_100g || 0,
      carbs_per_100g: food.carbs_per_100g || 0,
      fat_per_100g: food.fat_per_100g || 0,
    }]);
    setShowPicker(false);
  };

  const confirmQty = (idx, { qty, unit }) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, qty, unit } : ing));
    setEditingIngredientIdx(null);
  };

  const removeIngredient = (idx) => setIngredients(prev => prev.filter((_, i) => i !== idx));

  const addStep = () => setSteps(prev => [...prev, ""]);
  const updateStep = (idx, val) => setSteps(prev => prev.map((s, i) => i === idx ? val : s));
  const removeStep = (idx) => setSteps(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim() || ingredients.length === 0) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      servings: servings || 1,
      ingredients: ingredients.map(ing => ({
        ...ing,
        quantity: toGrams(ing.qty, ing.unit, ing.food_serving_size), // keep legacy field for log
      })),
      steps: steps.filter(s => s.trim()),
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
    <div className="fixed inset-0 bg-background z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 border-b border-border/30 bg-background shrink-0">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-base">{recipe ? "Edit Recipe" : "New Recipe"}</p>
        <div className="w-9" />
      </div>

      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5 pb-32">
        {/* Recipe Name */}
        <Input
          placeholder="Recipe name (e.g. Ham Sandwich)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-secondary border-0 h-12 rounded-xl font-semibold text-base"
        />

        {/* Servings */}
        <div className="flex items-center justify-between bg-secondary/60 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Servings</p>
            <p className="text-[10px] text-muted-foreground">e.g. 8 slices of pizza</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setServings(s => Math.max(1, s - 1))}
              className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-lg">−</button>
            <span className="text-base font-bold w-8 text-center">{servings}</span>
            <button onClick={() => setServings(s => s + 1)}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">+</button>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ingredients</p>
            <button onClick={() => setShowPicker(true)}
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg">
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
              const grams = toGrams(ing.qty, ing.unit, ing.food_serving_size);
              const ratio = grams / 100;
              const cal = Math.round((ing.calories_per_100g || 0) * ratio);
              const protein = ((ing.protein_per_100g || 0) * ratio).toFixed(1);
              const carbs = ((ing.carbs_per_100g || 0) * ratio).toFixed(1);
              const fat = ((ing.fat_per_100g || 0) * ratio).toFixed(1);
              const unitLabel = ing.unit === "serving"
                ? `${ing.qty} serving` : `${ing.qty} ${ing.unit}`;

              return (
                <div key={idx} className="bg-secondary/60 rounded-xl px-3 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ing.food_name}</p>
                    </div>
                    <button
                      onClick={() => setEditingIngredientIdx(idx)}
                      className="shrink-0 bg-background rounded-lg px-2.5 py-1 text-xs font-bold border border-border"
                    >{unitLabel}</button>
                    <button onClick={() => removeIngredient(idx)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 shrink-0">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold" style={{ color: KCAL_COLOR }}>🔥{cal} kcal</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-bold" style={{ color: PROTEIN_COLOR }}>P:{protein}g</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-bold" style={{ color: CARBS_COLOR }}>C:{carbs}g</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-bold" style={{ color: FAT_COLOR }}>F:{fat}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Totals */}
        {ingredients.length > 0 && (
          <div className="bg-secondary rounded-2xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
              Total Macros {servings > 1 && <span className="normal-case">· per serving: {Math.round(totals.calories / servings)} kcal</span>}
            </p>
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

        {/* Instructions */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Instructions</p>
            <button onClick={addStep}
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          {steps.length === 0 && (
            <div className="text-center py-6 bg-secondary/30 rounded-2xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">No steps added yet. Optional.</p>
            </div>
          )}

          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-2">
                  <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                </div>
                <Input
                  placeholder={`Step ${idx + 1}…`}
                  value={step}
                  onChange={e => updateStep(idx, e.target.value)}
                  className="flex-1 bg-secondary border-0 rounded-xl text-sm"
                />
                <button onClick={() => removeStep(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 mt-1 shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/30 z-10" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <Button
          className="w-full h-12 rounded-xl font-bold text-base"
          disabled={!name.trim() || ingredients.length === 0 || saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : recipe ? "Update Recipe" : "Save Recipe"}
        </Button>
      </div>

      {showPicker && <FoodPicker foods={foods} onSelect={addIngredient} onClose={() => setShowPicker(false)} />}
      {editingIngredientIdx !== null && (
        <IngredientQtyPicker
          ingredient={ingredients[editingIngredientIdx]}
          onConfirm={(result) => confirmQty(editingIngredientIdx, result)}
          onClose={() => setEditingIngredientIdx(null)}
        />
      )}
    </div>
  );
}