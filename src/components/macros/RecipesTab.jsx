import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ChefHat, Pencil, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecipeBuilder from "./RecipeBuilder";

const PROTEIN_COLOR = "#FF0055";
const CARBS_COLOR = "#00AAFF";
const FAT_COLOR = "#00CC66";
const KCAL_COLOR = "#FFD700";

function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-5 w-full max-w-xs space-y-4">
        <p className="font-bold text-base text-center">Delete Recipe?</p>
        <p className="text-sm text-muted-foreground text-center">This cannot be undone.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" className="flex-1 rounded-xl" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onEdit, onDelete, onLog }) {
  const ingredientPreview = (recipe.ingredients || [])
    .slice(0, 3)
    .map(i => i.food_name)
    .join(", ");
  const moreCount = (recipe.ingredients || []).length - 3;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{recipe.name}</p>
          {ingredientPreview && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {ingredientPreview}{moreCount > 0 ? ` +${moreCount} more` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(recipe)} className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(recipe)} className="w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Macros row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-black" style={{ color: KCAL_COLOR }}>🔥{recipe.total_calories || 0}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">kcal</span>
        </div>
        <span className="text-[10px] font-bold" style={{ color: PROTEIN_COLOR }}>P:{recipe.total_protein || 0}g</span>
        <span className="text-[10px] font-bold" style={{ color: CARBS_COLOR }}>C:{recipe.total_carbs || 0}g</span>
        <span className="text-[10px] font-bold" style={{ color: FAT_COLOR }}>F:{recipe.total_fat || 0}g</span>
        <div className="flex-1" />
        <button
          onClick={() => onLog(recipe)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors active:scale-[0.97]"
        >
          <Zap className="w-3.5 h-3.5" /> Log
        </button>
      </div>
    </div>
  );
}

export default function RecipesTab({ date, addingMeal, onAdd, onClearMeal }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const queryClient = useQueryClient();

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Recipe.filter({ created_by: user.email }, "-created_date", 100);
    },
  });

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
    setShowBuilder(false);
    setEditingRecipe(null);
  };

  const handleDelete = async () => {
    await base44.entities.Recipe.delete(deletingRecipe.id);
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
    setDeletingRecipe(null);
  };

  const handleLog = async (recipe) => {
    const mealType = addingMeal || "snack";
    const logDate = date;
    // Log each ingredient as its own MacroEntry
    const promises = (recipe.ingredients || []).map(ing => {
      const ratio = (ing.quantity || 0) / 100;
      return base44.entities.MacroEntry.create({
        date: logDate,
        meal_type: mealType,
        food_name: ing.food_name,
        food_id: ing.food_id,
        quantity: ing.quantity,
        unit: "g",
        calories: Math.round((ing.calories_per_100g || 0) * ratio),
        protein: Math.round((ing.protein_per_100g || 0) * ratio),
        carbs: Math.round((ing.carbs_per_100g || 0) * ratio),
        fat: Math.round((ing.fat_per_100g || 0) * ratio),
      });
    });
    await Promise.all(promises);
    // Notify parent
    if (onAdd) onAdd(null); // triggers invalidation in parent
    if (onClearMeal) onClearMeal();
    queryClient.invalidateQueries({ queryKey: ["macroEntries", logDate] });
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Meal banner */}
      {addingMeal && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-primary">
            Logging to <span className="capitalize">{addingMeal}</span>
          </p>
          <button onClick={onClearMeal} className="text-[10px] text-muted-foreground underline">cancel</button>
        </div>
      )}

      {/* Create button */}
      <button
        onClick={() => { setEditingRecipe(null); setShowBuilder(true); }}
        className="w-full h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-primary/15"
      >
        <Plus className="w-4 h-4" /> Create Recipe
      </button>

      {/* Recipe list */}
      {recipes.length === 0 ? (
        <div className="text-center py-14">
          <ChefHat className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold mb-1">No recipes yet</p>
          <p className="text-xs text-muted-foreground">Build it once, log it in one tap forever.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recipes.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onEdit={(r) => { setEditingRecipe(r); setShowBuilder(true); }}
              onDelete={setDeletingRecipe}
              onLog={handleLog}
            />
          ))}
        </div>
      )}

      {showBuilder && (
        <RecipeBuilder
          recipe={editingRecipe}
          onClose={() => { setShowBuilder(false); setEditingRecipe(null); }}
          onSaved={handleSaved}
        />
      )}

      {deletingRecipe && (
        <ConfirmDelete
          onConfirm={handleDelete}
          onCancel={() => setDeletingRecipe(null)}
        />
      )}
    </div>
  );
}