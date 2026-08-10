import type { Mission, UserState } from "@/lib/mockData";

export const INITIAL_USER: UserState = {
  fullName: "",
  username: "guest",
  email: "",
  avatarUrl: "/default-avatar.svg",
  authProvider: "guest",
  xp: 0,
  coins: 0,
  moneyEarnedInr: 0,
  reputation: 0,
  devRank: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSolvedAt: null,
  streakShields: 0,
  isPro: false,
  college: "",
  solvedProblemIds: [],
  avatarMode: "image",
  avatarTheme: "violet",
  showcaseBadges: "",
};

export const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "First Real Submission",
    description: "Connect the judge API, then complete your first verified submission.",
    xpReward: 100,
    coinReward: 20,
    targetCount: 1,
    currentCount: 0,
    type: "Daily",
  },
  {
    id: "m2",
    title: "Profile Setup",
    description: "Connect Clerk and complete the developer profile fields.",
    xpReward: 50,
    coinReward: 10,
    targetCount: 1,
    currentCount: 0,
    type: "Weekly",
  },
];
