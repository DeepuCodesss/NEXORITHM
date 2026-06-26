import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Gift, Home, Trophy } from "lucide-react";
import { getPrisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";

export type ProfilePayload = {
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  solvedCount: number;
  globalRank: number | null;
  college: string;
  joinedDate: string;
  isPro: boolean;
  recentActivity: Array<{
    id: string;
    status: string;
    problemTitle: string;
    problemSlug: string;
    difficulty: string;
    language: string;
    createdAt: string;
    xpEarned: number;
  }>;
  heatmap: Record<string, { count: number; xp: number; languages: string[] }>;
  langDist: Array<{ lang: string; pct: number; count: number; color: string }>;
  submissionStats: {
    accepted: number;
    wrongAnswer: number;
    runtimeError: number;
    compileError: number;
    acceptanceRate: number;
    totalAttempts: number;
    problemsAttempted: number;
    averageAttempts: number;
    averageRuntime: number;
  };
  collegeRank: number | null;
  monthlyProgress: {
    accepted: number;
    xp: number;
    coins: number;
    solved: number;
  };
  streakCalendar: Array<{ dayName: string; solved: boolean; dateStr: string }>;
  hasSolvedToday: boolean;
  weeklyGoal: { solvedDays: number; targetDays: number };
  journeyTimeline: Array<{
    id: string;
    title: string;
    unlocked: boolean;
    date: string | null;
    icon: string;
  }>;
};

type PageProps = { params: Promise<{ username: string }> };

const buildProfile = async (username: string): Promise<ProfilePayload | null> => {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      xp: true,
      coins: true,
      currentStreak: true,
      longestStreak: true,
      solvedProblemIds: true,
      college: true,
      createdAt: true,
      isPro: true,
    },
  });

  if (!user) return null;

  // 1. Fetch user's submissions
  const dbSubmissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      language: true,
      runtimeMs: true,
      createdAt: true,
      problem: { select: { title: true, slug: true, difficulty: true } },
    },
  });

  const submissions = dbSubmissions as Array<{
    id: string;
    status: string;
    language: string;
    runtimeMs: number;
    createdAt: Date;
    problem: { title: string; slug: string; difficulty: string };
  }>;

  // 2. Global & College Rank calculation
  const ranked = await prisma.user.findMany({
    select: { id: true, xp: true, college: true, solvedProblemIds: true, lastSolvedAt: true, updatedAt: true },
  });

  const solvedProblemIds = Array.isArray(user.solvedProblemIds)
    ? user.solvedProblemIds.filter((v): v is string => typeof v === "string")
    : [];

  const sortedLeaderboard = ranked
    .map((e) => ({
      ...e,
      sc: Array.isArray(e.solvedProblemIds) ? e.solvedProblemIds.length : 0,
      ls: e.lastSolvedAt ? new Date(e.lastSolvedAt).getTime() : 0,
    }))
    .sort(
      (a, b) =>
        b.xp - a.xp ||
        b.sc - a.sc ||
        a.ls - b.ls ||
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

  const globalRankIndex = sortedLeaderboard.findIndex((e) => e.id === user.id);
  const globalRank = solvedProblemIds.length > 0 ? globalRankIndex + 1 : null;

  let collegeRank: number | null = null;
  if (user.college && !user.college.includes("Connect")) {
    const collegeUsers = sortedLeaderboard.filter((u) => u.college === user.college);
    const indexInCollege = collegeUsers.findIndex((e) => e.id === user.id);
    collegeRank = indexInCollege !== -1 ? indexInCollege + 1 : null;
  }

  // 3. Heatmap Calculation (All time for dynamic monthly view)
  const heatmap: Record<string, { count: number; xp: number; languages: string[] }> = {};
  const acceptedSubmissions = submissions.filter((s) => s.status === "Accepted");
  
  for (const sub of acceptedSubmissions) {
    const key = sub.createdAt.toISOString().slice(0, 10);
    if (!heatmap[key]) {
      heatmap[key] = { count: 0, xp: 0, languages: [] };
    }
    heatmap[key].count += 1;
    heatmap[key].xp += 10;
    if (!heatmap[key].languages.includes(sub.language)) {
      heatmap[key].languages.push(sub.language);
    }
  }

  // 4. Language Distribution
  const langMap: Record<string, number> = {};
  for (const sub of submissions) {
    langMap[sub.language] = (langMap[sub.language] ?? 0) + 1;
  }
  const totalSubs = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
  const langColors: Record<string, string> = {
    javascript: "#F59E0B",
    typescript: "#38BDF8",
    python: "#22C55E",
    "c++": "#A78BFA",
    java: "#FB923C",
    c: "#94A3B8",
    rust: "#F97316",
    go: "#06B6D4",
  };
  const langDist = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      lang: lang.charAt(0).toUpperCase() + lang.slice(1),
      pct: Math.round((count / totalSubs) * 100),
      count,
      color: langColors[lang.toLowerCase()] ?? "#8B5CF6",
    }));

  // 5. Submission Stats
  const accepted = acceptedSubmissions.length;
  const wrongAnswer = submissions.filter((s) => s.status === "Wrong Answer").length;
  const runtimeError = submissions.filter((s) => s.status === "Runtime Error").length;
  const compileError = submissions.filter((s) => s.status === "Compilation Error").length;
  const totalAttempts = submissions.length;
  const acceptanceRate = totalAttempts > 0 ? Math.round((accepted / totalAttempts) * 100) : 0;
  
  const uniqueAttemptedSlugs = new Set(submissions.map(s => s.problem.slug));
  const problemsAttempted = uniqueAttemptedSlugs.size;
  const averageAttempts = problemsAttempted > 0 ? Math.round((totalAttempts / problemsAttempted) * 10) / 10 : 0;
  
  const runtimes = acceptedSubmissions.map(s => s.runtimeMs).filter(r => r > 0);
  const averageRuntime = runtimes.length > 0 ? Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length) : 0;

  // 6. Monthly Progress (Last 30 Days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlySubmissions = submissions.filter((s) => s.createdAt >= thirtyDaysAgo);
  const monthlyAccepted = monthlySubmissions.filter((s) => s.status === "Accepted").length;

  const monthlyTransactions = await prisma.rewardTransaction.findMany({
    where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
    select: { amount: true },
  });
  const monthlyCoins = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);
  const monthlyXP = monthlySubmissions.reduce((acc, s) => acc + (s.status === "Accepted" ? 10 : 5), 0);

  // 7. Streak Calendar (Last 7 Days) & Weekly Goal
  const streakCalendar = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = daysOfWeek[d.getDay()];
    const solved = acceptedSubmissions.some(
      (s) => s.createdAt.toISOString().slice(0, 10) === dateStr
    );
    streakCalendar.push({ dayName, solved, dateStr });
  }

  const todayStr = now.toISOString().slice(0, 10);
  const hasSolvedToday = acceptedSubmissions.some(
    (s) => s.createdAt.toISOString().slice(0, 10) === todayStr
  );

  // Calculate Weekly Goal (days solved this week, assuming week starts on Monday)
  let solvedDaysThisWeek = 0;
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const uniqueDaysSolvedThisWeek = new Set(
    acceptedSubmissions
      .filter((s) => s.createdAt >= startOfWeek)
      .map((s) => s.createdAt.toISOString().slice(0, 10))
  );
  solvedDaysThisWeek = uniqueDaysSolvedThisWeek.size;

  // 8. Journey Timeline
  const firstAccepted = [...acceptedSubmissions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  // firstContest logic reserved for future use
  const firstBadge = false; // Add real logic when badges exist

  const journeyTimeline = [
    {
      id: "joined",
      title: "Joined Nexorithm",
      unlocked: true,
      date: user.createdAt.toISOString(),
      icon: "UserPlus",
    },
    {
      id: "first_solve",
      title: "First Accepted Solution",
      unlocked: !!firstAccepted,
      date: firstAccepted ? firstAccepted.createdAt.toISOString() : null,
      icon: "CheckCircle",
    },
    {
      id: "xp_100",
      title: "100 XP Milestone",
      unlocked: user.xp >= 100,
      date: null,
      icon: "Zap",
    },
    {
      id: "streak_7",
      title: "7-Day Streak",
      unlocked: user.longestStreak >= 7,
      date: null,
      icon: "Flame",
    },
    {
      id: "xp_500",
      title: "500 XP Milestone",
      unlocked: user.xp >= 500,
      date: null,
      icon: "Star",
    },
    {
      id: "first_badge",
      title: "Earned First Badge",
      unlocked: firstBadge,
      date: null,
      icon: "Award",
    },
    {
      id: "xp_1000",
      title: "1000 XP Milestone",
      unlocked: user.xp >= 1000,
      date: null,
      icon: "Crown",
    },
  ];

  return {
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    coins: user.coins,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    solvedCount: solvedProblemIds.length,
    globalRank,
    college: user.college,
    joinedDate: user.createdAt.toISOString(),
    isPro: user.isPro,
    recentActivity: submissions.map((s) => ({
      id: s.id,
      status: s.status,
      problemTitle: s.problem.title,
      problemSlug: s.problem.slug,
      difficulty: s.problem.difficulty,
      language: s.language,
      createdAt: s.createdAt.toISOString(),
      xpEarned: s.status === "Accepted" ? 10 : 5,
    })),
    heatmap,
    langDist,
    submissionStats: {
      accepted,
      wrongAnswer,
      runtimeError,
      compileError,
      acceptanceRate,
      totalAttempts,
      problemsAttempted,
      averageAttempts,
      averageRuntime,
    },
    collegeRank,
    monthlyProgress: {
      accepted: monthlyAccepted,
      xp: monthlyXP,
      coins: monthlyCoins,
      solved: monthlyAccepted,
    },
    streakCalendar,
    hasSolvedToday,
    weeklyGoal: {
      solvedDays: solvedDaysThisWeek,
      targetDays: 7,
    },
    journeyTimeline,
  };
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const profile = await buildProfile(username);
  if (!profile) return { title: "Profile not found | Nexorithm" };
  return {
    title: `${profile.fullName} (@${profile.username}) | Nexorithm`,
    description: `View ${profile.fullName}'s Nexorithm profile.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await buildProfile(username);
  if (!profile) notFound();

  const clerkUser = await currentUser();
  const isOwner = clerkUser ? clerkUser.username === username || clerkUser.id === profile.username : false;

  const navItems = [
    { label: "Overview", href: `/profile/${profile.username}`, icon: Home, active: true },
    { label: "Problems", href: "/problems", icon: BookOpen, active: false },
    { label: "Rankings", href: "/rankings", icon: Trophy, active: false },
    { label: "Rewards", href: "/rewards", icon: Gift, active: false },
  ];

  return (
    <div className="flex bg-[#0F1117]" style={{ height: "calc(100vh - 3.5rem)", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[196px] shrink-0 border-r border-[#2A3242] py-3 px-2 gap-1 select-none">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-xs font-semibold transition-all ${item.active ? "bg-[#7C3AED] text-white shadow-lg" : "text-[#94A3B8] hover:bg-[#1C2230] hover:text-white"}`}>
                <Icon className="h-3.5 w-3.5" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto mx-0.5 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🚀</span>
            <p className="text-[10px] font-bold text-[#A78BFA]">Upgrade to Pro</p>
          </div>
          <p className="text-[9px] text-[#64748B] leading-relaxed mb-2">Unlock advanced analytics, custom badges, and more exciting features!</p>
          <Link href="/pro" className="flex items-center justify-center gap-1 rounded-lg bg-[#7C3AED] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#6D28D9] transition-all">
            Upgrade Now →
          </Link>
        </div>
        <div className="mx-0.5 rounded-xl border border-[#2A3242] bg-[#161B22] p-3 mt-1">
          <p className="text-[9px] font-bold text-[#94A3B8] mb-1">⚡ Nexorithm is in Beta</p>
          <p className="text-[9px] text-[#64748B] leading-relaxed mb-2">Your feedback helps us build a better platform for coders.</p>
          <button className="text-[9px] text-[#7C3AED] hover:underline">Share Feedback →</button>
        </div>
      </aside>

      {/* Main interactive area */}
      <ProfileClient profile={profile} isOwner={isOwner} />
    </div>
  );
}
