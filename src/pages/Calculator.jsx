import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

const MODES = ["Regular", "Plate", "1RM", "Unit"];
const BAR_TYPES = {
  standard: { name: "Standard Barbell", weight_kg: 20, weight_lbs: 45, plates: [45, 35, 25, 10, 5, 2.5], plate_colors: { 45: "bg-red-500", 35: "bg-blue-500", 25: "bg-yellow-500", 10: "bg-green-500", 5: "bg-white border border-foreground", 2.5: "bg-red-200" } },
  womens: { name: "Women's Barbell", weight_kg: 15, weight_lbs: 35, plates: [35, 25, 10, 5, 2.5], plate_colors: { 35: "bg-blue-500", 25: "bg-yellow-500", 10: "bg-green-500", 5: "bg-white border border-foreground", 2.5: "bg-red-200" } },
  ezbar: { name: "EZ Bar", weight_kg: 10, weight_lbs: 25, plates: [25, 10, 5, 2.5], plate_colors: { 25: "bg-yellow-500", 10: "bg-green-500", 5: "bg-white border border-foreground", 2.5: "bg-red-200" } },
};

const REP_MAXES = [
  { pct: 115, reps: "0 Reps (Static Hold)" },
  { pct: 100, reps: 1 },
  { pct: 95, reps: 2 },
  { pct: 90, reps: "3-4" },
  { pct: 85, reps: 6 },
  { pct: 80, reps: 8 },
  { pct: 75, reps: 10 },
];

const UNIT_CONVERSIONS = {
  weight: {
    kg: { label: "kg", factor: 1 },
    lbs: { label: "lbs", factor: 2.20462 },
    g: { label: "g", factor: 1000 },
    oz: { label: "oz", factor: 35.274 },
  },
  volume: {
    ml: { label: "ml", factor: 1 },
    l: { label: "L", factor: 0.001 },
    oz: { label: "fl oz", factor: 0.033814 },
    cup: { label: "cup", factor: 0.004167 },
  },
  length: {
    cm: { label: "cm", factor: 1 },
    m: { label: "m", factor: 0.01 },
    in: { label: "in", factor: 0.393701 },
    ft: { label: "ft", factor: 0.0328084 },
  },
};

function RegularMode() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);

  const handleNum = (num) => {
    setDisplay(display === "0" ? String(num) : display + num);
  };

  const handleDecimal = () => {
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const handleOperation = (op) => {
    setPrevValue(parseFloat(display));
    setOperation(op);
    setDisplay("0");
  };

  const handleEquals = () => {
    if (prevValue === null || operation === null) return;
    const curr = parseFloat(display);
    let result = 0;
    switch (operation) {
      case "+": result = prevValue + curr; break;
      case "-": result = prevValue - curr; break;
      case "×": result = prevValue * curr; break;
      case "÷": result = prevValue / curr; break;
      default: result = curr;
    }
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperation(null);
  };

  const handlePercent = () => {
    if (prevValue === null) return;
    const curr = parseFloat(display);
    const result = prevValue * (curr / 100);
    setDisplay(String(result));
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-5xl font-bold text-primary break-words">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        {[7, 8, 9, "/"].map(v => (
          <button key={v} onClick={() => v === "/" ? handleOperation("÷") : handleNum(v)}
            className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v === "/" ? "÷" : v}
          </button>
        ))}
        {/* Row 2 */}
        {[4, 5, 6, "*"].map(v => (
          <button key={v} onClick={() => v === "*" ? handleOperation("×") : handleNum(v)}
            className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v === "*" ? "×" : v}
          </button>
        ))}
        {/* Row 3 */}
        {[1, 2, 3, "-"].map(v => (
          <button key={v} onClick={() => v === "-" ? handleOperation("-") : handleNum(v)}
            className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v}
          </button>
        ))}
        {/* Row 4 */}
        <button onClick={() => handleNum(0)} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">0</button>
        <button onClick={handleDecimal} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">.</button>
        <button onClick={handlePercent} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">%</button>
        <button onClick={() => handleOperation("+")} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">+</button>
        {/* Row 5 */}
        <button onClick={handleClear} className="h-14 bg-destructive/20 text-destructive rounded-xl font-bold text-lg hover:bg-destructive/30 active:scale-95">C</button>
        <button onClick={() => {}} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95 opacity-0 pointer-events-none"></button>
        <button onClick={() => {}} className="h-14 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95 opacity-0 pointer-events-none"></button>
        <button onClick={handleEquals} className="h-14 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 active:scale-95">=</button>
      </div>
    </div>
  );
}

