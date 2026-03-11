import React, { useState, useRef, useEffect } from "react";

export default function ScrollWheel({ options, value, onChange, label }) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startYRef = useRef(0);

  const currentIndex = options.indexOf(value);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = startYRef.current - e.clientY;
    const itemHeight = 40;
    const moved = Math.round(diff / itemHeight);

    if (moved !== 0) {
      const newIndex = Math.max(0, Math.min(currentIndex + moved, options.length - 1));
      onChange(options[newIndex]);
      startYRef.current = e.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, currentIndex, options]);

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <label className="text-sm font-semibold text-center">{label}</label>}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="w-20 h-24 bg-secondary rounded-lg border border-border flex flex-col items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
      >
        <div className="absolute inset-x-0 h-10 top-1/2 -translate-y-1/2 bg-primary/10 border-t border-b border-primary/30 pointer-events-none" />
        <div className="flex flex-col items-center justify-center gap-2">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={`text-sm font-semibold h-10 flex items-center justify-center transition-all ${
                currentIndex === idx ? "text-primary scale-110" : "text-muted-foreground opacity-40"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}