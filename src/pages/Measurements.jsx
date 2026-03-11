import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const BODY_PARTS = [
  "Neck", "Shoulders", "Chest", "Upper Arm", "Forearm",
  "Waist", "Hips", "Thigh", "Calf",
];

export default function Measurements() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addingPart, setAddingPart] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [unit, setUnit] = useState("cm");
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const { data: bodyWeights = [] } = useQuery({
    queryKey: ["bodyWeights"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 50),
  });

  const { data: bodyMeasurements = [] } = useQuery({
    queryKey: ["bodyMeasurements"],
    queryFn: () => base44.entities.BodyMeasurement.list("-date", 500),
  });

  // Get latest measurement per body part
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
      unit: unit === "cm" ? "kg" : "lbs",
      date: new Date().toISOString().split("T")[0],
    });
    queryClient.invalidateQueries({ queryKey: ["bodyWeights"] });
    setSavingWeight(false);
    setWeightInput("");
  };

  const logMeasurement = async (part) => {
    if (!newValue) return;
    await base44.entities.BodyMeasurement.create({
      body_part: part,
      value: parseFloat(newValue),
      unit,
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
          {["cm", "in"].map((u) => (
            <button key={u} onClick={() => setUnit(u)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${unit === u ? "bg-primary text-white" : "text-muted-foreground"}`}>
              {u}
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
            <Input type="number" step="0.1" placeholder="0.0" value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="w-24 h-9 text-sm bg-secondary border-0 text-center" />
            <Button size="sm" className="h-9 px-3" onClick={saveWeight} disabled={!weightInput || savingWeight}>
              {savingWeight ? "..." : "Log"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body Measurements */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Body Measurements</h2>
        <div className="space-y-1">
          {BODY_PARTS.map((part) => {
            const latest = latestByPart[part];
            const isAdding = addingPart === part;

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
                  </div>
                  {!latest && <span className="text-xs text-muted-foreground">--</span>}
                  <button
                    onClick={() => { setAddingPart(isAdding ? null : part); setNewValue(""); }}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isAdding && (
                  <div className="flex gap-2 pb-3 pl-1">
                    <Input type="number" placeholder={`Value (${unit})`} value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      className="h-8 text-sm bg-secondary border-0 flex-1" autoFocus />
                    <Button size="sm" className="h-8 px-3" onClick={() => logMeasurement(part)}>Log</Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setAddingPart(null)}>✕</Button>
                  </div>
                )}
                <div className="h-px bg-border" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}