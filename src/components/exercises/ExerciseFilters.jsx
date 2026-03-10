import React, { useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BODY_PARTS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Hamstrings", "Glutes", "Calves", "Abs", "Forearms", "Traps"];
const EQUIPMENT = ["Barbell", "Dumbbell", "Machine", "Smith Machine", "Bodyweight", "Cable", "Band", "Other"];
const SORT_OPTIONS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "frequency", label: "Most Performed" },
  { id: "recency", label: "Most Recent" },
];

export default function ExerciseFilters({ filters, onFiltersChange }) {
  const [showBodyParts, setShowBodyParts] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

  const toggleBodyPart = (bp) => {
    const key = bp.toLowerCase();
    const current = filters.bodyParts || [];
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    onFiltersChange({ ...filters, bodyParts: next });
  };

  const toggleEquipment = (eq) => {
    const key = eq.toLowerCase().replace(" ", "_");
    const current = filters.equipment || [];
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    onFiltersChange({ ...filters, equipment: next });
  };

  const setSort = (id) => onFiltersChange({ ...filters, sort: id });

  const bpCount = (filters.bodyParts || []).length;
  const eqCount = (filters.equipment || []).length;

  return (
    <div className="flex gap-2 items-center">
      {/* Body Part Filter */}
      <div className="relative flex-1">
        <button
          onClick={() => { setShowBodyParts(!showBodyParts); setShowEquipment(false); }}
          className={`flex items-center gap-1 w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            bpCount > 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
          }`}
        >
          <span className="flex-1 text-left truncate">
            {bpCount > 0 ? `Body Part (${bpCount})` : "Body Part"}
          </span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </button>
        {showBodyParts && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-xl z-20 p-2 max-h-56 overflow-y-auto">
            {BODY_PARTS.map((bp) => {
              const key = bp.toLowerCase();
              const active = (filters.bodyParts || []).includes(key);
              return (
                <button key={bp} onClick={() => toggleBodyPart(bp)}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs hover:bg-secondary transition-colors">
                  <span className={active ? "text-primary font-semibold" : "text-foreground"}>{bp}</span>
                  {active && <Check className="w-3 h-3 text-primary" />}
                </button>
              );
            })}
            {bpCount > 0 && (
              <button onClick={() => onFiltersChange({ ...filters, bodyParts: [] })}
                className="w-full mt-1 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Equipment Filter */}
      <div className="relative flex-1">
        <button
          onClick={() => { setShowEquipment(!showEquipment); setShowBodyParts(false); }}
          className={`flex items-center gap-1 w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            eqCount > 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
          }`}
        >
          <span className="flex-1 text-left truncate">
            {eqCount > 0 ? `Equipment (${eqCount})` : "Equipment"}
          </span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </button>
        {showEquipment && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-xl z-20 p-2 max-h-56 overflow-y-auto">
            {EQUIPMENT.map((eq) => {
              const key = eq.toLowerCase().replace(" ", "_");
              const active = (filters.equipment || []).includes(key);
              return (
                <button key={eq} onClick={() => toggleEquipment(eq)}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs hover:bg-secondary transition-colors">
                  <span className={active ? "text-primary font-semibold" : "text-foreground"}>{eq}</span>
                  {active && <Check className="w-3 h-3 text-primary" />}
                </button>
              );
            })}
            {eqCount > 0 && (
              <button onClick={() => onFiltersChange({ ...filters, equipment: [] })}
                className="w-full mt-1 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
            filters.sort && filters.sort !== "name" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
          }`}>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SORT_OPTIONS.map((o) => (
            <DropdownMenuItem key={o.id} onClick={() => setSort(o.id)}
              className={`text-xs ${filters.sort === o.id ? "text-primary font-semibold" : ""}`}>
              {o.label}
              {filters.sort === o.id && <Check className="w-3 h-3 ml-auto text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}