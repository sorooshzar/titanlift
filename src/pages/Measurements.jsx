import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, History, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

const BODY_PARTS = [
  "Height", "Neck", "Shoulders", "Chest", "Upper Arm", "Forearm",
  "Waist", "Hips", "Thigh", "Calf",
];

function HistoryPanel({ part, measurements, unit, onClose }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const entries = measurements
    .filter(m => m.body_part === part)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const saveEdit = async (m) => {
    await base44.entities.BodyMeasurement.update(m.id, { value: parseFloat(editValue) });
    queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
    setEditingId(null);
  };

  const deleteEntry = async (m) => {
    await base44.entities.BodyMeasurement.delete(m.id);
    queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="mt-2 mb-3 bg-secondary/60 rounded-xl p-3 border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">History — {part}</p>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {entries.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No history yet</p>}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {entries.map(m => (
          <div key={m.id} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">{format(new Date(m.date), "MMM d, yyyy")}</span>
            {editingId === m.id ? (
              <>
                <div className="flex items-center gap-1 flex-1">
                  <Input type="number" step="0.1" value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="h-6 text-xs bg-card border-border px-2 flex-1" autoFocus />
                  <span className="text-xs text-muted-foreground shrink-0">{m.unit}</span>
                </div>
                <button onClick={() => saveEdit(m)} className="text-xs text-primary font-semibold px-1">Save</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-muted-foreground px-1">✕</button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium flex-1">{m.value} {m.unit}</span>
                <button onClick={() => { setEditingId(m.id); setEditValue(String(m.value)); }}
                  className="text-[10px] text-primary px-1">Edit</button>
                <button onClick={() => deleteEntry(m)} className="text-[10px] text-destructive px-1">Del</button>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Measurements() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addingPart, setAddingPart] = useState(null);
  const [historyPart, setHistoryPart] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [unit, setUnit] = useState("cm");
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const weightUnit = unit === "cm" ? "kg" : "lbs";
  const lengthUnit = unit === "cm" ? "cm" : "in";

  const { data: bodyWeights = [] } = useQuery({
    queryKey: ["bodyWeights"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 50),
  });

  const { data: bodyMeasurements = [] } = useQuery({
    queryKey: ["bodyMeasurements"],
    queryFn: () => base44.entities.BodyMeasurement.list("-date", 500),
  });

  const latestByPart = {};
  bodyMeasurements.forEach(m => {
    if (!latestByPart[m.body_part]) latestByPart[m.body_part] = m;
  });

  const latestWeight = bodyWeights[0];

  const saveWeight = async () => {
    if (!weightInput) return;
    setSavingWeight(true);
    await base44.entities.BodyWeight.create({
      weight: parseFloat(weightInput),
      unit: weightUnit,
      date: new Date().toISOString().split("T")[0],
    });
    queryClient.invalidateQueries({ queryKey: ["bodyWeights"] });
    setSavingWeight(false);
    setWeightInput("");
  };

  const logMeasurement = async (part) => {
    if (!newValue) return;
    const unitForPart = part === "Height" ? lengthUnit : lengthUnit;
    await base44.entities.BodyMeasurement.create({
      body_part: part,
      value: parseFloat(newValue),
      unit: unitForPart,
      date: new Date().toISOString().split("T")[0],
    });
    setAddingPart(null);
    setNewValue("");
    queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">Measurements</h1>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {[{ id: "cm", label: "Metric" }, { id: "in", label: "Imperial" }].map((u) => (
            <button key={u.id} onClick={() => setUnit(u.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${unit === u.id ? "bg-primary text-white" : "text-muted-foreground"}`}>
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Weight</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-2xl font-bold">{latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : "--"}</p>
            {latestWeight && <p className="text-xs text-muted-foreground">{format(new Date(latestWeight.date), "MMM d, yyyy")}</p>}
          </div>
          <div className="flex gap-2 items-center">
            {/* Input with unit label */}
            <div className="relative">
              <Input type="number" step="0.1" placeholder="0.0" value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                className="w-24 h-9 text-sm bg-secondary border-0 text-center pr-7" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{weightUnit}</span>
            </div>
            <Button size="sm" className="h-9 px-3" onClick={saveWeight} disabled={!weightInput || savingWeight}>
              {savingWeight ? "..." : "Log"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Body Measurements</h2>
        <div className="space-y-0">
          {BODY_PARTS.map((part) => {
            const latest = latestByPart[part];
            const isAdding = addingPart === part;
            const isHistory = historyPart === part;

            return (
              <div key={part}>
                <div className="flex items-center py-2.5 gap-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{part}</span>
                    {latest && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {latest.value} {latest.unit}
                      </span>
                    )}
                    {!latest && <span className="text-xs text-muted-foreground ml-2">--</span>}
                  </div>
                  {/* History button */}
                  <button
                    onClick={() => setHistoryPart(isHistory ? null : part)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isHistory ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    <History className="w-3.5 h-3.5" />
                  </button>
                  {/* Add button */}
                  <button
                    onClick={() => { setAddingPart(isAdding ? null : part); setHistoryPart(null); setNewValue(""); }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isAdding ? "bg-primary text-white" : "bg-secondary text-primary"}`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AnimatePresence>
                  {isHistory && (
                    <HistoryPanel
                      part={part}
                      measurements={bodyMeasurements}
                      unit={unit}
                      onClose={() => setHistoryPart(null)}
                    />
                  )}
                  {isAdding && (
                    <motion.div key="addinput" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="flex gap-2 pb-3 pl-1">
                        <div className="relative flex-1">
                          <Input type="number" placeholder="0.0" value={newValue}
                            onChange={e => setNewValue(e.target.value)}
                            className="h-8 text-sm bg-secondary border-0 pr-10" autoFocus />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{lengthUnit}</span>
                        </div>
                        <Button size="sm" className="h-8 px-3" onClick={() => logMeasurement(part)}>Log</Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setAddingPart(null)}>✕</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-px bg-border" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}