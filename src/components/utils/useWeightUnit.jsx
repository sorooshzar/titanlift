import { useState, useEffect } from "react";

// All weights in DB are stored in KG (base unit).
// This hook returns the current display unit and a converter.
export function useWeightUnit() {
  const [unit, setUnit] = useState(() => localStorage.getItem("gym-weight-unit") || "kg");

  useEffect(() => {
    const handler = () => setUnit(localStorage.getItem("gym-weight-unit") || "kg");
    window.addEventListener("weightUnitChanged", handler);
    return () => window.removeEventListener("weightUnitChanged", handler);
  }, []);

  // kg (stored) → display unit
  const toDisplay = (kg) => {
    if (kg == null || kg === 0) return kg;
    return unit === "lbs" ? Math.round(kg * 2.20462 * 4) / 4 : kg;
  };

  // display unit → kg (for storage)
  const toKg = (val) => {
    if (val == null || val === 0) return val;
    return unit === "lbs" ? val / 2.20462 : val;
  };

  return { unit, toDisplay, toKg };
}