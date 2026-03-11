import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const MODES = ["Regular", "Plate", "1RM", "Unit"];
const BAR_TYPES = {
  standard: { name: "Standard (20kg/45lb)", weight: 20, plates: [20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25] },
  womens: { name: "Women's (15kg/35lb)", weight: 15, plates: [15, 10, 5, 2.5, 2, 1.25, 1, 0.5, 0.25] },
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
  const [barType, setBarType] = useState("standard");
  const [target, setTarget] = useState("");
  const bar = BAR_TYPES[barType];

  const calculatePlates = () => {
    if (!target) return null;
    const targetKg = parseFloat(target);
    const sideWeight = (targetKg - bar.weight) / 2;
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
          <label className="text-sm font-semibold mb-2 block">Target Total (kg)</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)}
            placeholder="e.g. 100" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      {plates && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <h3 className="font-semibold text-sm">Per Side:</h3>
          <div className="space-y-2">
            {Object.entries(plates).map(([plate, count]) => (
              <div key={plate} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{plate}kg</span>
                <span className="font-bold">{count}x</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">× 2 sides</p>
            <p className="text-lg font-bold">{(parseFloat(target) - bar.weight).toFixed(1)}kg total load</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OneRMMode() {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("0");

  const calculate1RM = () => {
    if (!weight || !reps) return null;
    const w = parseFloat(weight);
    const r = parseInt(reps) + parseInt(rir);

    // Brzycki: 1RM = weight × (36 / (37 - reps))
    const brzycki = w * (36 / (37 - r));

    // Epley: 1RM = weight × (1 + reps / 30)
    const epley = w * (1 + r / 30);

    // Lander: 1RM = (100 × weight) / (101.3 - 2.67123 × reps)
    const lander = (100 * w) / (101.3 - 2.67123 * r);

    const avg = (brzycki + epley + lander) / 3;
    return avg.toFixed(1);
  };

  const oneRM = calculate1RM();

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 80" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Reps Performed</label>
          <input type="number" value={reps} onChange={e => setReps(e.target.value)}
            placeholder="e.g. 5" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Reps In Reserve (RIR)</label>
          <input type="number" value={rir} onChange={e => setRir(e.target.value)}
            placeholder="e.g. 0" className="w-full bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      {oneRM && (
        <div className="bg-card rounded-2xl border border-border p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Estimated 1RM</p>
          <p className="text-5xl font-bold text-primary">{oneRM}</p>
          <p className="text-xs text-muted-foreground">kg (average of 3 formulas)</p>
        </div>
      )}
    </div>
  );
}

function UnitMode() {
  const [kgValue, setKgValue] = useState("");
  const [cmValue, setCmValue] = useState("");

  const lbs = kgValue ? (parseFloat(kgValue) * 2.20462).toFixed(1) : "";
  const inches = cmValue ? (parseFloat(cmValue) / 2.54).toFixed(1) : "";

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Kg ↔ Lbs</label>
          <div className="flex gap-2">
            <input type="number" value={kgValue} onChange={e => setKgValue(e.target.value)}
              placeholder="kg" className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
            <input type="text" value={lbs} readOnly placeholder="lbs"
              className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm opacity-50" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Cm ↔ Inches</label>
          <div className="flex gap-2">
            <input type="number" value={cmValue} onChange={e => setCmValue(e.target.value)}
              placeholder="cm" className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm" />
            <input type="text" value={inches} readOnly placeholder="in"
              className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2.5 text-sm opacity-50" />
          </div>
        </div>
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
      <div className="px-4 pt-6">
        {mode === "Regular" && <RegularMode />}
        {mode === "Plate" && <PlateMode />}
        {mode === "1RM" && <OneRMMode />}
        {mode === "Unit" && <UnitMode />}
      </div>
    </div>
  );
}