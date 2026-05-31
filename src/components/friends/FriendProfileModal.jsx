import React from "react";
import { X } from "lucide-react";
import { ALL_MEDALS } from "@/components/profile/MedalsBook";

function MedalTile({ medal, unlocked }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
      unlocked
        ? "bg-card border-primary/30"
        : "bg-secondary/40 border-border/40 opacity-50"
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        unlocked ? "bg-primary/15" : "bg-muted/60"
      }`}>
        <span className={unlocked ? "opacity-100" : "opacity-25"}>🏅</span>
      </div>
      <p className={`text-[9px] font-semibold text-center leading-tight ${
        unlocked ? "text-foreground" : "text-muted-foreground"
      }`}>
        {medal.title}
      </p>
    </div>
  );
}

export default function FriendProfileModal({ friend, xp, onClose }) {
  const unlockedCount = friend.unlockedMedals?.length || 0;
  const totalCount = ALL_MEDALS.length;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card rounded-3xl border border-border/40 overflow-y-auto"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base">Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/30">
              <span className="text-2xl font-black text-primary">
                {friend.full_name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="text-center">
              <p className="font-bold text-base">{friend.full_name || "Unknown"}</p>
              {friend.username && (
                <p className="text-xs text-muted-foreground mt-0.5">@{friend.username}</p>
              )}
            </div>
          </div>

          {/* Level card */}
          <div className="bg-secondary rounded-2xl px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Level</p>
              <span className="text-xl font-black text-primary">{xp?.level ?? 1}</span>
            </div>
            <div className="h-1.5 bg-background/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min((xp?.progress || 0) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {Math.round(xp?.xpIntoLevel || 0).toLocaleString()} / {Math.round(xp?.xpNeeded || 500).toLocaleString()} XP
            </p>
          </div>

          {/* Medals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medals</p>
              <span className="text-xs font-bold text-primary">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {ALL_MEDALS.map(medal => (
                <MedalTile
                  key={medal.id}
                  medal={medal}
                  unlocked={(friend.unlockedMedals || []).includes(medal.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}