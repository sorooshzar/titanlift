import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, UserPlus, Inbox, User } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock friends data — skeleton for now
const MOCK_FRIENDS = [
  { id: "1", name: "Alex Carter", level: 12, progress: 0.6, weight: "84kg", initials: "AC" },
  { id: "2", name: "Jordan Lee", level: 8, progress: 0.3, weight: "72kg", initials: "JL" },
  { id: "3", name: "Sam Rivera", level: 21, progress: 0.85, weight: "91kg", initials: "SR" },
  { id: "4", name: "Taylor Kim", level: 5, progress: 0.2, weight: "65kg", initials: "TK" },
];

function FriendCard({ friend }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{friend.initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold truncate">{friend.name}</p>
          <span className="text-xs font-bold text-primary ml-2 shrink-0">Lv {friend.level}</span>
        </div>
        {/* Level progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${friend.progress * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{friend.weight}</p>
      </div>

      {/* View profile */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs rounded-xl text-muted-foreground shrink-0 ml-1"
      >
        View
      </Button>
    </div>
  );
}

export default function Friends() {
  const navigate = useNavigate();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/20 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <h1 className="text-base font-bold">Friends</h1>

          <div className="flex items-center gap-1">
            {/* Inbox — friend requests */}
            <button
              onClick={() => setShowInbox(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors relative"
            >
              <Inbox className="w-[18px] h-[18px] text-muted-foreground" />
            </button>

            {/* Add friend */}
            <button
              onClick={() => setShowAddFriend(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
            >
              <UserPlus className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Friends list */}
      <div className="px-4 pt-4 pb-10 space-y-2.5">
        {MOCK_FRIENDS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">No friends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add friends to compare progress</p>
            </div>
            <Button onClick={() => setShowAddFriend(true)} className="rounded-xl px-6">
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </Button>
          </div>
        ) : (
          MOCK_FRIENDS.map(f => <FriendCard key={f.id} friend={f} />)
        )}
      </div>

      {/* Add Friend sheet (placeholder) */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowAddFriend(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1" />
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Add Friend</h2>
              <button onClick={() => setShowAddFriend(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Friend search coming soon. Share your username to connect.</p>
            <Button className="w-full rounded-xl h-11" onClick={() => setShowAddFriend(false)}>Got it</Button>
          </div>
        </div>
      )}

      {/* Inbox sheet (placeholder) */}
      {showInbox && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowInbox(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border/40 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-muted-foreground/25 rounded-full mx-auto -mt-1 mb-1" />
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Friend Requests</h2>
              <button onClick={() => setShowInbox(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col items-center py-8 gap-2 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No pending friend requests</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}