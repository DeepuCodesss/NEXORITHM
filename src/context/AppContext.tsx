"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import type {
  UserState,
  ProblemSummary,
  Mission,
} from "@/lib/mockData";
import { INITIAL_USER, MOCK_MISSIONS } from "@/lib/appData";

export interface LiveRewardConfig {
  problemId: string;
  rewardMoneyInr: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  paidAt?: string | null;
  winnerUserId?: string | null;
  winnerSubmissionId?: string | null;
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
  upcomingRewardItems: [],
});

interface AppContextType {
  user: UserState;
  problems: ProblemSummary[];
  missions: Mission[];
  liveReward: LiveRewardConfig | null;
  problemBoardConfig: ProblemBoardConfig;
  isPro: boolean;
  isAuthenticated: boolean;
  isUserSynced: boolean;
  refreshUser: () => Promise<void>;
  solvedCount: number;
  isProblemSolved: (problemId: string) => boolean;
  saveLiveReward: (config: LiveRewardConfig) => void;
  announceLiveRewardResults: () => void;
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
  lastSolvedAt?: string | null;
  streakShields: number;
  isPro: boolean;
  solvedProblemIds: unknown;
  bio?: string;
  graduationYear?: string;
  country?: string;
  preferredLanguage?: string;
  publicProfile?: boolean;
  showCollege?: boolean;
  showStats?: boolean;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  avatarMode?: string;
  avatarTheme?: string;
  showcaseBadges?: string;
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
  lastSolvedAt: dbUser.lastSolvedAt ?? null,
  streakShields: dbUser.streakShields ?? INITIAL_USER.streakShields,
  isPro: dbUser.isPro ?? INITIAL_USER.isPro,
  solvedProblemIds: Array.isArray(dbUser.solvedProblemIds)
    ? dbUser.solvedProblemIds.filter((value): value is string => typeof value === "string")
    : [],
  bio: dbUser.bio || "",
  graduationYear: dbUser.graduationYear || "",
  country: dbUser.country || "",
  preferredLanguage: dbUser.preferredLanguage || "C++",
  publicProfile: dbUser.publicProfile !== false,
  showCollege: dbUser.showCollege !== false,
  showStats: dbUser.showStats !== false,
  showcaseBadges: dbUser.showcaseBadges || "",
  website: dbUser.website || "",
  github: dbUser.github || "",
  linkedin: dbUser.linkedin || "",
  twitter: dbUser.twitter || "",
  avatarMode: dbUser.avatarMode || "image",
  avatarTheme: dbUser.avatarTheme || "violet",
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const pathname = usePathname();
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [isUserSynced, setIsUserSynced] = useState(false);
  const [liveReward, setLiveReward] = useState<LiveRewardConfig | null>(null);
  const [problemBoardConfig, setProblemBoardConfig] = useState<ProblemBoardConfig>(() => createDefaultProblemBoardConfig());

  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [missions] = useState<Mission[]>(MOCK_MISSIONS);

  const catalogSize = pathname === "/problems" ? 4500 : pathname.startsWith("/admin") || pathname === "/rewards" || pathname === "/badges" ? 80 : 1;

  useEffect(() => {
    const syncProblems = async () => {
      const response = await fetch(`/api/problems?page=1&pageSize=${catalogSize}`, { cache: "force-cache" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { problems?: ProblemSummary[] } };
      if (Array.isArray(payload.data?.problems)) setProblems(payload.data.problems);
    };

    void syncProblems();
  }, [catalogSize]);

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
    if (!pathname.startsWith("/problems") && !pathname.startsWith("/admin")) return;

    const syncProblemBoardConfig = async () => {
      const response = await fetch("/api/problem-board-config", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { problemBoardConfig?: ProblemBoardConfig | null } };
      if (payload.data?.problemBoardConfig) {
        setProblemBoardConfig(payload.data.problemBoardConfig);
      }
    };

    void syncProblemBoardConfig();
  }, [pathname]);

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

  const isProblemSolved = (problemId: string) => user.solvedProblemIds.includes(problemId);

  const refreshUser = async () => {
    if (!isLoaded || !isSignedIn) {
      setUser(INITIAL_USER);
      setIsUserSynced(true);
      return;
    }

    const response = await fetch("/api/me", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: { user?: DbUserSnapshot | null } };
    if (payload.data?.user) setUser(dbUserToState(payload.data.user));
    setIsUserSynced(true);
  };

  const signOut = () => {
    setUser(INITIAL_USER);
    void clerkSignOut();
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

  const announceLiveRewardResults = () => {
    void (async () => {
      const response = await fetch("/api/admin/live-reward", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announceResultsNow: true }),
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
        liveReward,
        problemBoardConfig,
        isPro: user.isPro,
        isAuthenticated: isSignedIn || user.authProvider !== "guest",
        isUserSynced,
        refreshUser,
        solvedCount: user.solvedProblemIds.length,
        isProblemSolved,
        saveLiveReward,
        announceLiveRewardResults,
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
