import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export default function LoginScreen({ onBack, onAuthenticated }) {
  const [mode, setMode] = useState("options"); // options | email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOAuth = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginWithEmail(email, password);
      await onAuthenticated();
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-4">
        <button
          onClick={mode === "email" ? () => setMode("options") : onBack}
          className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white/70" />
        </button>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col px-6 pt-4"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
          <p className="text-white/50 text-sm">Sign in to continue your journey</p>
        </div>

        {mode === "options" ? (
          <div className="space-y-3">
            <button
              onClick={handleOAuth}
              className="w-full flex items-center gap-3 h-14 rounded-2xl bg-white/8 border border-white/10 px-5 font-semibold text-sm text-white active:scale-[0.97] transition-transform"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              onClick={handleOAuth}
              className="w-full flex items-center gap-3 h-14 rounded-2xl bg-white/8 border border-white/10 px-5 font-semibold text-sm text-white active:scale-[0.97] transition-transform"
            >
              <AppleIcon />
              Continue with Apple
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs font-medium">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={() => setMode("email")}
              className="w-full flex items-center gap-3 h-14 rounded-2xl bg-white/5 border border-white/8 px-5 font-semibold text-sm text-white/70 active:scale-[0.97] transition-transform"
            >
              <span className="text-lg">✉️</span>
              Continue with Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-13 rounded-2xl bg-white/8 border border-white/10 px-4 text-white placeholder-white/30 text-sm outline-none focus:border-primary/60 transition-colors"
                style={{ height: "52px" }}
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 pr-12 text-white placeholder-white/30 text-sm outline-none focus:border-primary/60 transition-colors"
                  style={{ height: "52px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl font-bold text-base text-white active:scale-[0.97] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #3b7ff5)" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}