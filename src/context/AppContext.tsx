"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  UserState,
  INITIAL_USER,
  AuthProvider,
  Problem,
  MOCK_PROBLEMS,
  Mission,
  MOCK_MISSIONS,
  LeaderboardEntry,
  MOCK_LEADERBOARD,
  SolveRewardResult,
} from "@/lib/mockData";

const USER_STORAGE_KEY = "nexorithm-user-state";

const loadStoredUser = (userId?: string): UserState => {
  if (typeof window === "undefined") return INITIAL_USER;

  const storageKey = userId ? `${USER_STORAGE_KEY}-${userId}` : USER_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return INITIAL_USER;

    const parsed = JSON.parse(raw) as Partial<UserState>;
    return {
      ...INITIAL_USER,
      ...parsed,
      solvedProblemIds: Array.isArray(parsed.solvedProblemIds) ? parsed.solvedProblemIds : [],
    };
  } catch {
    return INITIAL_USER;
  }
};

interface SignInWithEmailInput {
  fullName?: string;
  email: string;
  password: string;
  isSignUp?: boolean;
}

interface AppContextType {
  user: UserState;
  problems: Problem[];
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  isPro: boolean;
  isAuthenticated: boolean;
  solvedCount: number;
  isProblemSolved: (problemId: string) => boolean;
  buyStreakShield: () => boolean;
  upgradeToPro: () => void;
  solveProblem: (problemId: string) => SolveRewardResult;
  signInWithProvider: (provider: Exclude<AuthProvider, "guest" | "email">) => void;
  signInWithEmail: (input: SignInWithEmailInput) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

const providerProfiles: Record<
  Exclude<AuthProvider, "guest" | "email">,
  Pick<UserState, "fullName" | "username" | "email" | "avatarUrl">
> = {
  google: {
    fullName: "Alex Rivera",
    username: "alexrivera",
    email: "alex.rivera@gmail.com",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexRivera",
  },
  github: {
    fullName: "Sam Dev",
    username: "samdev",
    email: "sam.dev@users.noreply.github.com",
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=SamDev",
  },
};

const usernameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "coder";

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyReward = (): SolveRewardResult => ({
  awarded: false,
  alreadySolved: false,
  xpGained: 0,
  coinsGained: 0,
  reputationGained: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [hydrated, setHydrated] = useState(false);

  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [leaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      const stored = loadStoredUser(clerkUser.id);
      setUser({
        ...stored,
        fullName: clerkUser.fullName || clerkUser.firstName || "Coder",
        username: clerkUser.username || usernameFromEmail(clerkUser.primaryEmailAddress?.emailAddress || "") || "coder",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatarUrl: clerkUser.imageUrl,
        authProvider: "email",
      });
    } else {
      setUser(loadStoredUser());
    }
    setHydrated(true);
  }, [isLoaded, isSignedIn, clerkUser]);

  useEffect(() => {
    if (!hydrated) return;
    const storageKey = isSignedIn && clerkUser ? `${USER_STORAGE_KEY}-${clerkUser.id}` : USER_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(user));
  }, [user, hydrated, isSignedIn, clerkUser]);

  const buyStreakShield = (): boolean => {
    return false;
  };

  const upgradeToPro = () => undefined;

  const isProblemSolved = (problemId: string) => user.solvedProblemIds.includes(problemId);

  const signInWithProvider = (provider: Exclude<AuthProvider, "guest" | "email">) => {
    // No-op or simulated, Clerk handles provider flows
  };

  const signInWithEmail = ({ fullName, email, password, isSignUp = false }: SignInWithEmailInput) => {
    // No-op, Clerk handles email sign in
    return { ok: true as const };
  };

  const signOut = () => {
    if (clerkSignOut) {
      clerkSignOut();
    }
    setUser(INITIAL_USER);
  };

  const solveProblem = (problemId: string): SolveRewardResult => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return emptyReward();

    if (isProblemSolved(problemId)) {
      return { ...emptyReward(), alreadySolved: true };
    }

    const reputationGained = Math.max(5, Math.floor(problem.xpReward / 10));

    setUser((current) => {
      const nextXp = current.xp + problem.xpReward;
      const nextStreak = current.currentStreak === 0 ? 1 : current.currentStreak;

      return {
        ...current,
        xp: nextXp,
        coins: current.coins + problem.coinReward,
        reputation: current.reputation + reputationGained,
        devRank: Math.floor(nextXp / 200),
        currentStreak: nextStreak,
        longestStreak: Math.max(current.longestStreak, nextStreak),
        solvedProblemIds: [...current.solvedProblemIds, problemId],
      };
    });

    setMissions((current) =>
      current.map((mission) =>
        mission.id === "m1"
          ? { ...mission, currentCount: Math.min(mission.targetCount, mission.currentCount + 1) }
          : mission,
      ),
    );

    return {
      awarded: true,
      alreadySolved: false,
      xpGained: problem.xpReward,
      coinsGained: problem.coinReward,
      reputationGained,
    };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        problems,
        missions,
        leaderboard,
        isPro: user.isPro,
        isAuthenticated: !!isSignedIn,
        solvedCount: user.solvedProblemIds.length,
        isProblemSolved,
        buyStreakShield,
        upgradeToPro,
        solveProblem,
        signInWithProvider,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

