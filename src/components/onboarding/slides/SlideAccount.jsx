import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Mail, Eye, EyeOff, User } from "lucide-react";

export default function SlideAccount({ answers, update, onFinish, saving }) {
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = () => {
    // After OAuth, land back on Profile (OnboardingGate will handle incomplete onboarding)
    base44.auth.redirectToLogin(createPageUrl("Profile"));
  };

  const handleEmailSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    setLoading(true);
    try {
      base44.auth.redirectToLogin(createPageUrl("Profile"));
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleSkip = () => {
    onFinish?.();
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Final Step</p>
        <h2 className="text-3xl font-black mb-1">Create your account 🔐</h2>
        <p className="text-muted-foreground text-sm mb-6">Save your progress and access your data anywhere.</p>
      </motion.div>

      {/* Mode toggle */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex bg-secondary rounded-xl p-1 mb-6">
        {["signup", "login"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all
              ${mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
            {m === "signup" ? "Sign Up" : "Log In"}
          </button>
        ))}
      </motion.div>

      {/* OAuth buttons */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3 mb-6">
        <button
          onClick={() => handleOAuth("google")}
          className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-3.5 font-semibold text-sm hover:bg-secondary transition-colors active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={() => handleOAuth("apple")}
          className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card py-3.5 font-semibold text-sm hover:bg-secondary transition-colors active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or {mode === "signup" ? "sign up" : "log in"} with email</span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      {/* Email form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        {mode === "signup" && (
          <div className="flex items-center bg-secondary rounded-2xl px-4 gap-3">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 h-13 bg-transparent py-3.5 text-sm font-medium focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center bg-secondary rounded-2xl px-4 gap-3">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 h-13 bg-transparent py-3.5 text-sm font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center bg-secondary rounded-2xl px-4 gap-3">
          <button onClick={() => setShowPass(v => !v)} className="shrink-0">
            {showPass
              ? <EyeOff className="w-4 h-4 text-muted-foreground" />
              : <Eye className="w-4 h-4 text-muted-foreground" />}
          </button>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="flex-1 h-13 bg-transparent py-3.5 text-sm font-medium focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-destructive px-1">{error}</p>}

        <button
          onClick={handleEmailSubmit}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-primary text-white font-bold text-sm mt-2 disabled:opacity-60 py-3.5"
        >
          {loading ? "..." : mode === "signup" ? "Create Account 🚀" : "Log In →"}
        </button>

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>

        <button onClick={handleSkip} className="w-full text-center text-xs text-muted-foreground pt-2 pb-1">
          Skip for now →
        </button>
      </motion.div>
    </div>
  );
}