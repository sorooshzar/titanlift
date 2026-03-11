import React, { useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MUSCLE_HIERARCHY, getSubsectionsForMain, normalizeSubsection } from "@/components/utils/muscleHierarchy";

const EQUIPMENT = ["Barbell", "Dumbbell", "Machine", "Smith Machine", "Bodyweight", "Cable", "Band", "Other"];
const SORT_OPTIONS = [
  { id: "name", label: "Name (A–Z)" },
  { id: "frequency", label: "Most Performed" },
  { id: "recency", label: "Most Recent" },
];

export default function ExerciseFilters({ filters, onFiltersChange }) {
  const [showBodyParts, setShowBodyParts] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

  const toggleMainGroup = (mainGroup) => {
    const current = filters.mainGroups || [];
    const next = current.includes(mainGroup) ? current.filter((x) => x !== mainGroup) : [...current, mainGroup];
    onFiltersChange({ ...filters, mainGroups: next });
  };

  const toggleEquipment = (eq) => {
    const key = eq.toLowerCase().replace(" ", "_");
    const current = filters.equipment || [];
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    onFiltersChange({ ...filters, equipment: next });
  };

  const setSort = (id) => onFiltersChange({ ...filters, sort: id });

  const bpCount = (filters.mainGroups || []).length;
  const eqCount = (filters.equipment || []).length;

  return (
    <div className="space-y-2">
      {/* Main Group Chips */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(MUSCLE_HIERARCHY).map((mainGroup) => {
          const active = (filters.mainGroups || []).includes(mainGroup);
          return (
            <button
              key={mainGroup}
              onClick={() => toggleMainGroup(mainGroup)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              }`}
            >
              {mainGroup}
            </button>
          );
        })}
      </div>

      {/* Equipment Filter */}
      <div className="relative">
        <button
          onClick={() => { setShowEquipment(!showEquipment); }}
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
          <button className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            filters.sort && filters.sort !== "name" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
          }`}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-xs">Sort</span>
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