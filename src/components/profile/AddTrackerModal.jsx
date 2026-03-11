import React, { useState } from "react";
import { X, Ruler, Dumbbell, Star, BarChart2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const BODY_PARTS = [
  "Height", "Neck", "Shoulders", "Chest", "Upper Arm", "Forearm",
  "Waist", "Hips", "Thigh", "Calf",
];

const TRACKER_TYPES = [
  {
    id: "measurement",
    icon: Ruler,
    label: "Measurement",
    desc: "Track a body measurement over time",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "exercise",
    icon: Dumbbell,
    label: "Exercise",
    desc: "Track progressive overload via estimated 1RM",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    id: "habits",
    icon: Star,
    label: "Habits",
    desc: "Track weekly habits like workouts & weight logs",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    id: "macros",
    icon: BarChart2,
    label: "Macros",
    desc: "Daily calorie & macro bar chart for the past week",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function AddTrackerModal({ onClose, onAdded }) {
  const [step, setStep] = useState("pick"); // pick | config
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.list("name", 200),
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === "habits" || type === "macros") {
      // No extra config needed
      setStep("confirm");
    } else {
      setStep("config");
    }
  };

  const canConfirm = () => {
    if (selectedType === "measurement") return !!selectedPart;
    if (selectedType === "exercise") return !!selectedExercise;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    let config = {};
    let label = selectedType;
    if (selectedType === "measurement") {
      config = { body_part: selectedPart };
      label = selectedPart;
    } else if (selectedType === "exercise") {
      config = { exercise_id: selectedExercise.id, exercise_name: selectedExercise.name };
      label = selectedExercise.name;
    } else if (selectedType === "habits") {
      label = "Habits";
    } else if (selectedType === "macros") {
      label = "Macros";
    }
    await base44.entities.UserTracker.create({ type: selectedType, label, config });
    queryClient.invalidateQueries({ queryKey: ["userTrackers"] });
    setSaving(false);
    onAdded?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base">Add Tracker</h2>
            {step === "pick" && <p className="text-xs text-muted-foreground mt-0.5">Choose what to track</p>}
            {step !== "pick" && (
              <button onClick={() => setStep("pick")} className="text-xs text-primary mt-0.5">← Back</button>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-3">
                {TRACKER_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => handleTypeSelect(t.id)}
                      className={`flex flex-col gap-2 p-4 rounded-2xl border border-border ${t.bg} text-left active:scale-95 transition-transform`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-background/40`}>
                        <Icon className={`w-4 h-4 ${t.color}`} />
                      </div>
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === "config" && selectedType === "measurement" && (
            <motion.div key="config-meas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-semibold mb-3">Choose a body part</p>
              <div className="grid grid-cols-2 gap-2">
                {BODY_PARTS.map(part => (
                  <button key={part} onClick={() => setSelectedPart(part)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${selectedPart === part ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"}`}>
                    {part}
                  </button>
                ))}
              </div>
              <Button className="w-full mt-4 h-11 rounded-xl" disabled={!canConfirm() || saving} onClick={handleSave}>
                {saving ? "Adding..." : "Add Tracker"}
              </Button>
            </motion.div>
          )}

          {step === "config" && selectedType === "exercise" && (
            <motion.div key="config-ex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-semibold mb-3">Choose an exercise</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {exercises.map(ex => (
                  <button key={ex.id} onClick={() => setSelectedExercise(ex)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${selectedExercise?.id === ex.id ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-secondary hover:bg-muted"}`}>
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{ex.muscle_group}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full mt-4 h-11 rounded-xl" disabled={!canConfirm() || saving} onClick={handleSave}>
                {saving ? "Adding..." : "Add Tracker"}
              </Button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedType === "habits" && "This will add a weekly habits overview to your profile."}
                {selectedType === "macros" && "This will add a daily macro bar chart (last 7 days) to your profile."}
              </p>
              <Button className="w-full h-11 rounded-xl" disabled={saving} onClick={handleSave}>
                {saving ? "Adding..." : "Add Tracker"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}