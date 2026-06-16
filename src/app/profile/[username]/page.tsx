"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Code2,
  Flame,
  Gift,
  Home,
  Medal,
  Pencil,
  Share2,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DAILY_PRIZE_PROBLEMS } from "@/lib/mockData";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const difficultyStyles = {
  Easy: "border-success/25 bg-success/10 text-success",
  Medium: "border-primary/25 bg-primary/10 text-primary",
  Hard: "border-primary/25 bg-primary/10 text-primary",
  "Very Hard": "border-primary/25 bg-primary/10 text-primary",
};

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const { user, missions, problems, solvedCount, isAuthenticated } = useApp();
  const displayUsername =
    clerkUser?.username ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    user.username;
  const displayFullName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser?.fullName ||
    user.fullName;
  const displayAvatar = clerkUser?.imageUrl || user.avatarUrl;
  const isOwnProfile = username === displayUsername || username === "me";
  const navItems = [
    { label: "Overview", href: isSignedIn ? `/profile/${displayUsername}` : "/settings", icon: Home },
    { label: "Problems", href: "/problems", icon: BookOpen },
    { label: "Contests", href: "/contests", icon: Trophy },
    { label: "Rankings", href: "/rankings", icon: Medal },
    { label: "Rewards", href: "/rewards", icon: Gift },
  ];

  const streakGoal = 7;
  const streakProgress = Math.min(user.currentStreak, streakGoal);
  const rewardDaysLeft = Math.max(0, streakGoal - streakProgress);
  const solvedProblems = problems.filter((problem) => user.solvedProblemIds.includes(problem.id));
  const availablePrizeProblems = DAILY_PRIZE_PROBLEMS.filter((problem) => !user.solvedProblemIds.includes(problem.id));
  const totalMissionCount = missions.reduce((total, mission) => total + mission.targetCount, 0);
  const completedMissionCount = missions.reduce((total, mission) => total + Math.min(mission.currentCount, mission.targetCount), 0);
  const activityCells = Array.from({ length: 365 }, (_, index) => {
    if (solvedCount === 0) return 0;
    return index >= 365 - solvedCount ? Math.min(4, 1 + ((index + solvedCount) % 4)) : 0;
  });

  const stats = [
    { label: "Current Streak", value: `${user.currentStreak} Days`, detail: `Best: ${user.longestStreak} days`, icon: Flame, tone: "text-success" },
    { label: "Global Rank", value: `#${user.devRank.toLocaleString()}`, detail: isAuthenticated ? "From your earned XP" : "Sign in to sync rank", icon: Trophy, tone: "text-primary" },
    { label: "XP", value: user.xp.toLocaleString(), detail: `Next: ${Math.max(0, 1500 - user.xp).toLocaleString()} XP`, icon: Award, tone: "text-primary" },
    { label: "Coins", value: user.coins.toLocaleString(), detail: "100 coins = Rs 5", icon: CircleDollarSign, tone: "text-primary" },
    { label: "Reputation", value: user.reputation.toLocaleString(), detail: solvedCount > 0 ? "From accepted submissions" : "Solve to earn reputation", icon: Star, tone: "text-primary" },
    { label: "Shields", value: user.streakShields.toLocaleString(), detail: user.streakShields > 0 ? "Ready to protect streak" : "None owned yet", icon: Shield, tone: "text-success" },
  ];

  const achievements = [
    { label: "First Submission", detail: "Submit your first accepted solution", active: solvedCount > 0, icon: Code2 },
    { label: "7-Day Streak", detail: "Maintain a 7-day streak", active: user.currentStreak >= 7, icon: Flame },
    { label: "Fast Solver", detail: "Solve 3 problems", active: solvedCount >= 3, icon: Zap },
  ];

  if (!isLoaded) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-secondary-text">Loading profile...</p>
      </div>
    );
  }

  if (!isOwnProfile && username !== user.username) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="text-xl font-black text-white">Profile not available</h1>
        <p className="mt-2 max-w-md text-center text-sm leading-6 text-secondary-text">
          This profile is not available. Open your own account page instead.
        </p>
        <Link href={isSignedIn ? `/profile/${displayUsername}` : "/settings"} className="btn-primary mt-5 h-10 px-4 text-xs">
          Open my profile
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1540px] gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="surface-panel hidden rounded-lg p-3 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)]">
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${index === 0 ? "bg-primary text-white shadow-[0_12px_30px_rgba(99,102,241,0.28)]" : "text-secondary-text hover:bg-hover hover:text-white"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex h-full flex-col justify-end">
            <div className="rounded-lg border border-primary/20 bg-primary0/10 p-5 text-center">
              <Trophy className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 text-sm font-black text-white">Solve. Streak. Earn.</h2>
              <p className="mt-2 text-xs leading-5 text-secondary-text">Real rewards unlock from verified challenge submissions.</p>
              <Link href="/rewards" className="btn-secondary mt-5 h-10 w-full gap-2 text-xs">
                Rewards
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="surface-panel rounded-lg p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.8fr)]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-primary bg-hover p-1 shadow-[0_0_34px_rgba(99,102,241,0.35)]">
                  <Image src={displayAvatar} alt="" width={112} height={112} unoptimized className="h-full w-full rounded-full object-cover" />
                  <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background bg-success" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-black text-white">{displayFullName}</h1>
                    {isAuthenticated && <BadgeCheck className="h-5 w-5 fill-primary text-white" />}
                  </div>
                  <p className="mt-1 font-mono text-sm text-secondary-text">@{displayUsername}</p>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-secondary-text">
                    Solving DSA daily. Building consistency one verified problem at a time.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-secondary-text">{user.college}</span>
                    <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-secondary-text">
                      {isAuthenticated ? "Signed in account" : "Sign in to view synced profile"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Flame className="h-8 w-8 fill-primary0 text-primary0" />
                    <div>
                      <h2 className="font-black text-white">7-Day Streak</h2>
                      <p className="text-xs text-muted-foreground">{rewardDaysLeft === 0 ? "Reward unlocked" : `Solve for ${rewardDaysLeft} more ${rewardDaysLeft === 1 ? "day" : "days"}`}</p>
                    </div>
                  </div>
                  <div className="font-mono text-sm font-black text-white">{streakProgress} / {streakGoal}</div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {Array.from({ length: streakGoal }, (_, index) => (
                    <span key={index} className={`h-2 rounded-full ${index < streakProgress ? "bg-success shadow-[0_0_12px_rgba(52,211,153,0.45)]" : "bg-hover"}`} />
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Link href="/problems" className="btn-primary h-12 gap-2 px-4 text-sm">
                    <Zap className="h-4 w-4" />
                    Solve Today&apos;s Challenge
                  </Link>
                  <Link href="/settings" className="btn-secondary h-12 gap-2 px-4 text-sm">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Link>
                  <button className="btn-secondary h-12 w-12" aria-label="Share profile">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.slice(0, 4).map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="surface-card rounded-lg p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-hover p-3">
                      <Icon className={`h-6 w-6 ${stat.tone}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary-text">{stat.label}</p>
                      <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_2.4fr]">
                {stats.slice(4).map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="surface-card rounded-lg p-5">
                      <Icon className={`h-6 w-6 ${stat.tone}`} />
                      <p className="mt-4 text-2xl font-black text-white">{stat.value}</p>
                      <p className="mt-1 text-xs font-bold text-secondary-text">{stat.label}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p>
                    </div>
                  );
                })}
                <div className="surface-card min-w-0 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-white">Activity Heatmap</h2>
                    <span className="inline-flex items-center gap-1 text-xs text-primary">365 Days <ChevronDown className="h-3 w-3" /></span>
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
                    {monthLabels.map((month) => <span key={month}>{month}</span>)}
                  </div>
                  <div className="mt-3 max-w-full overflow-x-auto pb-1">
                    <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
                      {activityCells.map((level, index) => (
                        <span
                          key={index}
                          className={`h-3 w-3 shrink-0 rounded-sm ${level === 0 ? "bg-white/[0.06]" : level === 1 ? "bg-success" : level === 2 ? "bg-success" : level === 3 ? "bg-success" : "bg-success"
                            }`}
                          title={level === 0 ? "No solved problem recorded" : "Solved problem recorded"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <section className="surface-panel rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-black text-white">
                    <Target className="h-5 w-5 text-primary" />
                    Today&apos;s Challenges
                  </h2>
                  <span className="rounded-lg border border-border bg-hover px-3 py-2 font-mono text-xs text-secondary-text">Daily pool</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {DAILY_PRIZE_PROBLEMS.map((problem) => {
                    const solved = user.solvedProblemIds.includes(problem.id);
                    return (
                      <Link
                        key={problem.id}
                        href={`/workspace/${problem.id}`}
                        className={`interactive-card rounded-lg border p-4 ${difficultyStyles[problem.difficulty]} ${solved ? "opacity-65" : ""}`}
                      >
                        <span className="inline-flex rounded-md border border-current/20 bg-black/20 px-2 py-1 text-[10px] font-black uppercase">{problem.difficulty}</span>
                        <h3 className="mt-6 text-lg font-black text-white">{problem.title}</h3>
                        <p className="mt-2 text-sm text-secondary-text">{solved ? "Already solved" : `${problem.topic} practice`}</p>
                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-lg font-black text-white">Rs {problem.prizeMoneyInr}</span>
                          <span className="inline-flex items-center gap-1 text-sm font-black text-white">
                            {solved ? "Review" : "Solve Now"}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {availablePrizeProblems.length === 0 && (
                  <p className="mt-4 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
                    All daily prize problems are solved in this local profile.
                  </p>
                )}
              </section>

              <section className="surface-card rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-black text-white">
                    <Code2 className="h-4 w-4 text-primary" />
                    Real Submission Activity
                  </h2>
                  <span className="text-xs text-muted-foreground">{solvedCount} accepted</span>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {solvedProblems.length === 0 ? (
                    <p className="py-6 text-sm text-secondary-text">No accepted submissions yet. Once you solve a problem, it will appear here.</p>
                  ) : (
                    solvedProblems.slice(-4).reverse().map((problem) => (
                      <Link key={problem.id} href={`/workspace/${problem.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="font-bold text-white">{problem.title}</span>
                        <span className="text-primary">+{problem.xpReward} XP</span>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-4">
              <section className="surface-card rounded-lg p-5">
                <h2 className="flex items-center gap-2 font-black text-white">
                  <Target className="h-4 w-4 text-primary" />
                  Daily Missions
                </h2>
                <div className="mt-4 space-y-4">
                  {missions.map((mission) => {
                    const percent = Math.round((Math.min(mission.currentCount, mission.targetCount) / mission.targetCount) * 100);
                    return (
                      <div key={mission.id}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-white">{mission.title}</span>
                          <span className="font-mono text-secondary-text">{mission.currentCount} / {mission.targetCount}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hover">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-success">{mission.xpReward} XP, {mission.coinReward} coins</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-lg border border-border bg-card p-3 text-xs text-secondary-text">
                  Mission progress: {completedMissionCount} / {totalMissionCount}
                </div>
              </section>

              <section className="surface-card rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-white">Achievements</h2>
                  <Link href="/rewards" className="text-xs font-bold text-primary">View All</Link>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={achievement.label} className="flex items-center gap-3 py-4">
                        <div className={`rounded-full p-3 ${achievement.active ? "bg-success/15 text-success" : "bg-hover text-muted-foreground"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-white">{achievement.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{achievement.detail}</p>
                        </div>
                        {achievement.active ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="text-[10px] font-bold text-primary">Locked</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
