import React, { useState, useMemo, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Trash2, Search, ChevronLeft, ScanLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

const BASE_UNITS = ["g", "serving", "cup", "tsp", "tbsp", "fl oz", "ml", "oz", "lb"];

const FOOD_EMOJIS = [
  "🍕","🍔","🌮","🌯","🥗","🥙","🥪","🌭","🍟","🍿",
  "🍳","🥚","🥞","🧇","🥓","🥩","🍗","🍖","🌽","🥦",
  "🥕","🥑","🍅","🍆","🥔","🧅","🧄","🫑","🫒","🥝",
  "🍇","🍓","🫐","🍌","🍉","🍎","🍊","🍋","🍑","🍒",
  "🥣","🍲","🫕","🍜","🍝","🍛","🍱","🍣","🍤","🦐",
  "🦞","🦀","🦑","🥘","🫔","🥫","🧆","🧀","🫙","🧂",
  "🍰","🎂","🧁","🍩","🍪","🍫","🍬","🍭","🍮","🥧",
  "🍦","🍨","🍧","🫖","☕","🧃","🥤","🍵","🧋","🍺",
];

function AutoGrowTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="flex-1 bg-secondary border-0 rounded-xl text-sm p-3 resize-none outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed overflow-hidden"
      style={{ fontSize: "16px", minHeight: "44px" }}
    />
  );
}

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-3xl border-2 border-border hover:border-primary/50 transition-colors shrink-0"
      >
        {value || "🍽️"}
      </button>
      {open && (
        <div className="absolute top-16 left-0 z-20 bg-card border border-border rounded-2xl p-3 shadow-xl w-72">
          <div className="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
            {FOOD_EMOJIS.map(e => (
              <button key={e} type="button"
                onClick={() => { onChange(e); setOpen(false); }}
                className={`w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-secondary transition-colors ${value === e ? "bg-primary/20 ring-1 ring-primary" : ""}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
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

function FoodPickerAddForm({ prefill, onCreate, onClose }) {
  const [form, setForm] = useState({
    name: prefill?.name || "",
    brand: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fat_per_100g: "",
    fiber_per_100g: "",
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">New Food</p>
        <button onClick={onClose} className="text-xs text-muted-foreground underline">Cancel</button>
      </div>
      <Input placeholder="Food name *" value={form.name} onChange={e => set("name", e.target.value)}
        className="bg-secondary border-0 h-11 rounded-xl font-medium" />
      <Input placeholder="Brand (optional)" value={form.brand} onChange={e => set("brand", e.target.value)}
        className="bg-secondary border-0 rounded-xl text-sm" />
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground font-semibold px-2">Per 100g</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {macroFields.map(f => (
        <div key={f.key} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
          <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{f.label}</span>
          <Input type="number" placeholder="0" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
            className="flex-1 bg-transparent border-0 text-right font-bold h-7 p-0 focus:ring-0" />
          <span className="text-[10px] text-muted-foreground w-6 shrink-0">{f.unit}</span>
        </div>
      ))}
      <Button className="w-full rounded-xl font-bold" disabled={!form.name || !form.calories_per_100g}
        onClick={() => onCreate(form)}>
        Save Food
      </Button>
    </div>
  );
}

function FoodPickerRow({ food, onSelect }) {
  const ratio = (food.serving_size || 100) / 100;
  const cal = Math.round((food.calories_per_100g || 0) * ratio);
  const protein = Math.round((food.protein_per_100g || 0) * ratio);
  const carbs = Math.round((food.carbs_per_100g || 0) * ratio);
  const fat = Math.round((food.fat_per_100g || 0) * ratio);
  return (
    <button onClick={() => onSelect(food)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary hover:bg-border transition-colors text-left active:scale-[0.98]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{food.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {food.brand && <span className="text-[10px] text-muted-foreground italic">{food.brand} ·</span>}
          <span className="text-[10px] font-bold" style={{ color: PROTEIN_COLOR }}>P:{protein}g</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] font-bold" style={{ color: CARBS_COLOR }}>C:{carbs}g</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] font-bold" style={{ color: FAT_COLOR }}>F:{fat}g</span>
        </div>
      </div>
      <span className="text-sm font-bold shrink-0" style={{ color: KCAL_COLOR }}>🔥{cal}</span>
    </button>
  );
}

function FoodPicker({ foods, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addPrefill, setAddPrefill] = useState(null);
  const [showScan, setShowScan] = useState(false);
  const queryClient = useQueryClient();

  const filtered = foods.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  const recent = foods.filter(f => f.is_custom).slice(0, 5);

  const handleCreate = async (form) => {
    const food = await base44.entities.Food.create({
      ...form,
      calories_per_100g: parseFloat(form.calories_per_100g) || 0,
      protein_per_100g: parseFloat(form.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
      fat_per_100g: parseFloat(form.fat_per_100g) || 0,
      fiber_per_100g: parseFloat(form.fiber_per_100g) || 0,
      is_custom: true,
    });
    queryClient.invalidateQueries({ queryKey: ["foods"] });
    onSelect({ ...food, ...form, calories_per_100g: parseFloat(form.calories_per_100g) || 0 });
  };

  // Lazy-import ScanFoodModal to avoid circular
  const ScanFoodModal = React.lazy(() => import("./ScanFoodModal"));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end justify-center">
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 flex flex-col" style={{ maxHeight: "95vh" }}>
        {/* Handle */}
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <p className="font-bold text-sm">Add Ingredient</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search + scan + add row */}
        <div className="px-4 pb-3 flex gap-2 items-center shrink-0">
          <button onClick={() => setShowScan(true)}
            className="h-10 w-10 shrink-0 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
            <ScanLine className="w-4 h-4 text-primary" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-0 rounded-xl h-10" autoFocus />
          </div>
          <button onClick={() => { setAddPrefill(search ? { name: search } : null); setShowAddForm(v => !v); }}
            className="h-10 px-3 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5 text-xs font-bold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 space-y-4">
          {/* Add form inline */}
          {showAddForm && (
            <div className="bg-secondary/40 rounded-2xl p-4 border border-border/50">
              <FoodPickerAddForm
                prefill={addPrefill}
                onCreate={handleCreate}
                onClose={() => setShowAddForm(false)}
              />
            </div>
          )}

          {search ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-semibold">Results ({filtered.length})</p>
              {filtered.slice(0, 40).map(food => (
                <FoodPickerRow key={food.id} food={food} onSelect={onSelect} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm text-muted-foreground">No foods found for "{search}"</p>
                  <button onClick={() => { setAddPrefill({ name: search }); setShowAddForm(true); }}
                    className="mt-2 text-xs text-primary underline">
                    Add "{search}" as new food
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {recent.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-semibold">My Foods</p>
                  {recent.map(food => <FoodPickerRow key={food.id} food={food} onSelect={onSelect} />)}
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold">All Foods ({foods.length})</p>
                {foods.slice(0, 30).map(food => <FoodPickerRow key={food.id} food={food} onSelect={onSelect} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scan modal */}
      {showScan && (
        <React.Suspense fallback={null}>
          <ScanFoodModal onClose={() => setShowScan(false)} />
        </React.Suspense>
      )}
    </div>
  );
}

export default function RecipeBuilder({ recipe, onClose, onSaved }) {
  const [name, setName] = useState(recipe?.name || "");
  const [icon, setIcon] = useState(recipe?.icon || "");
  const [servings, setServings] = useState(recipe?.servings || 1);
  const [ingredients, setIngredients] = useState(
    (recipe?.ingredients || []).map(ing => ({
      ...ing,
      qty: ing.qty ?? ing.quantity ?? 100,
      unit: ing.unit ?? "g",
    }))
  );
  const [steps, setSteps] = useState(recipe?.steps || []);
  const [macroView, setMacroView] = useState("total"); // "total" | "serving"
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
      icon: icon || "",
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
        {/* Recipe Icon + Name */}
        <div className="flex items-center gap-3">
          <EmojiPicker value={icon} onChange={setIcon} />
          <Input
            placeholder="Recipe name (e.g. Ham Sandwich)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-secondary border-0 h-14 rounded-xl font-semibold text-base flex-1"
          />
        </div>

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
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                {macroView === "serving" && servings > 1 ? `Per Serving (÷${servings})` : "Total Macros"}
              </p>
              {servings > 1 && (
                <div className="flex bg-background rounded-lg p-0.5 gap-0.5">
                  {["total", "serving"].map(v => (
                    <button key={v} onClick={() => setMacroView(v)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                        macroView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}>
                      {v === "total" ? "Total" : "Serving"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const div = macroView === "serving" && servings > 1 ? servings : 1;
                return [
                  { label: "Calories", val: Math.round(totals.calories / div), color: KCAL_COLOR },
                  { label: "Protein", val: `${Math.round(totals.protein / div)}g`, color: PROTEIN_COLOR },
                  { label: "Carbs", val: `${Math.round(totals.carbs / div)}g`, color: CARBS_COLOR },
                  { label: "Fat", val: `${Math.round(totals.fat / div)}g`, color: FAT_COLOR },
                ];
              })().map(m => (
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
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-2.5">
                  <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                </div>
                <AutoGrowTextarea
                  placeholder={`Step ${idx + 1}…`}
                  value={step}
                  onChange={val => updateStep(idx, val)}
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