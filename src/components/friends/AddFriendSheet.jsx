import React, { useState } from "react";
import { X, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function AddFriendSheet({ currentUser, onClose, onRequestSent }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // { found, user }
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    setError("");
    setSent(false);

    const users = await base44.entities.User.list();
    const found = users.find(u =>
      u.username?.toLowerCase() === query.trim().toLowerCase() &&
      u.email !== currentUser.email
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

    // Check if request already exists
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
      requester_username: currentUser.username || "",
      recipient_username: result.user.username || "",
      status: "pending",
    });

    setSending(false);
    setSent(true);
    onRequestSent?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1" />
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">Add Friend</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">Search by exact username to send a friend request.</p>

        <div className="flex gap-2">
          <Input
            placeholder="Enter username..."
            value={query}
            onChange={e => { setQuery(e.target.value); setResult(null); setSent(false); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="bg-secondary border-0 flex-1"
          />
          <Button onClick={handleSearch} disabled={searching || !query.trim()} className="px-4 rounded-xl">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {result && !result.found && (
          <p className="text-sm text-muted-foreground text-center py-2">No user found with that username.</p>
        )}

        {result?.found && !sent && (
          <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{result.user.full_name?.[0]?.toUpperCase() || "?"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{result.user.full_name}</p>
              <p className="text-xs text-muted-foreground">@{result.user.username}</p>
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