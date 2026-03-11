import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplet, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const DAILY_GOAL_ML = 2000;
const UNIT_OPTIONS = [
  { label: "ml", toMl: (v) => v },
  { label: "oz", toMl: (v) => v * 29.5735 },
  { label: "L", toMl: (v) => v * 1000 },
];

function WheelPicker({ value, onChange, options }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offset, setOffset] = useState(0);

  const handleStart = (e) => {
    setIsDragging(true);
    setStartY(e.type.includes("touch") ? e.touches[0].clientY : e.clientY);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const y = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    const delta = y - startY;
    const idx = Math.max(0, Math.min(options.length - 1, Math.round(-delta / 40)));
    setOffset(-delta);
    onChange(options[idx]);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setOffset(0);
  };

  const currentIdx = options.indexOf(value);

  return (
    <div
      className="flex justify-center items-center h-48 bg-secondary/30 rounded-xl overflow-hidden select-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Center highlight */}
        <div className="absolute inset-x-4 h-12 bg-primary/5 border border-primary/20 rounded-lg pointer-events-none" />

        {/* Wheel items */}
        <div className="flex flex-col items-center justify-center gap-10 py-12">
          {options.map((opt, idx) => (
            <div
              key={opt.label}
              className={`text-center transition-all duration-150 ${
                idx === currentIdx ? "text-2xl font-bold text-primary" : "text-lg text-muted-foreground opacity-40"
              }`}
              style={{
                transform: `translateY(${(idx - currentIdx) * 40 + offset}px)`,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddWaterModal({ date, onClose, onAdd }) {
  const [amount, setAmount] = useState("250");
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);

  const handleAdd = () => {
    if (!amount) return;
    const ml = unit.toMl(parseFloat(amount));
    onAdd({ date, amount_ml: ml });
    setAmount("250");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-card w-full max-w-sm rounded-t-3xl border-t border-border p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Add Water</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-semibold mb-2 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-center text-3xl font-bold bg-secondary border-0 rounded-xl py-3"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold mb-2 block">Unit</label>
            <WheelPicker value={unit} onChange={setUnit} options={UNIT_OPTIONS} />
          </div>
        </div>

        <Button onClick={handleAdd} disabled={!amount} className="w-full h-11 rounded-xl font-semibold">
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
    queryFn: () => base44.entities.WaterLog.filter({ date }, "-created_date", 50),
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