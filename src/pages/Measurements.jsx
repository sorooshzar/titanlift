import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Scale, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
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

  const { data: measurements = [] } = useQuery({
    queryKey: ["measurements"],
    queryFn: () => base44.entities.BodyWeight.list("-date", 200),
  });

  const { data: bodyMeasurements = [] } = useQuery({
    queryKey: ["bodyMeasurements"],
    queryFn: () => base44.entities.BodyMeasurement ? base44.entities.BodyMeasurement.list("-created_date", 500) : Promise.resolve([]),
  });

  const [mainStats, setMainStats] = useState({ weight: "", bodyFat: "", height: "" });
  const [saving, setSaving] = useState(false);
  const [measurementLog, setMeasurementLog] = useState({});

  // Group body measurements by part
  useEffect(() => {
    const grouped = {};
    bodyMeasurements.forEach((m) => {
      if (!grouped[m.body_part]) grouped[m.body_part] = [];
      grouped[m.body_part].push(m);
    });
    setMeasurementLog(grouped);
  }, [bodyMeasurements]);

  const saveMainStats = async () => {
    setSaving(true);
    if (mainStats.weight) {
      await base44.entities.BodyWeight.create({
        weight: parseFloat(mainStats.weight),
        unit,
        date: new Date().toISOString().split("T")[0],
      });
      queryClient.invalidateQueries({ queryKey: ["bodyWeights", "measurements"] });
    }
    setSaving(false);
    setMainStats({ weight: "", bodyFat: "", height: "" });
  };

  const logMeasurement = async (part) => {
    if (!newValue) return;
    await base44.entities.BodyWeight.create({
      weight: parseFloat(newValue),
      unit: unit,
      date: new Date().toISOString().split("T")[0],
      // We store a note to distinguish measurement type
    });
    setAddingPart(null);
    setNewValue("");
    queryClient.invalidateQueries({ queryKey: ["measurements"] });
  };

  const latestWeight = measurements[0];

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
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${unit === u ? "bg-primary text-white" : "text-muted-foreground"}`}
            >{u}</button>
          ))}
        </div>
      </div>

      {/* Section 1 - Main Stats */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Main Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Weight ({unit === "cm" ? "kg" : "lbs"})</label>
            <Input
              type="number"
              placeholder={latestWeight?.weight?.toString() || "--"}
              value={mainStats.weight}
              onChange={(e) => setMainStats({ ...mainStats, weight: e.target.value })}
              className="h-9 text-sm bg-secondary border-0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Body Fat %</label>
            <Input
              type="number"
              placeholder="--"
              value={mainStats.bodyFat}
              onChange={(e) => setMainStats({ ...mainStats, bodyFat: e.target.value })}
              className="h-9 text-sm bg-secondary border-0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Height ({unit})</label>
            <Input
              type="number"
              placeholder="--"
              value={mainStats.height}
              onChange={(e) => setMainStats({ ...mainStats, height: e.target.value })}
              className="h-9 text-sm bg-secondary border-0"
            />
          </div>
        </div>
        {(mainStats.weight || mainStats.bodyFat || mainStats.height) && (
          <Button size="sm" className="w-full mt-2 h-9" onClick={saveMainStats} disabled={saving}>
            {saving ? "Saving..." : "Save Stats"}
          </Button>
        )}
      </div>

      {/* Section 2 - Body Measurements */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Body Measurements</h2>
        <div className="space-y-1">
          {BODY_PARTS.map((part) => {
            const history = measurementLog[part] || [];
            const latest = history[0];
            const isAdding = addingPart === part;

            return (
              <div key={part}>
                <div className="flex items-center py-2.5 gap-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{part}</span>
                    {latest && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {latest.weight} {unit}
                      </span>
                    )}
                  </div>
                  {!latest && <span className="text-xs text-muted-foreground">--</span>}
                  <button
                    onClick={() => { setAddingPart(isAdding ? null : part); setNewValue(""); }}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isAdding && (
                  <div className="flex gap-2 pb-3 pl-1">
                    <Input
                      type="number"
                      placeholder={`Value (${unit})`}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="h-8 text-sm bg-secondary border-0 flex-1"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 px-3" onClick={() => logMeasurement(part)}>
                      Log
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setAddingPart(null)}>
                      ✕
                    </Button>
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