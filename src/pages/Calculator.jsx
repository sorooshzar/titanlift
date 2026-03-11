import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useWeightUnit } from "@/components/utils/useWeightUnit";

const MODES = ["Regular", "Plate", "1RM", "Unit"];
const BAR_TYPES = {
  standard_kg: { name: "Standard (20kg)", weight: 20, plates: [20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25], unit: "kg" },
  standard_lbs: { name: "Standard (45lb)", weight: 20.41, plates: [20.41, 9.07, 4.54, 2.27, 1.59, 1.13], unit: "lbs" },
  womens_kg: { name: "Women's (15kg)", weight: 15, plates: [15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25], unit: "kg" },
  womens_lbs: { name: "Women's (35lb)", weight: 15.88, plates: [15.88, 4.54, 2.27, 1.59, 1.13], unit: "lbs" },
};

const REP_MAXES = { 100: 1, 95: 2, 90: "3-4", 85: 6, 80: 8, 75: 10 };

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

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-5xl font-bold text-primary break-words">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[7, 8, 9, "/"].map(v => (
          <button key={v} onClick={() => v === "/" ? handleOperation("÷") : handleNum(v)}
            className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v === "/" ? "÷" : v}
          </button>
        ))}
        {[4, 5, 6, "*"].map(v => (
          <button key={v} onClick={() => v === "*" ? handleOperation("×") : handleNum(v)}
            className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v === "*" ? "×" : v}
          </button>
        ))}
        {[1, 2, 3, "-"].map(v => (
          <button key={v} onClick={() => v === "-" ? handleOperation("-") : handleNum(v)}
            className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">
            {v}
          </button>
        ))}
        <button onClick={() => handleNum(0)} className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">0</button>
        <button onClick={handleDecimal} className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">.</button>
        <button onClick={() => handleOperation("+")} className="h-16 bg-secondary rounded-xl font-bold text-lg hover:bg-secondary/80 active:scale-95">+</button>
        <button onClick={handleEquals} className="col-span-2 h-16 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 active:scale-95">=</button>
        <button onClick={handleClear} className="col-span-2 h-16 bg-destructive/20 text-destructive rounded-xl font-bold text-lg hover:bg-destructive/30 active:scale-95">Clear</button>
      </div>
    </div>
  );
}

function PlateMode() {
  const { unit: weightUnit, toBase } = useWeightUnit();
  const [barType, setBarType] = useState(weightUnit === "lbs" ? "standard_lbs" : "standard_kg");
  const [target, setTarget] = useState("");

  const bar = BAR_TYPES[barType];

  const calculatePlates = () => {
    if (!target) return null;
    const targetVal = parseFloat(target);
    const sideWeight = (targetVal - bar.weight) / 2;
    const breakdown = {};
    let remaining = sideWeight;

    for (const plate of bar.plates) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        breakdown[plate] = count;
        remaining -= plate * count;
      }
    }
    return breakdown;
  };

  const plates = calculatePlates();

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Bar Type</label>
          <select value={barType} onChange={e => setBarType(e.target.value)}
            className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm">
            {Object.entries(BAR_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Target Total ({bar.unit})</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)}
            placeholder={`e.g. ${bar.unit === "kg" ? "100" : "220"}`} className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      {plates && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <h3 className="font-semibold text-sm">Per Side:</h3>
          <div className="space-y-2">
            {Object.entries(plates).map(([plate, count]) => {
              const plateLbs = (plate * 2.20462).toFixed(1);
              return (
                <div key={plate} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{plate}kg / {plateLbs}lbs</span>
                  <span className="font-bold">×{count}</span>
                </div>
              );
            })}
          </div>
          <div className="pt-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">× 2 sides</p>
            <p className="text-lg font-bold">{(parseFloat(target) - bar.weight).toFixed(1)} {bar.unit} total load</p>
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
                {Object.entries(REP_MAXES).map(([pct, reps]) => {
                  const weight = (oneRMVal * (pct / 100)).toFixed(1);
                  return (
                    <tr key={pct} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="py-2 font-semibold">{pct}%</td>
                      <td className="py-2">{weight} {weightUnit}</td>
                      <td className="py-2 text-muted-foreground">{reps}</td>
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

function AdvancedUnitConverter() {
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
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Category</label>
          <div className="flex gap-1.5">
            {["weight", "volume", "length"].map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setFromUnit(Object.keys(UNIT_CONVERSIONS[cat])[0]); setToUnit(Object.keys(UNIT_CONVERSIONS[cat])[1]); setValue(""); }}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold mb-2 block">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm">
              {unitKeys.map(u => (
                <option key={u} value={u}>{units[u].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)}
              className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm">
              {unitKeys.map(u => (
                <option key={u} value={u}>{units[u].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Enter Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            placeholder="0" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      {value && (
        <div className="bg-primary/10 rounded-2xl border border-primary/20 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">{value} {units[fromUnit].label}</p>
          <p className="text-4xl font-bold text-primary">{parseFloat(result).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">{units[toUnit].label}</p>
        </div>
      )}
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
        {mode === "Unit" && <AdvancedUnitConverter />}
      </div>
    </div>
  );
}