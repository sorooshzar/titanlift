import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - touchStartY.current);

    // Only trigger pull-to-refresh if at top of scroll
    if (containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(distance, 100));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-y-auto"
    >
      {/* Pull indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
        className="sticky top-0 z-10 flex justify-center pt-2"
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : pullDistance * 3.6 }}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          className="w-6 h-6 text-primary"
        >
          <RotateCw className="w-full h-full" />
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
}