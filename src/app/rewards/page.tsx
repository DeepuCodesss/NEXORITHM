"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  Clock,
  Flame,
  Gift,
  Info,
  IndianRupee,
  LockKeyhole,
  Sparkles,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const streakRewards = [
  { day: 1, coins: 5 },
  { day: 2, coins: 5 },
  { day: 3, coins: 5 },
  { day: 4, coins: 10 },
  { day: 5, coins: 10 },
  { day: 6, coins: 15 },
  { day: 7, coins: 20 },
  { day: 14, coins: 50 },
  { day: 30, coins: 200 },
];

export default function RewardsPage() {
  const { user, problems, liveReward } = useApp();
  const [now, setNow] = useState(() => Date.now());
  const easyProblems = problems.filter((problem) => problem.difficulty === "Easy");
  const featuredEasyProblem = easyProblems.find((problem) => problem.id === liveReward?.problemId) ?? easyProblems[0] ?? null;
  const currentStreak = user.currentStreak;
  const liveIsActive = Boolean(
    featuredEasyProblem &&
      liveReward &&
      liveReward.isActive &&
      new Date(liveReward.endsAt).getTime() > now,
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-shell min-h-screen bg-background pb-10">
      <main className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="surface-panel overflow-hidden rounded-[28px] border border-border/80 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-5">
          <div className="grid gap-3 border-b border-border/70 pb-3 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_40px_rgba(168,85,247,0.12)] sm:h-16 sm:w-16">
                <Gift className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Rewards</h1>
                <p className="mt-1 max-w-2xl text-sm text-secondary-text">A clean reward hub for real coins, streaks, live challenges, and progress.</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
                  <Info className="h-3.5 w-3.5" />
                  Earn on live problems, streaks, and milestone progress.
                </div>
              </div>
            </div>

            <div className="relative flex justify-end self-start">
              <Link
                href="/rewards/withdraw"
                className="group flex h-[104px] w-full max-w-[260px] items-center justify-between rounded-[24px] border border-border bg-card px-5 shadow-[0_0_40px_rgba(99,102,241,0.08)] transition hover:border-primary/30 hover:bg-hover sm:h-[116px] md:h-[124px] lg:h-[132px]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-reward/30 bg-reward/10 text-reward">
                    <WalletCards className="h-7 w-7" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white">Withdraw</div>
                    <div className="mt-1 text-xs text-secondary-text">Open cash-out page</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-secondary-text transition group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black text-white">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Reward Milestones
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
                  <Info className="h-3.5 w-3.5" />
                  Progress only
                </span>
              </div>

              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-white">
                      <Flame className="h-5 w-5 text-reward" />
                      Streak Rewards
                    </h2>
                    <p className="mt-1 text-sm text-secondary-text">Keep solving daily to keep your streak alive and unlock bonuses.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-2 text-sm">
                    <span className="text-secondary-text">Current Streak</span>
                    <span className="ml-3 font-black text-success">{currentStreak} Days</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-9">
                  {streakRewards.map((reward) => {
                    const achieved = currentStreak >= reward.day;
                    return (
                      <div key={reward.day} className="text-center">
                        <div
                          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                            achieved
                              ? "border-success bg-success/10 text-success"
                              : reward.day === 7
                                ? "border-amber-400 bg-amber-400/10 text-amber-400"
                                : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {reward.day === 7 ? <Gift className="h-6 w-6" /> : achieved ? <Flame className="h-6 w-6 fill-current" /> : <LockKeyhole className="h-5 w-5" />}
                        </div>
                        <p className="mt-3 text-sm font-bold text-white">Day {reward.day}</p>
                        <p className="mt-1 text-xs text-reward">+{reward.coins} Coins</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-4 xl:grid-cols-3">
                <RewardCard
                  title="XP Rewards"
                  value={`${user.xp.toLocaleString()} XP`}
                  description="Solve problems to earn XP and level up your account."
                  icon={Trophy}
                  tone="border-primary/40 text-primary"
                  supportingText="XP keeps your profile and rank climbing."
                />
                <RewardCard
                  title="Coin Rewards"
                  value={`${user.coins.toLocaleString()} Coins`}
                  description="Earn platform coins from solving and streak consistency."
                  icon={CircleDollarSign}
                  tone="border-reward/40 text-reward"
                  supportingText="Coins are your core in-app reward."
                />
                <RewardCard
                  title="Reward Progress"
                  value="Track your path"
                  description="Monitor streaks, solved count, and reward milestones across the platform."
                  icon={Zap}
                  tone="border-success/40 text-success"
                  supportingText="Progress updates as you solve more problems."
                />
              </div>

              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-black text-white">
                    <Trophy className="h-5 w-5 text-primary" />
                    Live Reward Challenges
                  </h2>
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${liveIsActive ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/20 bg-card text-muted-foreground"}`}>
                    <span className={`h-2 w-2 rounded-full ${liveIsActive ? "bg-success" : "bg-muted-foreground"}`} />
                    {liveIsActive ? "Live" : "Paused"}
                  </span>
                </div>

                <div className="mt-5 rounded-[22px] border border-border bg-gradient-to-br from-violet-500/10 via-card to-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Featured Problem</p>
                  <h3 className="mt-3 text-xl font-black text-white">{featuredEasyProblem?.title ?? "No active reward"}</h3>
                  <p className="mt-2 text-sm text-secondary-text">
                    {liveIsActive
                      ? "Solve this problem to earn a backend-confirmed cash reward."
                      : "Publish an easy problem to feature it here."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {featuredEasyProblem ? (
                      <>
                        <span className="rounded-lg border border-border bg-card px-3 py-2 text-secondary-text">{featuredEasyProblem.difficulty}</span>
                        <span className="rounded-lg border border-border bg-card px-3 py-2 text-secondary-text">{featuredEasyProblem.topic}</span>
                        <span className="rounded-lg border border-border bg-card px-3 py-2 text-secondary-text">{featuredEasyProblem.pattern}</span>
                      </>
                    ) : null}
                  </div>

                  <Link href={`/workspace/${featuredEasyProblem?.id ?? ""}`} className="btn-primary mt-5 h-11 w-full gap-2 text-sm">
                    Open Featured Problem
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-black text-white">Upcoming Rewards</h2>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-black/20 p-4 text-sm text-secondary-text">
                  No upcoming rewards are configured.
                </div>
              </section>

              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-white">How Rewards Work</h2>
                </div>
                <div className="mt-3 space-y-2.5 text-sm text-secondary-text">
                  <p className="flex gap-3"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />One featured problem is active at a time, and only the live one pays out the cash reward.</p>
                  <p className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Solve before the timer ends to earn the live reward.</p>
                  <p className="flex gap-3"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Milestones pay out separately when you hit their target.</p>
                  <p className="flex gap-3"><IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Rewards are tracked per user, so progress and cash stay tied to your account.</p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function RewardCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
  supportingText,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  supportingText: string;
}) {
  return (
    <div className={`surface-card flex min-h-[230px] flex-col justify-between rounded-[24px] border p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-current/30 bg-black/20">
          <Icon className="h-9 w-9" />
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{title}</p>
          <p className="mt-1 text-3xl font-black text-current">{value}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <p className="max-w-sm text-sm leading-6 text-secondary-text">{description}</p>
        <p className="text-xs font-semibold text-secondary-text">{supportingText}</p>
      </div>
    </div>
  );
}
