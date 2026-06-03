import React, { useState, useEffect } from "react";
import { UserPlus, Link, ClipboardList, ChevronRight, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useWeightUnit } from "@/components/utils/useWeightUnit";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutIcon } from "./IconPickerModal";

// ── Sub-views ──────────────────────────────────────────────────────────────

function SendToFriendView({ template, currentUser, onBack }) {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentTo, setSentTo] = useState(null);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    base44.entities.Friendship.list().then(all => {
      const accepted = all.filter(
        f => f.status === "accepted" &&
          (f.requester_email === currentUser.email || f.recipient_email === currentUser.email)
      );
      setFriendships(accepted);
      setLoading(false);
    });
  }, [currentUser.email]);

  const handleSend = async (friendship) => {
    const friendEmail =
      friendship.requester_email === currentUser.email
        ? friendship.recipient_email
        : friendship.requester_email;
    const friendName =
      friendship.requester_email === currentUser.email
        ? friendship.recipient_username
        : friendship.requester_username;

    setSending(friendship.id);
    await base44.entities.WorkoutTemplate.create({
      name: template.name,
      exercises: template.exercises,
      color: template.color,
      icon: template.icon,
      notes: template.notes,
      shared_from_email: currentUser.email,
      shared_from_name: currentUser.full_name,
    });
    setSending(null);
    setSentTo(friendship.id);
  };

  return (
    <div>
      <button onClick={onBack} className="text-xs text-muted-foreground mb-4 flex items-center gap-1 active:opacity-60">
        ← Back
      </button>
      <p className="text-sm font-semibold mb-3">Send to a friend</p>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : friendships.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No friends yet. Add some first!</p>
      ) : (
        <div className="space-y-2">
          {friendships.map(f => {
            const isSent = sentTo === f.id;
            const isSending = sending === f.id;
            const name = f.requester_email === currentUser.email ? f.recipient_username : f.requester_username;
            return (
              <button
                key={f.id}
                onClick={() => !isSent && handleSend(f)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/60 active:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium">{name || "Friend"}</span>
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : isSent ? (
                  <span className="text-xs text-green-500 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Sent!</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Sheet ─────────────────────────────────────────────────────────────

export default function ShareWorkoutSheet({ template, onClose }) {
  const [view, setView] = useState("main"); // "main" | "friend"
  const [currentUser, setCurrentUser] = useState(null);
  const { unit, toDisplay } = useWeightUnit();
  const { toast } = useToast();
  const accentColor = template.color || null;

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/Lifts?shared=${template.id}`;
    navigator.clipboard.writeText(url);
    toast({ description: "Link copied!" });
    onClose();
  };

  const handleCopyText = () => {
    const lines = [`${template.name}`, ""];
    (template.exercises || []).forEach(ex => {
      lines.push(`${ex.exercise_name}${ex.muscle_group ? ` — ${ex.muscle_group}` : ""}`);
      (ex.sets || []).forEach((s, i) => {
        const weight = s.weight ? `${toDisplay(s.weight)}${unit}` : "BW";
        const repsStr = s.reps ? `${s.reps} reps` : "";
        const rirStr = s.rir != null ? ` (RIR ${s.rir})` : "";
        lines.push(`  • Set ${i + 1}: ${weight} × ${repsStr}${rirStr}`);
      });
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n").trim());
    toast({ description: "Copied!" });
    onClose();
  };

  const options = [
    {
      key: "friend",
      icon: <UserPlus className="w-5 h-5" />,
      label: "Send to a friend",
      sub: "They can add it to their routines",
      onTap: () => setView("friend"),
    },
    {
      key: "link",
      icon: <Link className="w-5 h-5" />,
      label: "Copy link",
      sub: "Anyone with the link can view this workout",
      onTap: handleCopyLink,
    },
    {
      key: "text",
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Copy as text",
      sub: "Paste anywhere",
      onTap: handleCopyText,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-card rounded-t-3xl px-5 pt-3 pb-10 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-5" />

        {view === "friend" && currentUser ? (
          <SendToFriendView
            template={template}
            currentUser={currentUser}
            onBack={() => setView("main")}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: accentColor ? accentColor + "22" : "hsl(var(--primary)/0.1)" }}
              >
                <WorkoutIcon
                  name={template.icon}
                  className="w-5 h-5"
                  style={{ color: accentColor ? accentColor + "cc" : "hsl(var(--primary))" }}
                />
              </div>
              <div>
                <p className="font-semibold text-base">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(template.exercises || []).length} exercise{(template.exercises || []).length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {options.map(opt => (
                <button
                  key={opt.key}
                  onClick={opt.onTap}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-secondary/60 active:bg-secondary transition-colors text-left"
                >
                  <span className="text-primary flex-shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}