import React, { useState, useMemo } from "react";
import { X, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { RANKS, BASE_THRESHOLDS, MUSCLE_SCALE } from "@/components/utils/rankEngine";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

function epley(weight, reps, rir = 0) {
  const effectiveReps = reps + rir;
  if (effectiveReps < 1) return weight;
  return weight * (1 + effectiveReps / 30);
}

function getRankForE1RM(e1rm, bodyWeightKg, muscleName) {
  if (!bodyWeightKg || bodyWeightKg <= 0 || !muscleName) return null;
  const ratio = e1rm / bodyWeightKg;
  const scale = MUSCLE_SCALE[muscleName] || 0.7;
  const thresholds = BASE_THRESHOLDS.map(t => t * scale);

  let rankIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (ratio >= thresholds[i]) rankIndex = i;
    else break;
  }
  return RANKS[rankIndex];
}

export default function RankTester({ onClose, bodyWeightKg }) {
  const [search, setSearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("0");
  const { unit, toKg } = useWeightUnit();

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises-rank-tester"],
    queryFn: () => base44.entities.Exercise.list(),
  });

  // Only show exercises that have a muscle in MUSCLE_SCALE
  const rankableExercises = useMemo(() =>
    exercises.filter(ex => ex.primary_muscle && MUSCLE_SCALE[ex.primary_muscle]),
    [exercises]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return rankableExercises.slice(0, 20);
    return rankableExercises
      .filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 20);
  }, [rankableExercises, search]);

  const rank = useMemo(() => {
    if (!selectedExercise || !weight || !reps) return null;
    const weightKg = toKg(parseFloat(weight));
    const repsNum = parseInt(reps);
    const rirNum = parseInt(rir) || 0;
    if (!weightKg || !repsNum || repsNum < 1) return null;
    const e1rm = epley(weightKg, repsNum, rirNum);
    return getRankForE1RM(e1rm, bodyWeightKg || 80, selectedExercise.primary_muscle);
  }, [selectedExercise, weight, reps, rir, bodyWeightKg, toKg]);

  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex);
    setSearch(ex.name);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold">Rank Tester</h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Exercise Selector */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Exercise</label>
          <div className="relative">
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelectedExercise(null); }}
              onFocus={() => setShowDropdown(true)}
              className="bg-secondary border-0 h-11"
            />
            {showDropdown && search.length > 0 && filtered.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-xl max-h-52 overflow-y-auto">
                {filtered.map(ex => (
                  <button
                    key={ex.id}
                    onMouseDown={() => handleSelectExercise(ex)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors border-b border-border/30 last:border-0"
                  >
                    <span className="font-medium">{ex.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{ex.primary_muscle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedExercise && (
            <p className="text-xs text-muted-foreground mt-1 ml-1">
              Muscle: <span className="text-foreground font-semibold">{selectedExercise.primary_muscle}</span>
            </p>
          )}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Weight ({unit})</label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="bg-secondary border-0 h-11 text-center font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Reps</label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="bg-secondary border-0 h-11 text-center font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">RIR</label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={rir}
              onChange={e => setRir(e.target.value)}
              className="bg-secondary border-0 h-11 text-center font-semibold"
            />
          </div>
        </div>

        {/* Result */}
        {rank ? (
          <div
            className="mt-2 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all duration-300"
            style={{ backgroundColor: rank.color + "22", border: `2px solid ${rank.color}` }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-lg"
              style={{ backgroundColor: rank.color, color: rank.textColor }}
            >
              {rank.label[0]}
            </div>
            <p className="text-xl font-black tracking-wide" style={{ color: rank.color }}>{rank.label}</p>
            <p className="text-xs text-muted-foreground text-center">{rank.description}</p>
          </div>
        ) : (
          <div className="mt-2 rounded-2xl p-5 flex flex-col items-center gap-2 bg-secondary/50 border border-border/40">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {!selectedExercise ? "Select an exercise to get started" : "Enter weight and reps to see your rank"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}