import React from "react";
import { motion } from "framer-motion";

const FOOD_EMOJIS = ["🍎", "🥕", "🥬", "🍌", "🍊", "🍋", "🥑", "🍅", "🥦", "🌽", "🥒", "🍞", "🥐", "🥯", "🧀", "🥛", "🍶", "☕", "🍺", "🥤", "🥃", "🍲", "🥘", "🍛", "🍜", "🍝", "🍔", "🍟", "🌭", "🍿", "🥓", "🍖", "🍗", "🥩", "🍤", "🦐", "🐙", "🦑", "🦞", "🦀", "🐟", "🐠", "🐡", "🦈", "🥮", "🍱", "🍙", "🍚", "🍲", "🥞", "🧇", "🥟", "🦪", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🍝", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🍰", "🎂", "🧁", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜"];

export default function FoodEmojiPickerModal({ open, current, onSelect, onClose }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold mb-4 text-center">Choose Food Icon</h3>

        <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto pr-1">
          {FOOD_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className={`h-12 rounded-lg flex items-center justify-center text-2xl transition-all hover:bg-primary/20 ${
                current === emoji ? "ring-2 ring-primary bg-primary/10" : "bg-secondary hover:bg-secondary/70"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}