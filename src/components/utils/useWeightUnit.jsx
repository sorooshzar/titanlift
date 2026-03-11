import { useState, useEffect } from "react";

export function useWeightUnit() {
  const [unit, setUnit] = useState(() => localStorage.getItem("gym-weight-unit") || "kg");

  useEffect(() => {
    const handler = () => setUnit(localStorage.getItem("gym-weight-unit") || "kg");
    window.addEventListener("weightUnitChanged", handler);
    return () => window.removeEventListener("weightUnitChanged", handler);
  }, []);

  return unit;
}