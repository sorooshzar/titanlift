import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SingleColumnWheel({ items, selectedIndex = 0, onChange, height = 80, itemHeight = 24 }) {
  const [scrollIndex, setScrollIndex] = useState(selectedIndex);
  const containerRef = useRef(null);

  useEffect(() => {
    setScrollIndex(selectedIndex);
  }, [selectedIndex]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(items.length - 1, scrollIndex + delta));
    setScrollIndex(newIndex);
    onChange(newIndex);
  };

  const handleTouchStart = useRef(null);
  const handleTouchMove = (e) => {
    if (!handleTouchStart.current) return;
    const delta = handleTouchStart.current - e.touches[0].clientY;
    if (Math.abs(delta) > 10) {
      const direction = delta > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(items.length - 1, scrollIndex + direction));
      setScrollIndex(newIndex);
      onChange(newIndex);
      handleTouchStart.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    handleTouchStart.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-background rounded-md overflow-hidden"
      style={{ height: `${height}px`, width: `${itemHeight * 1.8}px` }}
      onWheel={handleWheel}
      onTouchStart={(e) => (handleTouchStart.current = e.touches[0].clientY)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Highlight center item */}
      <div
        className="absolute left-0 right-0 border-t border-b border-muted-foreground/30 pointer-events-none"
        style={{ top: `${height / 2 - itemHeight / 2}px`, height: `${itemHeight}px` }}
      />

      {/* Scrollable items */}
      <motion.div
        className="flex flex-col items-center justify-center"
        style={{
          y: -scrollIndex * itemHeight + height / 2 - itemHeight / 2,
        }}
        animate={{
          y: -scrollIndex * itemHeight + height / 2 - itemHeight / 2,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center text-xs font-semibold text-foreground shrink-0"
            style={{ height: `${itemHeight}px`, minWidth: `${itemHeight * 1.8}px` }}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}