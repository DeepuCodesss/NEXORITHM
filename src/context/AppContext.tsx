"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  UserState,
  INITIAL_USER,
  Problem,
  MOCK_PROBLEMS,
  Mission,
  MOCK_MISSIONS,
  LeaderboardEntry,
  MOCK_LEADERBOARD,
  SolveRewardResult,
} from "@/lib/mockData";

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

interface AppContextType {
  user: UserState;
  problems: Problem[];
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  liveReward: LiveRewardConfig;
  problemBoardConfig: ProblemBoardConfig;
  isPro: boolean;
  isAuthenticated: boolean;
  isUserSynced: boolean;
  solvedCount: number;
  isProblemSolved: (problemId: string) => boolean;
  buyStreakShield: () => boolean;
  upgradeToPro: () => void;
  solveProblem: (problemId: string) => SolveRewardResult;
  saveLiveReward: (config: LiveRewardConfig) => void;
  saveProblemBoardConfig: (config: ProblemBoardConfig) => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type DbUserSnapshot = {
  id: string;
  clerkId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  college: string;
  authProvider: string;
  xp: number;
  coins: number;
  moneyEarnedInr: number;
  reputation: number;
  devRank: number;
  currentStreak: number;
  longestStreak: number;
  streakShields: number;
  isPro: boolean;
  solvedProblemIds: unknown;
};

const dbUserToState = (dbUser: DbUserSnapshot): UserState => ({
  ...INITIAL_USER,
  fullName: dbUser.fullName || INITIAL_USER.fullName,
  username: dbUser.username || INITIAL_USER.username,
  email: dbUser.email || INITIAL_USER.email,
  avatarUrl: dbUser.avatarUrl || INITIAL_USER.avatarUrl,
  authProvider: (dbUser.authProvider as UserState["authProvider"]) || "email",
  college: dbUser.college || INITIAL_USER.college,
  xp: dbUser.xp ?? INITIAL_USER.xp,
  coins: dbUser.coins ?? INITIAL_USER.coins,
  moneyEarnedInr: dbUser.moneyEarnedInr ?? INITIAL_USER.moneyEarnedInr,
  reputation: dbUser.reputation ?? INITIAL_USER.reputation,
  devRank: dbUser.devRank ?? INITIAL_USER.devRank,
  currentStreak: dbUser.currentStreak ?? INITIAL_USER.currentStreak,
  longestStreak: dbUser.longestStreak ?? INITIAL_USER.longestStreak,
  streakShields: dbUser.streakShields ?? INITIAL_USER.streakShields,
  isPro: dbUser.isPro ?? INITIAL_USER.isPro,
  solvedProblemIds: Array.isArray(dbUser.solvedProblemIds)
    ? dbUser.solvedProblemIds.filter((value): value is string => typeof value === "string")
    : [],
});

const emptyReward = (): SolveRewardResult => ({
  awarded: false,
  alreadySolved: false,
  xpGained: 0,
  coinsGained: 0,
  moneyGainedInr: 0,
  reputationGained: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [hydrated, setHydrated] = useState(false);
  const [isUserSynced, setIsUserSynced] = useState(false);
  const [liveReward, setLiveReward] = useState<LiveRewardConfig>(() => createDefaultLiveReward());
  const [problemBoardConfig, setProblemBoardConfig] = useState<ProblemBoardConfig>(() => createDefaultProblemBoardConfig());

  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    queueMicrotask(() => {
      setLiveReward(loadStoredLiveReward());
      setProblemBoardConfig(loadStoredProblemBoardConfig());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    const syncLeaderboard = async () => {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { leaderboard?: LeaderboardEntry[] };
      if (Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    };

    void syncLeaderboard();
  }, [user.xp, user.currentStreak, user.solvedProblemIds.length]);

  useEffect(() => {
    if (!isLoaded) return;

    const syncUser = async () => {
      if (!isSignedIn) {
        setUser(INITIAL_USER);
        setIsUserSynced(true);
        return;
      }

      const response = await fetch("/api/me", { cache: "no-store" });
      if (!response.ok) {
        setIsUserSynced(true);
        return;
      }

      const data = (await response.json()) as { user?: DbUserSnapshot | null };
      if (data.user) {
        setUser(dbUserToState(data.user));
      } else if (clerkUser) {
        setUser((current) => ({
          ...current,
          username: clerkUser.username || current.username,
          fullName:
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
            current.fullName,
          email: clerkUser.primaryEmailAddress?.emailAddress || current.email,
          avatarUrl: clerkUser.imageUrl || current.avatarUrl,
          authProvider: "email",
        }));
      }
      setIsUserSynced(true);
    };

    void syncUser();
  }, [clerkUser, isLoaded, isSignedIn]);

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
        isAuthenticated: isSignedIn || user.authProvider !== "guest",
        isUserSynced,
        solvedCount: user.solvedProblemIds.length,
        isProblemSolved,
        buyStreakShield,
        upgradeToPro,
        solveProblem,
        saveLiveReward,
        saveProblemBoardConfig,
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
