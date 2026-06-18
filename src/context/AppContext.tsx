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

const createDefaultProblemBoardConfig = (): ProblemBoardConfig => ({
  showUpcomingRewards: true,
  upcomingRewardItems: [
    { problemId: MOCK_PROBLEMS[1]?.id ?? "" },
    { problemId: MOCK_PROBLEMS[2]?.id ?? "" },
    { problemId: MOCK_PROBLEMS[3]?.id ?? "" },
  ],
});

interface AppContextType {
  user: UserState;
  problems: Problem[];
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  liveReward: LiveRewardConfig | null;
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
  moneyEarnedInr: Math.max(0, dbUser.moneyEarnedInr ?? INITIAL_USER.moneyEarnedInr),
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
  const [isUserSynced, setIsUserSynced] = useState(false);
  const [liveReward, setLiveReward] = useState<LiveRewardConfig | null>(null);
  const [problemBoardConfig, setProblemBoardConfig] = useState<ProblemBoardConfig>(() => createDefaultProblemBoardConfig());

  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [missions] = useState<Mission[]>(MOCK_MISSIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    const syncLiveReward = async () => {
      const response = await fetch("/api/live-reward", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { liveReward?: LiveRewardConfig | null } };
      setLiveReward(payload.data?.liveReward ?? null);
    };

    void syncLiveReward();
  }, []);

  useEffect(() => {
    const syncProblemBoardConfig = async () => {
      const response = await fetch("/api/problem-board-config", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { problemBoardConfig?: ProblemBoardConfig | null } };
      if (payload.data?.problemBoardConfig) {
        setProblemBoardConfig(payload.data.problemBoardConfig);
      }
    };

    void syncProblemBoardConfig();
  }, []);

  useEffect(() => {
    const syncLeaderboard = async () => {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { leaderboard?: LeaderboardEntry[] } };
      if (Array.isArray(payload.data?.leaderboard)) {
        setLeaderboard(payload.data.leaderboard);
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

      const payload = (await response.json()) as { success?: boolean; data?: { user?: DbUserSnapshot | null } };
      if (payload.data?.user) {
        setUser(dbUserToState(payload.data.user));
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

  const buyStreakShield = (): boolean => {
    return false;
  };

  const upgradeToPro = () => undefined;

  const isProblemSolved = (problemId: string) => user.solvedProblemIds.includes(problemId);

  const signOut = () => undefined;

  const solveProblem = (problemId: string): SolveRewardResult => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return emptyReward();

    const alreadySolved = isProblemSolved(problemId);
    if (alreadySolved) {
      return {
        ...emptyReward(),
        alreadySolved: true,
      };
    }

    const xpGained = problem.xpReward;
    const coinsGained = problem.coinReward;
    const liveRewardActive =
      liveReward?.isActive &&
      liveReward.problemId === problemId &&
      new Date(liveReward.startsAt).getTime() <= Date.now() &&
      new Date(liveReward.endsAt).getTime() > Date.now();
    const moneyGainedInr = liveRewardActive ? liveReward.rewardMoneyInr : 0;
    const reputationGained = Math.max(5, Math.floor(xpGained / 10));
    const nextXp = user.xp + xpGained;
    const nextStreak = Math.max(user.currentStreak, 1);
    const nextLevel = Math.max(1, Math.floor(nextXp / 200) + 1);
    const currentLevel = Math.max(1, Math.floor(user.xp / 200) + 1);

    setUser((current) => ({
      ...current,
      xp: current.xp + xpGained,
      coins: current.coins + coinsGained,
      moneyEarnedInr: current.moneyEarnedInr + moneyGainedInr,
      reputation: current.reputation + reputationGained,
      devRank: Math.floor((current.xp + xpGained) / 200),
      currentStreak: nextStreak,
      longestStreak: Math.max(current.longestStreak, nextStreak),
      solvedProblemIds: [...current.solvedProblemIds, problemId],
    }));

    return {
      awarded: true,
      alreadySolved: false,
      xpGained,
      coinsGained,
      moneyGainedInr,
      reputationGained,
      currentStreak: nextStreak,
      previousStreak: user.currentStreak,
      levelBefore: currentLevel,
      levelAfter: nextLevel,
      unlockedTitle: problem.title,
    };
  };

  const saveLiveReward = (config: LiveRewardConfig) => {
    void (async () => {
      const response = await fetch("/api/admin/live-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          rewardMoney: Math.max(0, Math.round(Number(config.rewardMoneyInr) || 0)),
        }),
      });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { liveReward?: LiveRewardConfig | null } };
      setLiveReward(payload.data?.liveReward ?? null);
    })();
  };

  const saveProblemBoardConfig = (config: ProblemBoardConfig) => {
    void (async () => {
      const response = await fetch("/api/admin/problem-board-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showUpcomingRewards: config.showUpcomingRewards,
          upcomingRewardItems: config.upcomingRewardItems.slice(0, 3),
        }),
      });
      if (!response.ok) return;
      setProblemBoardConfig({
        showUpcomingRewards: config.showUpcomingRewards,
        upcomingRewardItems: config.upcomingRewardItems.slice(0, 3).map((item) => ({
          problemId: item.problemId,
        })),
      });
    })();
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
