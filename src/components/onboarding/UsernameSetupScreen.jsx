import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSign } from "lucide-react";

export default function UsernameSetupScreen({ onComplete }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 16);
    setUsername(val);
    setError("");
  };

  const handleSave = async () => {
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setSaving(true);
    await base44.auth.updateMe({ username: username.trim() });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <AtSign className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Choose a Username</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pick a unique username up to 16 characters. This is how friends will identify you.
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">@</span>
            <Input
              value={username}
              onChange={handleChange}
              placeholder="your_username"
              className="pl-7 text-base bg-secondary border-0 rounded-xl h-12"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {error ? <span className="text-destructive">{error}</span> : <span>Letters, numbers, underscores only</span>}
            <span>{username.length}/16</span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || username.trim().length < 3}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {saving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}