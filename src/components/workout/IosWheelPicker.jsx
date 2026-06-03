import React, { useEffect, useRef, useState } from "react";

const MINUTE_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SECOND_OPTIONS = [0, 15, 30, 45];
const ITEM_HEIGHT = 28;

export default function IosWheelPicker({ value, onChange }) {
  const minRef = useRef(null);
  const secRef = useRef(null);
  const [localMin, setLocalMin] = useState(Math.floor(value / 60));
  const [localSec, setLocalSec] = useState(Math.round((value % 60) / 15) * 15 % 60);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  // Sync scroll position when value changes externally
  useEffect(() => {
    if (isScrollingRef.current) return;
    const m = Math.floor(value / 60);
    const s = Math.round((value % 60) / 15) * 15 % 60;
    setLocalMin(m);
    setLocalSec(s);

    const mIdx = MINUTE_OPTIONS.indexOf(m);
    const sIdx = SECOND_OPTIONS.indexOf(s);

    if (minRef.current && mIdx !== -1) {
      minRef.current.scrollTo({ top: mIdx * ITEM_HEIGHT, behavior: "smooth" });
    }
    if (secRef.current && sIdx !== -1) {
      secRef.current.scrollTo({ top: sIdx * ITEM_HEIGHT, behavior: "smooth" });
    }
  }, [value]);

  // Initialize scroll position on mount
  useEffect(() => {
    const m = Math.floor(value / 60);
    const s = Math.round((value % 60) / 15) * 15 % 60;
    const mIdx = MINUTE_OPTIONS.indexOf(m);
    const sIdx = SECOND_OPTIONS.indexOf(s);

    if (minRef.current && mIdx !== -1) {
      minRef.current.scrollTop = mIdx * ITEM_HEIGHT;
    }
    if (secRef.current && sIdx !== -1) {
      secRef.current.scrollTop = sIdx * ITEM_HEIGHT;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMinScroll = (e) => {
    isScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);

    const scrollTop = e.target.scrollTop;
    const idx = Math.round(scrollTop / ITEM_HEIGHT);
    const m = MINUTE_OPTIONS[Math.max(0, Math.min(idx, MINUTE_OPTIONS.length - 1))];

    if (m !== undefined && m !== localMin) {
      setLocalMin(m);
      onChange(m * 60 + localSec);
    }

    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 200);
  };

  const handleSecScroll = (e) => {
    isScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);

    const scrollTop = e.target.scrollTop;
    const idx = Math.round(scrollTop / ITEM_HEIGHT);
    const s = SECOND_OPTIONS[Math.max(0, Math.min(idx, SECOND_OPTIONS.length - 1))];

    if (s !== undefined && s !== localSec) {
      setLocalSec(s);
      onChange(localMin * 60 + s);
    }

    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 200);
  };

  return (
    <div className="relative flex items-center justify-center bg-secondary/40 border border-border/50 rounded-xl overflow-hidden select-none w-36 h-[84px]">
      {/* Selection Highlight */}
      <div className="absolute left-2 right-2 h-7 top-1/2 -translate-y-1/2 bg-primary/10 border-t border-b border-primary/25 rounded-lg pointer-events-none z-10" />

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-card/90 to-transparent pointer-events-none z-20" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-card/90 to-transparent pointer-events-none z-20" />

      <div className="flex items-center w-full h-full">
        {/* Minutes */}
        <div
          ref={minRef}
          onScroll={handleMinScroll}
          className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.ios-wheel::-webkit-scrollbar { display: none; }`}</style>
          <div style={{ height: ITEM_HEIGHT }} />
          {MINUTE_OPTIONS.map((m) => (
            <div
              key={m}
              className={`flex items-center justify-center snap-center transition-all duration-150 ${
                localMin === m
                  ? "text-primary font-black text-sm"
                  : "text-muted-foreground/50 font-semibold text-xs"
              }`}
              style={{ height: ITEM_HEIGHT }}
            >
              {m}m
            </div>
          ))}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>

        {/* Separator */}
        <span className="text-sm font-bold text-muted-foreground/50 shrink-0 pb-0.5">:</span>

        {/* Seconds */}
        <div
          ref={secRef}
          onScroll={handleSecScroll}
          className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div style={{ height: ITEM_HEIGHT }} />
          {SECOND_OPTIONS.map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center snap-center transition-all duration-150 ${
                localSec === s
                  ? "text-primary font-black text-sm"
                  : "text-muted-foreground/50 font-semibold text-xs"
              }`}
              style={{ height: ITEM_HEIGHT }}
            >
              {String(s).padStart(2, "0")}s
            </div>
          ))}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>
      </div>
    </div>
  );
}