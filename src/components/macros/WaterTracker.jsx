import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplet, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

const DAILY_GOAL_ML = 2000;
const UNIT_OPTIONS = [
  { label: "ml", toMl: (v) => v, placeholder: "250", defaultVal: "250" },
  { label: "oz", toMl: (v) => v * 29.5735, placeholder: "8", defaultVal: "8" },
  { label: "cups", toMl: (v) => v * 236.588, placeholder: "1", defaultVal: "1" },
];

function AddWaterModal({ date, onClose, onAdd }) {
  const [unitIdx, setUnitIdx] = useState(0);
  const unit = UNIT_OPTIONS[unitIdx];
  const [amount, setAmount] = useState(unit.defaultVal);

  const switchUnit = (idx) => {
    setUnitIdx(idx);
    setAmount(UNIT_OPTIONS[idx].defaultVal);
  };

  const handleAdd = () => {
    if (!amount) return;
    const ml = unit.toMl(parseFloat(amount));
    onAdd({ date, amount_ml: Math.round(ml) });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-t-3xl border-t border-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Add Water</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unit toggle */}
        <div className="flex bg-secondary rounded-xl p-1 gap-1">
          {UNIT_OPTIONS.map((u, i) => (
            <button key={u.label} onClick={() => switchUnit(i)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${unitIdx === i ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {u.label}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={unit.placeholder}
            className="w-full text-center text-4xl font-bold bg-secondary border-0 rounded-xl py-4"
            autoFocus
          />
          <p className="text-center text-xs text-muted-foreground mt-1.5">
            ≈ {Math.round(unit.toMl(parseFloat(amount) || 0))} ml
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2">
          {unitIdx === 0 && [150, 250, 350, 500].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-border transition-colors">
              {v}
            </button>
          ))}
          {unitIdx === 1 && [4, 8, 12, 16].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-border transition-colors">
              {v}
            </button>
          ))}
          {unitIdx === 2 && [0.5, 1, 1.5, 2].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="flex-1 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-border transition-colors">
              {v}
            </button>
          ))}
        </div>

        <Button onClick={handleAdd} disabled={!amount || parseFloat(amount) <= 0} className="w-full h-11 rounded-xl font-semibold">
          Add Water
        </Button>
      </div>
    </div>
  );
}

export default function WaterTracker({ date }) {
  const [showAddWater, setShowAddWater] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ["waterLogs", date],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.WaterLog.filter({ date, created_by: user.email }, "-created_date", 50);
    },
  });

  const totalMl = logs.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
  const percentage = Math.min((totalMl / DAILY_GOAL_ML) * 100, 100);

  const handleAddWater = async (data) => {
    await base44.entities.WaterLog.create(data);
    queryClient.invalidateQueries({ queryKey: ["waterLogs", date] });
    setShowAddWater(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 py-2 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Droplet className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium">Water</span>
          <span className="text-xs text-muted-foreground">{Math.round(totalMl)}/{DAILY_GOAL_ML}ml</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowAddWater(true)}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {showAddWater && <AddWaterModal date={date} onClose={() => setShowAddWater(false)} onAdd={handleAddWater} />}
      </AnimatePresence>
    </>
  );
}