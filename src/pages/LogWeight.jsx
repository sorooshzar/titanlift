import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Scale } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LogWeight() {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const todayLocal = new Date();
  const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
  const [date, setDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!weight) return;
    setSaving(true);
    await base44.entities.BodyWeight.create({
      weight: parseFloat(weight),
      unit: unit,
      date: date,
    });
    queryClient.invalidateQueries({ queryKey: ["bodyWeights"] });
    queryClient.invalidateQueries({ queryKey: ["profileAllMacroEntries"] });
    setSaving(false);
    navigate(createPageUrl("Profile"));
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Profile")}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Log Weight</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-5">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Unit</label>
              <div className="flex gap-2">
                {["kg", "lbs"].map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      unit === u
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Enter Weight in {unit}</label>
              <Input
                type="number"
                step="0.1"
                placeholder={unit === "kg" ? "80.0" : "175"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-center text-2xl font-bold h-14 bg-secondary border-0 mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary border-0 mt-2"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!weight || saving}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {saving ? "Saving..." : "Save Weight"}
        </Button>
      </div>
    </div>
  );
}