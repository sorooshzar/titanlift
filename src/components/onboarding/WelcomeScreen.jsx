import React from "react";
import { motion } from "framer-motion";

export default function WelcomeScreen({ onGetStarted, onLogin }) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-primary/10 rounded-full blur-[80px]" />
      </div>

      {/* Hero content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/30 backdrop-blur">
            <span className="text-5xl select-none">⚡</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <h1 className="text-5xl font-black tracking-tight text-white mb-4 leading-[1.05]">
            Welcome to<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), #60a5fa)" }}
            >
              Olympus
            </span>
          </h1>

          <p className="text-white/50 text-base leading-relaxed max-w-xs mx-auto font-medium">
            Rise to the top. Build strength,<br />discipline, and greatness.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-2 mt-8 flex-wrap justify-center"
        >
          {["Strength Tracking", "Macro Goals", "Muscle Ranks"].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative z-10 px-6 pb-14 space-y-3"
      >
        <button
          onClick={onGetStarted}
          className="w-full h-14 rounded-2xl font-bold text-base text-white active:scale-[0.97] transition-transform shadow-xl shadow-primary/30"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #3b7ff5)" }}
        >
          Get Started
        </button>

        <button
          onClick={onLogin}
          className="w-full h-12 rounded-2xl font-semibold text-sm text-white/60 active:scale-[0.97] transition-transform"
        >
          Already have an account?{" "}
          <span className="text-white/90 underline underline-offset-2">Log in</span>
        </button>
      </motion.div>
    </div>
  );
}