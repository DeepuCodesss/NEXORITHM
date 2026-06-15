"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
const LIVE_REWARD_STORAGE_KEY = "nexorithm-live-reward";

export interface LiveRewardConfig {
  problemId: string;
  rewardMoneyInr: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface UpcomingRewardItem {
  problemId: string;
}

export interface ProblemBoardConfig {
  showUpcomingRewards: boolean;
  upcomingRewardItems: UpcomingRewardItem[];
}

const createDefaultLiveReward = (): LiveRewardConfig => {
  const now = Date.now();
  return {
    problemId: MOCK_PROBLEMS[0]?.id ?? "",
    rewardMoneyInr: 5,
    startsAt: new Date(now - 18 * 60 * 1000).toISOString(),
    endsAt: new Date(now + 42 * 60 * 1000 + 15 * 1000).toISOString(),
    isActive: true,
  };
};

const createDefaultProblemBoardConfig = (): ProblemBoardConfig => ({
  showUpcomingRewards: true,
  upcomingRewardItems: [
    { problemId: MOCK_PROBLEMS[1]?.id ?? "" },
    { problemId: MOCK_PROBLEMS[2]?.id ?? "" },
    { problemId: MOCK_PROBLEMS[3]?.id ?? "" },
  ],
});

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

const loadStoredLiveReward = (): LiveRewardConfig => {
  if (typeof window === "undefined") return createDefaultLiveReward();

  try {
    const raw = localStorage.getItem(LIVE_REWARD_STORAGE_KEY);
    if (!raw) return createDefaultLiveReward();

    const parsed = JSON.parse(raw) as Partial<LiveRewardConfig>;
    return {
      ...createDefaultLiveReward(),
      ...parsed,
      rewardMoneyInr: Number(parsed.rewardMoneyInr) > 0 ? Number(parsed.rewardMoneyInr) : 5,
      isActive: parsed.isActive !== false,
    };
  } catch {
    return createDefaultLiveReward();
  }
};

const loadStoredProblemBoardConfig = (): ProblemBoardConfig => {
  if (typeof window === "undefined") return createDefaultProblemBoardConfig();

  try {
    const raw = localStorage.getItem("nexorithm-problem-board");
    if (!raw) return createDefaultProblemBoardConfig();

    const parsed = JSON.parse(raw) as Partial<ProblemBoardConfig>;
    return {
      showUpcomingRewards: parsed.showUpcomingRewards !== false,
      upcomingRewardItems: Array.isArray(parsed.upcomingRewardItems)
        ? parsed.upcomingRewardItems.slice(0, 3).map((item) => ({ problemId: item?.problemId ?? "" }))
        : createDefaultProblemBoardConfig().upcomingRewardItems,
    };
  } catch {
    return createDefaultProblemBoardConfig();
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
  liveReward: LiveRewardConfig;
  problemBoardConfig: ProblemBoardConfig;
  isPro: boolean;
  isAuthenticated: boolean;
  solvedCount: number;
  isProblemSolved: (problemId: string) => boolean;
  buyStreakShield: () => boolean;
  upgradeToPro: () => void;
  solveProblem: (problemId: string) => SolveRewardResult;
  saveLiveReward: (config: LiveRewardConfig) => void;
  saveProblemBoardConfig: (config: ProblemBoardConfig) => void;
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
  moneyGainedInr: 0,
  reputationGained: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [hydrated, setHydrated] = useState(false);
  const [liveReward, setLiveReward] = useState<LiveRewardConfig>(() => createDefaultLiveReward());
  const [problemBoardConfig, setProblemBoardConfig] = useState<ProblemBoardConfig>(() => createDefaultProblemBoardConfig());

  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [leaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    queueMicrotask(() => {
      setUser(loadStoredUser());
      setLiveReward(loadStoredLiveReward());
      setProblemBoardConfig(loadStoredProblemBoardConfig());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(LIVE_REWARD_STORAGE_KEY, JSON.stringify(liveReward));
  }, [liveReward, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem("nexorithm-problem-board", JSON.stringify(problemBoardConfig));
  }, [problemBoardConfig, hydrated]);

  const buyStreakShield = (): boolean => {
    return false;
  };

  const upgradeToPro = () => undefined;

  const isProblemSolved = (problemId: string) => user.solvedProblemIds.includes(problemId);

  const signInWithProvider = (provider: Exclude<AuthProvider, "guest" | "email">) => {
    setUser((current) => ({
      ...current,
      ...providerProfiles[provider],
      authProvider: provider,
    }));
  };

  const signInWithEmail = ({ fullName, email, password }: SignInWithEmailInput) => {
    if (!email.trim()) return { ok: false as const, error: "Enter an email address." };
    if (!password.trim()) return { ok: false as const, error: "Enter a password." };
    setUser((current) => ({
      ...current,
      fullName: fullName?.trim() || current.fullName || "Nexorithm Coder",
      username: usernameFromEmail(email),
      email,
      authProvider: "email",
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    }));
    return { ok: true as const };
  };

  const signOut = () => {
    setUser(INITIAL_USER);
  };

  const solveProblem = (problemId: string): SolveRewardResult => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return emptyReward();

    if (isProblemSolved(problemId)) {
      return { ...emptyReward(), alreadySolved: true };
    }

    const reputationGained = Math.max(5, Math.floor(problem.xpReward / 10));
    const now = Date.now();
    const isLiveRewardProblem =
      liveReward.isActive &&
      liveReward.problemId === problemId &&
      new Date(liveReward.startsAt).getTime() <= now &&
      new Date(liveReward.endsAt).getTime() > now;
    const moneyGainedInr = isLiveRewardProblem ? liveReward.rewardMoneyInr : 0;

    setUser((current) => {
      const nextXp = current.xp + problem.xpReward;
      const nextStreak = current.currentStreak === 0 ? 1 : current.currentStreak;

      return {
        ...current,
        xp: nextXp,
        coins: current.coins + problem.coinReward,
        moneyEarnedInr: (current.moneyEarnedInr ?? 0) + moneyGainedInr,
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
      moneyGainedInr,
      reputationGained,
    };
  };

  const saveLiveReward = (config: LiveRewardConfig) => {
    setLiveReward({
      ...config,
      rewardMoneyInr: Math.max(1, Math.round(Number(config.rewardMoneyInr) || 1)),
      isActive: config.isActive,
    });
  };

  const saveProblemBoardConfig = (config: ProblemBoardConfig) => {
    setProblemBoardConfig({
      showUpcomingRewards: config.showUpcomingRewards,
      upcomingRewardItems: config.upcomingRewardItems.slice(0, 3).map((item) => ({
        problemId: item.problemId,
      })),
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        problems,
        missions,
        leaderboard,
        liveReward,
        problemBoardConfig,
        isPro: user.isPro,
        isAuthenticated: user.authProvider !== "guest",
        solvedCount: user.solvedProblemIds.length,
        isProblemSolved,
        buyStreakShield,
        upgradeToPro,
        solveProblem,
        saveLiveReward,
        saveProblemBoardConfig,
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
