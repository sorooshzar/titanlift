import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { initUserStorage, userStorage } from "@/components/utils/userStorage";

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

async function saveOnboardingData(answers) {
  const user = await base44.auth.me();
  initUserStorage(user.id);

  await base44.auth.updateMe({
    onboarding_completed: true,
    goal: answers.goal,
    goal_weight_kg: answers.goal_weight_kg,
    goal_timeline_weeks: answers.goal_timeline_weeks,
    experience_level: answers.experience_level,
    sex: answers.sex,
    age: answers.age,
    height_cm: answers.height_cm,
    weight_kg: answers.weight_kg,
    body_fat_pct: answers.body_fat_pct,
    activity_level: answers.activity_level,
    workout_days_per_week: answers.workout_days_per_week,
    nutrition_tracking: answers.nutrition_tracking,
    daily_calories: answers.daily_calories,
    daily_protein: answers.daily_protein,
    daily_carbs: answers.daily_carbs,
    daily_fat: answers.daily_fat,
    weight_unit: answers.weight_unit,
    week_start: answers.week_start,
    workout_style: answers.workout_style,
  });

  if (answers.weight_unit) userStorage.setItem("gym-weight-unit", answers.weight_unit);
  if (answers.distance_unit) userStorage.setItem("gym-distance-unit", answers.distance_unit);
  if (answers.week_start) userStorage.setItem("gym-week-start", answers.week_start === "sunday" ? "0" : "1");
  if (answers.daily_calories) {
    userStorage.setItem("gym-macro-calories", String(answers.daily_calories));
    userStorage.setItem("gym-macro-protein", String(answers.daily_protein || 0));
    userStorage.setItem("gym-macro-carbs", String(answers.daily_carbs || 0));
    userStorage.setItem("gym-macro-fat", String(answers.daily_fat || 0));
  }
  if (answers.goal_weight_kg) userStorage.setItem("gym-goal-weight", String(answers.goal_weight_kg));
  if (answers.goal_timeline_weeks) userStorage.setItem("gym-goal-weeks", String(answers.goal_timeline_weeks));

  if (answers.weight_kg) {
    await base44.entities.BodyWeight.create({
      weight: answers.weight_kg, unit: "kg", date: new Date().toISOString().split("T")[0],
    });
  }
  if (answers.height_cm) {
    await base44.entities.BodyMeasurement.create({
      body_part: "Height", value: answers.height_cm, unit: "cm", date: new Date().toISOString().split("T")[0],
    });
  }
}

export default function SignUpScreen({ answers, onComplete }) {
  const [mode, setMode] = useState("options"); // options | email
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOAuth = () => {
    // After OAuth, onComplete() will be called from OnboardingGate.checkState
    // Store answers in sessionStorage so they survive the redirect
    if (answers) sessionStorage.setItem("pending_onboarding", JSON.stringify(answers));
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters."); return; }

    setLoading(true);
    try {
      await base44.auth.signUpWithEmail(email, password, { full_name: fullName });
      if (answers) await saveOnboardingData({ ...answers, username });
      await onComplete();
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col overflow-y-auto">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-full px-6 pt-14 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-white mb-2">Create Your Account</h2>
          <p className="text-white/50 text-sm">You're ready. Let's get you into Olympus.</p>
        </motion.div>

        {mode === "options" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button
              onClick={handleOAuth}
              className="w-full flex items-center gap-3 h-14 rounded-2xl bg-white/8 border border-white/10 px-5 font-semibold text-sm text-white active:scale-[0.97] transition-transform"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            <button
              onClick={handleOAuth}
              className="w-full flex items-center gap-3 h-14 rounded-2xl bg-white/8 border border-white/10 px-5 font-semibold text-sm text-white active:scale-[0.97] transition-transform"
            >
              <AppleIcon />
              Sign up with Apple
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
              Sign up with Email
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleEmailSignUp}
            className="space-y-4"
          >
            {[
              { label: "Full Name", value: fullName, set: setFullName, placeholder: "John Doe", type: "text", required: true },
              { label: "Email", value: email, set: setEmail, placeholder: "you@example.com", type: "email", required: true },
              { label: "Username", value: username, set: setUsername, placeholder: "@username", type: "text", required: true },
            ].map(({ label, value, set, placeholder, type, required }) => (
              <div key={label}>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required={required}
                  className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 text-white placeholder-white/30 text-sm outline-none focus:border-primary/60 transition-colors"
                  style={{ height: "52px" }}
                />
              </div>
            ))}

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 pr-12 text-white placeholder-white/30 text-sm outline-none focus:border-primary/60 transition-colors"
                  style={{ height: "52px" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 text-white placeholder-white/30 text-sm outline-none focus:border-primary/60 transition-colors"
                style={{ height: "52px" }}
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="button"
              onClick={() => setMode("options")}
              className="text-white/40 text-sm w-full text-center py-1"
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl font-bold text-base text-white active:scale-[0.97] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #3b7ff5)" }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account →"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}