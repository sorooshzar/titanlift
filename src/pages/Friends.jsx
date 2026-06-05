import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, UserPlus, Inbox, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FriendProfileModal from "@/components/friends/FriendProfileModal";
import AddFriendSheet from "@/components/friends/AddFriendSheet";
import InboxSheet from "@/components/friends/InboxSheet";

function getLevelData(volume) {
  if (!volume || volume <= 0) return { level: 1, xpIntoLevel: 0, xpNeeded: 500, progress: 0 };
  let level = 1;
  let xpUsed = 0;
  while (level <= 999) {
    const xpNeeded = Math.floor(Math.pow(level, 1.5) * 500);
    if (xpNeeded <= 0) break;
    if (xpUsed + xpNeeded > volume) {
      return { level, xpIntoLevel: volume - xpUsed, xpNeeded, progress: Math.min((volume - xpUsed) / xpNeeded, 1) };
    }
    xpUsed += xpNeeded;
    level++;
  }
  return { level: 999, xpIntoLevel: 0, xpNeeded: 1, progress: 1 };
}

function FriendCard({ friend, xp, onView }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3.5">
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
        <span className="text-sm font-bold text-primary">{friend.username?.[0]?.toUpperCase() ?? "?"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold truncate">{friend.username ? `@${friend.username}` : "Unknown user"}</p>
          <span className="text-xs font-bold text-primary ml-2 shrink-0">Lv {xp.level}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${xp.progress * 100}%` }}
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(friend, xp)}
        className="h-8 px-3 text-xs rounded-xl text-muted-foreground shrink-0 ml-1"
      >
        View
      </Button>
    </div>
  );
}

export default function Friends() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [currentUser, setCurrentUser] = useState(null);
   const [showAddFriend, setShowAddFriend] = useState(false);
   const [showInbox, setShowInbox] = useState(false);
   const [viewingFriend, setViewingFriend] = useState(null); // { friend, xp }
   const [friendData, setFriendData] = useState(null); // { workoutLogs, bodyWeights, nutritionRanks }

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      // Ensure this user's own SBD cache is seeded from history
      base44.functions.invoke("updateSBDCache", { rebuildFromHistory: true })
        .catch(() => {});
    }).catch(() => {});
  }, []);

  const { data: allFriendships = [], refetch: refetchFriendships } = useQuery({
    queryKey: ["friendships"],
    queryFn: () => base44.entities.Friendship.list(),
    enabled: !!currentUser,
  });

  // Subscribe to friendship changes to auto-refetch for both parties
  useEffect(() => {
    const unsubscribe = base44.entities.Friendship.subscribe((event) => {
      if (event.type === "update" || event.type === "create") {
        refetchFriendships();
      }
    });
    return () => unsubscribe();
  }, [refetchFriendships]);

  // Subscribe to SBD cache changes — when a friend finishes a workout, refresh their data
  useEffect(() => {
    const unsubscribe = base44.entities.UserSBDCache.subscribe((event) => {
      if (event.type === "update" || event.type === "create") {
        // Invalidate all friendData queries so the next view is fresh
        queryClient.invalidateQueries({ queryKey: ['friendData'] });
        // If we're currently viewing a friend's modal, update it live
        setViewingFriend(prev => {
          if (!prev) return prev;
          const cached = queryClient.getQueryData(['friendData', prev.friend.email]);
          if (cached) setFriendData(cached);
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Accepted friendships involving current user
  const acceptedFriendships = allFriendships.filter(f =>
    f.status === "accepted" &&
    (f.requester_email === currentUser?.email || f.recipient_email === currentUser?.email)
  );

  // Build friend objects directly from friendship records (avoids User.list() RLS restriction)
  const friends = acceptedFriendships.map(f => {
    const isRequester = f.requester_email === currentUser?.email;
    const friendEmail = isRequester ? f.recipient_email : f.requester_email;
    const friendUsername = isRequester ? f.recipient_username : f.requester_username;
    return {
      id: friendEmail,
      email: friendEmail,
      username: friendUsername || null, // never fall back to email
    };
  });

  // Backfill missing usernames on friendship records
  useEffect(() => {
    if (!currentUser) return;
    acceptedFriendships.forEach(async (f) => {
      const isRequester = f.requester_email === currentUser.email;
      const myUsernameField = isRequester ? "requester_username" : "recipient_username";
      const friendUsernameField = isRequester ? "recipient_username" : "requester_username";
      const myCurrentUsername = isRequester ? f.requester_username : f.recipient_username;
      const friendCurrentUsername = isRequester ? f.recipient_username : f.requester_username;

      const updates = {};

      // Patch my own username if missing or stale
      if (currentUser.username && myCurrentUsername !== currentUser.username) {
        updates[myUsernameField] = currentUser.username;
      }

      // Patch friend's username if missing — look up from User list
      if (!friendCurrentUsername) {
        const friendEmail = isRequester ? f.recipient_email : f.requester_email;
        const users = await base44.entities.User.list();
        const friendUser = users.find(u => u.email === friendEmail);
        if (friendUser?.username) {
          updates[friendUsernameField] = friendUser.username;
        }
      }

      if (Object.keys(updates).length > 0) {
        await base44.entities.Friendship.update(f.id, updates);
      }
    });
   
  }, [acceptedFriendships.length, currentUser?.username]);

  // Preload all friend data in parallel using React Query
  useEffect(() => {
    friends.forEach(friend => {
      queryClient.prefetchQuery({
        queryKey: ['friendData', friend.email],
        queryFn: async () => {
          const res = await base44.functions.invoke('getFriendData', { friendEmail: friend.email });
          return res.data;
        },
        staleTime: 30000,
      });
    });
  }, [friends, queryClient]);

  const handleViewFriend = (friend, xp) => {
    const cachedData = queryClient.getQueryData(['friendData', friend.email]) || {
      workoutLogs: [],
      bodyWeights: [],
      muscleRanks: {},
      nutritionRanks: [],
      xp,
    };
    // Merge friendUser data (unlockedMedals etc.) into the friend object
    const enrichedFriend = cachedData.friendUser
      ? { ...friend, ...cachedData.friendUser }
      : friend;
    setViewingFriend({ friend: enrichedFriend, xp: cachedData.xp || xp });
    setFriendData(cachedData);
  };

  const friendsWithXp = friends.map(friend => {
    const cachedData = queryClient.getQueryData(['friendData', friend.email]);
    const xp = cachedData?.xp || getLevelData(0);
    return { friend, xp };
  });

  // Pending requests count for badge
  const pendingCount = allFriendships.filter(
    f => f.recipient_email === currentUser?.email && f.status === "pending"
  ).length;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["friendships"] });
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/20 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3">
        <div className="relative flex items-center justify-between">
          <button
            onClick={() => navigate('/Profile')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h1 className="text-base font-bold">Friends</h1>
            {currentUser?.username && (
              <p className="text-[11px] text-muted-foreground">@{currentUser.username}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInbox(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors relative"
            >
              <Inbox className="w-[18px] h-[18px] text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
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
        {friendsWithXp.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">No friends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Search by username to add friends</p>
            </div>
            <Button onClick={() => setShowAddFriend(true)} className="rounded-xl px-6">
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </Button>
          </div>
        ) : (
          friendsWithXp.map(({ friend, xp }) => (
             <FriendCard
               key={friend.id}
               friend={friend}
               xp={xp}
               onView={handleViewFriend}
             />
           ))
        )}
      </div>

      {/* Friend Profile Modal */}
      {viewingFriend && (
        <FriendProfileModal
          friend={viewingFriend.friend}
          xp={viewingFriend.xp}
          onClose={() => setViewingFriend(null)}
          workoutLogs={friendData?.workoutLogs || []}
          bodyWeights={friendData?.bodyWeights || []}
          muscleRanks={friendData?.muscleRanks || {}}
          nutritionRanks={friendData?.nutritionRanks || []}
          sbdCache={friendData?.sbdCache || null}
        />
      )}

      {/* Add Friend Sheet */}
      {showAddFriend && currentUser && (
        <AddFriendSheet
          currentUser={currentUser}
          onClose={() => setShowAddFriend(false)}
          onRequestSent={() => { handleRefresh(); setShowAddFriend(false); }}
        />
      )}

      {/* Inbox Sheet */}
      {showInbox && currentUser && (
        <InboxSheet
          currentUser={currentUser}
          requests={allFriendships}
          onClose={() => setShowInbox(false)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}