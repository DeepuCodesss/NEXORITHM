import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { BookOpen, Gift, Home, Target, Trophy, Zap, Calendar, Globe } from "lucide-react";
import { getPrisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";

export type ProfilePayload = {
  username: string;
  fullName: string;
  avatarUrl: string;
  avatarMode: string;
  avatarTheme: string;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  solvedCount: number;
  globalRank: number | null;
  college: string;
  joinedDate: string;
  isPro: boolean;
  bio: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  reputation: number;
  showcaseBadges: string;
  earnedBadgeIds: string[];
  recentActivity: Array<{
    id: string;
    status: string;
    problemTitle: string;
    problemSlug: string;
    difficulty: string;
    language: string;
    runtimeMs: number;
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
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        avatarMode: true,
        avatarTheme: true,
        xp: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        solvedProblemIds: true,
        college: true,
        createdAt: true,
        isPro: true,
        bio: true,
        website: true,
        github: true,
        linkedin: true,
        twitter: true,
        reputation: true,
        showcaseBadges: true,
      },
    });
  } catch (err) {
    console.error("Failed to load profile user:", err);
    return null;
  }

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

  const level = Math.floor(user.xp / 100) + 1;

  // Evaluate earned badges dynamically
  const earnedBadgeIds: string[] = [];
  const solvedCount = solvedProblemIds.length;
  const maxStreak = user.longestStreak;
  const currentXp = user.xp;
  const reputation = user.reputation;

  if (solvedCount >= 1) earnedBadgeIds.push('first_code');
  if (solvedCount >= 10) earnedBadgeIds.push('getting_started');
  if (solvedCount >= 50) earnedBadgeIds.push('problem_solver');
  if (solvedCount >= 100) earnedBadgeIds.push('code_warrior');

  if (maxStreak >= 3) earnedBadgeIds.push('streak_starter');
  if (maxStreak >= 7) earnedBadgeIds.push('on_fire');
  if (maxStreak >= 30) earnedBadgeIds.push('blazing_streak');

  if (currentXp >= 100) earnedBadgeIds.push('rising_star');
  if (currentXp >= 1000) earnedBadgeIds.push('legend');

  if (reputation >= 10) earnedBadgeIds.push('contest_player');
  if (reputation >= 50) earnedBadgeIds.push('top_performer');
  if (reputation >= 150) earnedBadgeIds.push('star_performer');
  if (reputation >= 500) earnedBadgeIds.push('champion');

  const mediumSolvedCount = await prisma.problem.count({
    where: {
      id: { in: solvedProblemIds },
      difficulty: { equals: "Medium", mode: "insensitive" }
    }
  });
  if (mediumSolvedCount >= 100) earnedBadgeIds.push('algorithm_master');
  if (mediumSolvedCount >= 200) earnedBadgeIds.push('logic_sage');
  if (mediumSolvedCount >= 500) earnedBadgeIds.push('problem_dominator');

  if (solvedCount >= 10 && reputation >= 20) earnedBadgeIds.push('speed_coder');
  if (solvedCount >= 50 && reputation >= 100) earnedBadgeIds.push('quick_thinker');
  if (solvedCount >= 100 && reputation >= 300) earnedBadgeIds.push('accuracy_pro');

  if (maxStreak >= 7) earnedBadgeIds.push('consistent_coder');
  if (maxStreak >= 30) earnedBadgeIds.push('unstoppable');

  return {
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    avatarMode: user.avatarMode,
    avatarTheme: user.avatarTheme,
    xp: user.xp,
    level,
    coins: user.coins,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    solvedCount: solvedProblemIds.length,
    globalRank,
    college: user.college,
    joinedDate: user.createdAt.toISOString(),
    isPro: user.isPro,
    bio: user.bio || "",
    website: user.website || "",
    github: user.github || "",
    linkedin: user.linkedin || "",
    twitter: user.twitter || "",
    reputation,
    showcaseBadges: user.showcaseBadges || "",
    earnedBadgeIds,
    recentActivity: submissions.map((s) => ({
      id: s.id,
      status: s.status,
      problemTitle: s.problem.title,
      problemSlug: s.problem.slug,
      difficulty: s.problem.difficulty,
      language: s.language,
      runtimeMs: s.runtimeMs,
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
  const clerkUser = await currentUser();

  if (username === "guest" && !clerkUser) {
    return (
      <div className="flex bg-[#0F1117] min-h-[calc(100vh-3.5rem)]">
        <aside className="hidden lg:flex flex-col w-[196px] shrink-0 border-r border-[#2A3242] py-3 px-2 gap-1 select-none sticky top-[3.5rem] h-[calc(100vh-3.5rem)]">
          <nav className="flex flex-col gap-0.5">
            {[
              { label: "Overview", href: "/profile/guest", icon: Home, active: true },
              { label: "Problems", href: "/problems", icon: BookOpen, active: false },
              { label: "Rankings", href: "/rankings", icon: Trophy, active: false },
              { label: "Rewards", href: "/rewards", icon: Gift, active: false },
            ].map((item) => {
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

        <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-[#1E2736] bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_30%),linear-gradient(180deg,#111827,#0B0D12)] px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/35 via-[#A78BFA]/20 to-[#22C55E]/10 text-[#C084FC] shadow-[0_0_30px_rgba(124,58,237,0.18)]">
                    <Trophy className="h-11 w-11" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C084FC]">
                      Guest Profile
                    </div>
                    <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Guest Explorer</h1>
                    <p className="mt-1 text-[14px] font-mono text-[#A78BFA]">@guest</p>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#94A3B8] sm:text-base">
                      Explore the platform, then sign in to create your own profile, save progress, unlock rewards, and compete on the leaderboard.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SignInButton mode="modal">
                    <button type="button" className="btn-primary h-11 px-5 text-sm font-bold">
                      Login to create your own profile
                    </button>
                  </SignInButton>
                  <Link href="/problems" className="btn-secondary h-11 px-5 text-sm font-bold">
                    Browse Problems
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
                <span className="flex items-center gap-2 text-white font-semibold"><BookOpen className="h-4 w-4 text-[#60A5FA]" /> 0 Solved</span>
                <span className="flex items-center gap-2 text-white font-semibold"><Target className="h-4 w-4 text-[#22C55E]" /> Level 0</span>
                <span className="flex items-center gap-2 text-white font-semibold"><Zap className="h-4 w-4 text-[#F59E0B]" /> 0 XP</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#64748B]" /> Joined as guest</span>
                <span className="flex items-center gap-2 text-[#A78BFA] font-bold"><Globe className="h-4 w-4 text-[#7C3AED]" /> Guest Access</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Solved", value: "0", accent: "text-[#22C55E]" },
                  { label: "XP", value: "0", accent: "text-[#A78BFA]" },
                  { label: "Rank", value: "—", accent: "text-[#FBBF24]" },
                  { label: "Coins", value: "0", accent: "text-[#F59E0B]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#1E2736] bg-[#0B0D12] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">{item.label}</div>
                    <div className={`mt-2 text-3xl font-black ${item.accent}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#1E2736] bg-[#111827] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Level 0</h2>
                <span className="text-xs font-medium text-[#64748B]">0/100 XP</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#1C2230]">
                <div className="h-full w-0 rounded-full bg-[#7C3AED]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: "Next Reward", value: "Profile Border" },
                  { label: "Global Rank", value: "—" },
                  { label: "Streak", value: "0 Day" },
                  { label: "Longest", value: "0 Days" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#1E2736] bg-[#0B0D12] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">{item.label}</div>
                    <div className="mt-2 text-sm font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-[#1E2736] bg-[#111827] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Activity</h2>
                <span className="text-xs font-mono text-[#64748B]">Guest view</span>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  { title: "First solve", body: "Sign in to unlock your first accepted solution." },
                  { title: "Streak", body: "Build a daily solving streak and keep it alive." },
                  { title: "Contest entry", body: "Join contests and earn profile achievements." },
                  { title: "Rewards", body: "Complete problems to earn XP, coins, and cash." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#1E2736] bg-[#0B0D12] p-4">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#1E2736] bg-[#111827] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Unlocks</h2>
                <span className="text-xs font-medium text-[#64748B]">Login to create your own profile</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Personalized avatar, streaks, and profile stats",
                  "Saved submissions and solution history",
                  "Rank position, badges, and earned rewards",
                  "Contest participation and profile showcase",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#1E2736] bg-[#0B0D12] p-4">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/15 text-[#C084FC]">
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm leading-6 text-[#D1D5DB]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = await buildProfile(username);
  if (!profile) notFound();
  const isOwner = clerkUser ? clerkUser.username === username || clerkUser.id === profile.username : false;

  if (!clerkUser) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0F1117] px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-[#1E2736] bg-[#111827] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[#C084FC]">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sign in to view profiles</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94A3B8]">
            Profile pages are available to signed-in members only.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SignInButton mode="modal">
              <button type="button" className="btn-primary h-11 px-5 text-sm font-bold">
                Sign In
              </button>
            </SignInButton>
            <Link href="/problems" className="btn-secondary h-11 px-5 text-sm font-bold">
              Browse Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: `/profile/${profile.username}`, icon: Home, active: true },
    { label: "Problems", href: "/problems", icon: BookOpen, active: false },
    { label: "Rankings", href: "/rankings", icon: Trophy, active: false },
    { label: "Rewards", href: "/rewards", icon: Gift, active: false },
  ];

  return (
    <div className="flex bg-[#0F1117] min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[196px] shrink-0 border-r border-[#2A3242] py-3 px-2 gap-1 select-none sticky top-[3.5rem] h-[calc(100vh-3.5rem)]">
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
        {profile.hasSolvedToday ? (
          <div className="mt-auto mx-0.5 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-2 transition-all flex flex-col items-center justify-center gap-0.5 text-center">
             <div className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1">
               ✓ Mission Complete
             </div>
             <span className="text-[9px] text-[#64748B]">Next mission in 16h</span>
          </div>
        ) : (
          <div className="mt-auto mx-0.5 rounded-xl border border-[#2A3242] bg-[#12161F] p-3 transition-all hover:border-[#22C55E]/40 group/mission relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#22C55E]/5 blur-2xl rounded-full" />
            <div className="flex items-center justify-between mb-1 relative z-10">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-base">🎯</span> Daily Mission
              </span>
            </div>
            <p className="text-[10px] text-white font-medium mb-2 relative z-10 mt-1.5">Solve 1 problem today</p>
            <Link href="/problems" className="flex items-center justify-center gap-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-1.5 text-[9px] font-bold text-[#22C55E] hover:bg-[#22C55E]/20 transition-all">
              Start Mission &rarr;
            </Link>
          </div>
        )}
        
        <div className="mx-0.5 rounded-xl border border-[#2A3242] bg-[#12161F] p-3 mt-2 transition-all hover:border-[#60A5FA]/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 bg-[#60A5FA]/5 blur-2xl rounded-full" />
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Level Progress</p>
              <p className="text-[10px] text-white font-bold">Lvl {profile.level || 1} <span className="text-[#64748B] font-normal mx-0.5">&rarr;</span> Lvl {(profile.level || 1) + 1}</p>
            </div>
            <p className="text-[9px] font-mono text-[#60A5FA]">{100 - ((profile.xp || 0) % 100)} XP left</p>
          </div>
          <div className="flex items-center justify-between text-[8px] text-[#64748B] mb-1 relative z-10">
            <span>{(profile.xp || 0) % 100} XP</span>
            <span>100 XP</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#1C2230] overflow-hidden border border-[#2A3242] relative z-10">
            <div className="h-full bg-[#60A5FA] transition-all duration-1000 ease-out" style={{ width: `${(profile.xp || 0) % 100}%` }} />
          </div>
        </div>
      </aside>

      {/* Main interactive area */}
      <ProfileClient profile={profile} isOwner={isOwner} />
    </div>
  );
}
