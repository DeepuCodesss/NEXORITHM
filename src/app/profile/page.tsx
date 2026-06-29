import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { BookOpen, Gift, Home, Trophy } from "lucide-react";
import ProfileClient from "./[username]/ProfileClient";
import type { ProfilePayload } from "./[username]/page";

const GUEST_PROFILE: ProfilePayload = {
  username: "guest",
  fullName: "Guest",
  avatarUrl: "/default-avatar.svg",
  avatarMode: "image",
  avatarTheme: "avatar-1",
  xp: 0,
  level: 1,
  coins: 0,
  currentStreak: 0,
  longestStreak: 0,
  solvedCount: 0,
  globalRank: null,
  college: "Guest Access",
  joinedDate: new Date("2026-06-01").toISOString(),
  isPro: false,
  bio: "Login to create your own profile and start your coding journey.",
  website: "",
  github: "",
  linkedin: "",
  twitter: "",
  reputation: 0,
  showcaseBadges: "",
  earnedBadgeIds: [],
  recentActivity: [],
  heatmap: {},
  langDist: [],
  submissionStats: {
    accepted: 0,
    wrongAnswer: 0,
    runtimeError: 0,
    compileError: 0,
    acceptanceRate: 0,
    totalAttempts: 0,
    problemsAttempted: 0,
    averageAttempts: 0,
    averageRuntime: 0,
  },
  collegeRank: null,
  monthlyProgress: {
    accepted: 0,
    xp: 0,
    coins: 0,
    solved: 0,
  },
  streakCalendar: [
    { dayName: "Mon", solved: false, dateStr: "2026-06-22" },
    { dayName: "Tue", solved: false, dateStr: "2026-06-23" },
    { dayName: "Wed", solved: false, dateStr: "2026-06-24" },
    { dayName: "Thu", solved: false, dateStr: "2026-06-25" },
    { dayName: "Fri", solved: false, dateStr: "2026-06-26" },
    { dayName: "Sat", solved: false, dateStr: "2026-06-27" },
    { dayName: "Sun", solved: false, dateStr: "2026-06-28" },
  ],
  hasSolvedToday: false,
  weeklyGoal: { solvedDays: 0, targetDays: 7 },
  journeyTimeline: [
    { id: "joined", title: "Joined Nexorithm", unlocked: true, date: null, icon: "UserPlus" },
    { id: "first_solve", title: "First Accepted Solution", unlocked: false, date: null, icon: "CheckCircle" },
    { id: "xp_100", title: "100 XP Milestone", unlocked: false, date: null, icon: "Zap" },
    { id: "streak_7", title: "7-Day Streak", unlocked: false, date: null, icon: "Flame" },
    { id: "xp_500", title: "500 XP Milestone", unlocked: false, date: null, icon: "Star" },
    { id: "first_badge", title: "Earned First Badge", unlocked: false, date: null, icon: "Award" },
    { id: "xp_1000", title: "1000 XP Milestone", unlocked: false, date: null, icon: "Crown" },
  ],
};

export default async function ProfileHomePage() {
  const clerkUser = await currentUser();

  if (clerkUser?.username) {
    redirect(`/profile/${clerkUser.username}`);
  }

  const navItems = [
    { label: "Overview", href: "/profile", icon: Home, active: true },
    { label: "Problems", href: "/problems", icon: BookOpen, active: false },
    { label: "Rankings", href: "/rankings", icon: Trophy, active: false },
    { label: "Rewards", href: "/rewards", icon: Gift, active: false },
  ];

  return (
    <div className="flex bg-[#0F1117] min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden lg:flex flex-col w-[196px] shrink-0 border-r border-[#2A3242] py-3 px-2 gap-1 select-none sticky top-[3.5rem] h-[calc(100vh-3.5rem)]">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-all ${item.active ? "bg-[#7C3AED] text-white shadow-lg" : "text-[#94A3B8] hover:bg-[#1C2230] hover:text-white"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <ProfileClient profile={GUEST_PROFILE} isOwner={false} />
      </div>
    </div>
  );
}
