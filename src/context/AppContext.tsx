"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

const USER_STORAGE_KEY = "nexorithm-user-state";

const loadStoredUser = (): UserState => {
  if (typeof window === "undefined") return INITIAL_USER;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
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

interface AppContextType {
  user: UserState;
  problems: Problem[];
  missions: Mission[];
  leaderboard: LeaderboardEntry[];
  isPro: boolean;
  solvedCount: number;
  isProblemSolved: (problemId: string) => boolean;
  buyStreakShield: () => boolean;
  upgradeToPro: () => void;
  solveProblem: (problemId: string) => SolveRewardResult;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const emptyReward = (): SolveRewardResult => ({
  awarded: false,
  alreadySolved: false,
  xpGained: 0,
  coinsGained: 0,
  reputationGained: 0,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [hydrated, setHydrated] = useState(false);

  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
  const [leaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    setUser(loadStoredUser());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }, [user, hydrated]);

  const buyStreakShield = (): boolean => {
    return false;
  };

  const upgradeToPro = () => undefined;

  const isProblemSolved = (problemId: string) => user.solvedProblemIds.includes(problemId);

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
        solvedCount: user.solvedProblemIds.length,
        isProblemSolved,
        buyStreakShield,
        upgradeToPro,
        solveProblem,
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
