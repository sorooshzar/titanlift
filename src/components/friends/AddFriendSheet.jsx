import React, { useState } from "react";
import { X, Search, UserCheck, Eye, EyeOff, Copy, Check as CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

function formatCode(raw) {
  // Format 12 digits as XXXX-XXXX-XXXX
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts = digits.match(/.{1,4}/g) || [];
  return parts.join("-");
}

export default function AddFriendSheet({ currentUser, onClose, onRequestSent }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showMyCode, setShowMyCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const myCode = currentUser?.friend_code || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQueryChange = (e) => {
    const formatted = formatCode(e.target.value);
    setQuery(formatted);
    setResult(null);
    setSent(false);
    setError("");
  };

  const handleSearch = async () => {
    const raw = query.replace(/-/g, "").trim();
    if (!raw || raw.length < 12) return;
    setSearching(true);
    setResult(null);
    setError("");
    setSent(false);

    const users = await base44.entities.User.list();
    const found = users.find(u =>
      u.friend_code?.replace(/-/g, "") === raw && u.email !== currentUser.email
    );

    setSearching(false);
    if (found) {
      setResult({ found: true, user: found });
    } else {
      setResult({ found: false });
    }
  };

  const handleSendRequest = async () => {
    if (!result?.user) return;
    setSending(true);

    const existing = await base44.entities.Friendship.list();
    const alreadyExists = existing.some(f =>
      (f.requester_email === currentUser.email && f.recipient_email === result.user.email) ||
      (f.requester_email === result.user.email && f.recipient_email === currentUser.email)
    );

    if (alreadyExists) {
      setError("You already have a connection with this user.");
      setSending(false);
      return;
    }

    await base44.entities.Friendship.create({
      requester_email: currentUser.email,
      recipient_email: result.user.email,
      requester_username: currentUser.username || null,
      recipient_username: result.user.username || null,
      status: "pending",
    });

    setSending(false);
    setSent(true);
    onRequestSent?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 p-6 space-y-4"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1" />
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">Add Friend</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* My Friend Code */}
        <div className="bg-secondary rounded-2xl px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Friend Code</p>
            <button
              onClick={() => setShowMyCode(v => !v)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold"
            >
              {showMyCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showMyCode ? "Hide" : "Show"}
            </button>
          </div>
          {showMyCode && (
            <div className="flex items-center gap-2">
              {myCode ? (
                <>
                  <p className="text-lg font-mono font-bold text-foreground tracking-widest flex-1">{myCode}</p>
                  <button
                    onClick={handleCopy}
                    className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    {copied ? <CheckIcon className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                  </button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Generating your code...</p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">Enter a friend's code to send them a request.</p>

        <div className="flex gap-2">
          <Input
            placeholder="XXXX-XXXX-XXXX"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="bg-secondary border-0 flex-1 font-mono text-base tracking-widest text-center"
            maxLength={14}
            inputMode="numeric"
          />
          <Button
            onClick={handleSearch}
            disabled={searching || query.replace(/-/g, "").length < 12}
            className="px-4 rounded-xl"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {result && !result.found && (
          <p className="text-sm text-muted-foreground text-center py-2">No user found with that code.</p>
        )}

        {result?.found && !sent && (
          <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{result.user.username?.[0]?.toUpperCase() || "?"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">@{result.user.username || "Unknown user"}</p>
            </div>
            <Button size="sm" onClick={handleSendRequest} disabled={sending} className="rounded-xl px-3 text-xs">
              {sending ? "Sending..." : "Add"}
            </Button>
          </div>
        )}

        {sent && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary">
            <UserCheck className="w-4 h-4" /> Friend request sent!
          </div>
        )}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}
      </div>
    </div>
  );
}