function PlateMode() {
  const { unit: weightUnit } = useWeightUnit();
  const [barType, setBarType] = useState("standard");
  const [target, setTarget] = useState("");

  const bar = BAR_TYPES[barType];
  const barWeight = weightUnit === "lbs" ? bar.weight_lbs : bar.weight_kg;

  const calculatePlates = () => {
    if (!target) return null;
    const targetVal = parseFloat(target);
    const sideWeight = (targetVal - barWeight) / 2;
    const breakdown = [];
    let remaining = sideWeight;

    // Greedy algorithm - use largest plates first
    for (const plate of bar.plates) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        breakdown.push({ plate, count });
        remaining -= plate * count;
      }
    }
    return breakdown;
  };

  const plates = calculatePlates();
  const plateList = plates ? plates.map(p => `${p.count}×${p.plate}`).join(", ") : "";

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Bar Type</label>
          <div className="flex gap-2">
            {Object.entries(BAR_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setBarType(k)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${barType === k ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Target Total ({weightUnit})</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)}
            placeholder={`e.g. ${weightUnit === "kg" ? "100" : "220"}`} className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      {plates && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="grid grid-cols-5 gap-4 items-center">
            {/* Birds-Eye View */}
            <div className="col-span-2 flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Side View</p>
              <div className="w-full flex justify-center">
                <div className="h-32 flex flex-col items-center justify-center gap-1">
                  {/* Bar sleeve */}
                  <div className="w-12 h-3 bg-gradient-to-b from-foreground/30 to-foreground/10 rounded"></div>
                  {/* Plates stacked */}
                  {plates.map((p, idx) => {
                    const widths = { 45: "w-10", 35: "w-9", 25: "w-8", 10: "w-6", 5: "w-5", 2.5: "w-4" };
                    const color = bar.plate_colors[p.plate];
                    return (
                      <div key={idx} className="flex flex-col gap-0.5">
                        {[...Array(p.count)].map((_, i) => (
                          <div key={i} className={`h-2 ${widths[p.plate]} ${color} rounded-sm`}></div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Plate List */}
            <div className="col-span-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Per Side</p>
              <div className="space-y-1">
                {plates.map(p => (
                  <div key={p.plate} className="flex items-center gap-2">
                    <span className="font-bold text-sm">{p.count}×</span>
                    <span className="text-sm text-muted-foreground">{p.plate} lbs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OneRMMode() {
  const { unit: weightUnit } = useWeightUnit();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("0");

  const calculate1RM = () => {
    if (!weight || !reps) return null;
    const w = parseFloat(weight);
    const r = parseInt(reps) + parseInt(rir);

    const brzycki = w * (36 / (37 - r));
    const epley = w * (1 + r / 30);
    const lander = (100 * w) / (101.3 - 2.67123 * r);

    return (brzycki + epley + lander) / 3;
  };

  const oneRMVal = calculate1RM();
  const oneRM = oneRMVal ? oneRMVal.toFixed(1) : null;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <div>
          <label className="text-sm font-semibold mb-2 block">Weight ({weightUnit})</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder={weightUnit === "lbs" ? "e.g. 175" : "e.g. 80"} className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold mb-2 block">Reps</label>
            <input type="number" value={reps} onChange={e => setReps(e.target.value)}
              placeholder="e.g. 5" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">RIR</label>
            <input type="number" value={rir} onChange={e => setRir(e.target.value)}
              placeholder="e.g. 0" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>
      </div>

      {oneRM && (
        <>
          <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Estimated 1RM</p>
            <p className="text-5xl font-bold text-primary">{oneRM}</p>
            <p className="text-xs text-muted-foreground">{weightUnit} (avg of 3 formulas)</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 text-muted-foreground font-semibold">%</th>
                  <th className="text-left py-2 text-muted-foreground font-semibold">Weight</th>
                  <th className="text-left py-2 text-muted-foreground font-semibold">Reps</th>
                </tr>
              </thead>
              <tbody>
                {REP_MAXES.map(({ pct, reps }) => {
                  const weight = (oneRMVal * (pct / 100)).toFixed(1);
                  const displayReps = pct === 115 ? "--" : reps;
                  return (
                    <tr key={pct} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="py-2 font-semibold">{pct}%</td>
                      <td className="py-2">{weight} {weightUnit}</td>
                      <td className="py-2 text-muted-foreground">{displayReps}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function UnitConverter() {
  const [category, setCategory] = useState("weight");
  const [fromUnit, setFromUnit] = useState("kg");
  const [toUnit, setToUnit] = useState("lbs");
  const [value, setValue] = useState("");

  const units = UNIT_CONVERSIONS[category];
  const unitKeys = Object.keys(units);
  const result = value
    ? ((parseFloat(value) / units[fromUnit].factor) * units[toUnit].factor).toFixed(4)
    : "";

  return (
    <div className="space-y-4">
      {/* Category toggle */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex gap-2">
          {["weight", "volume", "length"].map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setValue(""); }}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion block */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              className="w-full bg-secondary border-0 rounded-lg px-2 py-2 text-xs text-center">
              {unitKeys.map(u => (
                <option key={u} value={u}>{units[u].label}</option>
              ))}
            </select>
          </div>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            placeholder="0" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm text-center font-semibold" />
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)}
              className="w-full bg-secondary border-0 rounded-lg px-2 py-2 text-xs text-center">
              {unitKeys.map(u => (
                <option key={u} value={u}>{units[u].label}</option>
              ))}
            </select>
          </div>
        </div>

        {value && (
          <div className="bg-primary/10 rounded-xl border border-primary/20 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">{value} {units[fromUnit].label}</p>
            <p className="text-3xl font-bold text-primary">{parseFloat(result).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">{units[toUnit].label}</p>
          </div>
        )}
      </div>
    </div>
  );
}



export default function Calculator() {
  const [mode, setMode] = useState("Regular");

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-4 border-b border-border/30">
        <div className="flex items-center gap-3 mb-4">
          <Link to={createPageUrl("Lifts")}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Calculator</h1>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1.5 flex-wrap">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-6">
        {mode === "Regular" && <RegularMode />}
        {mode === "Plate" && <PlateMode />}
        {mode === "1RM" && <OneRMMode />}
        {mode === "Unit" && <UnitConverter />}
      </div>
    </div>
  );
}