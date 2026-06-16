"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, Flame, Gift, Info, LockKeyhole, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Problem } from "@/lib/mockData";

const streakRewards = [
  { day: 1, coins: 5 },
  { day: 2, coins: 5 },
  { day: 3, coins: 5 },
  { day: 4, coins: 10 },
  { day: 5, coins: 10 },
  { day: 6, coins: 15 },
  { day: 7, coins: 20, cash: 5 },
  { day: 14, coins: 50, cash: 15 },
  { day: 30, coins: 200, cash: 50 },
];

const cleanDescription = (problem?: Problem) => problem?.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";

export default function RewardsPage() {
  const { user, problems, liveReward } = useApp();
  const easyProblems = problems.filter((problem) => problem.difficulty === "Easy");
  const featuredEasyProblem = easyProblems.find((problem) => problem.id === liveReward.problemId) ?? easyProblems[0] ?? null;
  const currentBalance = user.coins;
  const currentStreak = user.currentStreak;
  const liveIsActive = Boolean(featuredEasyProblem) && liveReward.isActive;

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
                <p className="mt-1 max-w-2xl text-sm text-secondary-text">A clean reward hub for real coins, streaks, and withdrawals.</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
                  <Info className="h-3.5 w-3.5" />
                  Easy rewards appear only when a real easy problem exists.
                </div>
              </div>
            </div>

            <div className="relative flex justify-end self-start">
              <div className="relative flex h-[104px] items-center justify-end overflow-hidden sm:h-[116px] md:h-[124px] lg:h-[132px] xl:mr-1">
                <Image
                  src="/reward-chests.png"
                  alt="Reward gift with coins"
                  width={1200}
                  height={900}
                  priority
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-black text-white">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Today&apos;s Visible Reward Pool
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
                  <Info className="h-3.5 w-3.5" />
                  Live problem only
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {featuredEasyProblem ? (
                  <RewardCard
                    title="Easy Challenge"
                    value="Rs 5"
                    description={`Solve ${featuredEasyProblem.title.toLowerCase()} and earn a real reward.`}
                    icon={Zap}
                    tone="border-success/50 text-success"
                    href={`/workspace/${featuredEasyProblem.id}`}
                    ctaLabel="Solve Now"
                    supportingText={cleanDescription(featuredEasyProblem).slice(0, 105)}
                  />
                ) : (
                  <EmptyRewardCard title="Easy Challenge" value="Locked" icon={Zap} tone="border-success/50 text-success" />
                )}

                <ComingSoonCard
                  title="Medium Challenge"
                  value="Rs 100"
                  icon={Target}
                  tone="border-amber-400/40 text-amber-400"
                  description="Future reward tier for medium problems."
                />

                <ComingSoonCard
                  title="Hard Challenge"
                  value="Rs 1000"
                  icon={Trophy}
                  tone="border-violet-400/40 text-violet-400"
                  description="Future reward tier for hard problems."
                />
              </div>

              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-white">
                      <Flame className="h-5 w-5 text-reward" />
                      Daily Streak Rewards
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
                        {reward.cash ? <p className="mt-1 text-xs text-success">+Rs {reward.cash}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white">Live Reward</h2>
                    <p className="mt-1 text-sm text-secondary-text">Currently active reward configuration.</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                      liveIsActive ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/20 bg-card text-muted-foreground"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${liveIsActive ? "bg-success" : "bg-muted-foreground"}`} />
                    {liveIsActive ? "Live" : "Paused"}
                  </span>
                </div>

                <div className="mt-5 rounded-[22px] border border-border bg-gradient-to-br from-violet-500/10 via-card to-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Featured Problem</p>
                  <h3 className="mt-3 text-xl font-black text-white">{featuredEasyProblem?.title ?? "No active reward"}</h3>
                  <p className="mt-2 text-sm text-secondary-text">
                    {liveIsActive
                      ? `Solve this problem to earn Rs ${liveReward.rewardMoneyInr}.`
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

              <section className="surface-card rounded-[24px] border border-violet-500/30 p-5">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-black text-white">Your Balance</h2>
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-reward/15 text-reward">
                    <CircleDollarSign className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">{currentBalance}</span>
                      <span className="pb-1 text-lg font-bold text-white">Coins</span>
                    </div>
                    <p className="mt-1 text-sm text-secondary-text">Withdraw badges from your coins.</p>
                  </div>
                </div>
                <Link href="/rewards/withdraw" className="btn-primary mt-5 h-12 w-full gap-2 text-sm">
                  Withdraw Badges
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
  href,
  ctaLabel,
  supportingText,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  href: string;
  ctaLabel: string;
  supportingText: string;
}) {
  return (
    <div className={`surface-card flex min-h-[230px] flex-col justify-between rounded-[24px] border p-5 ${tone} shadow-[0_0_30px_rgba(34,197,94,0.08)]`}>
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

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-secondary-text">Real reward card</p>
        <Link href={href} className="btn-primary h-12 gap-2 px-5 text-sm">
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function EmptyRewardCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className={`surface-card flex min-h-[260px] flex-col justify-between rounded-[24px] border p-5 ${tone} opacity-85`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-current/30 bg-black/20">
          <Icon className="h-9 w-9" />
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{title}</p>
          <p className="mt-1 text-3xl font-black text-current">{value}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-black/20 px-4 py-8 text-center text-sm text-secondary-text">
        Publish an easy problem and it will appear here automatically.
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-secondary-text">Waiting for live content</p>
        <button className="btn-secondary h-12 px-5 text-sm text-secondary-text" disabled>
          Coming Soon
        </button>
      </div>
    </div>
  );
}

function ComingSoonCard({
  title,
  value,
  icon: Icon,
  tone,
  description,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  description: string;
}) {
  return (
    <div className={`surface-card flex min-h-[230px] flex-col justify-between rounded-[24px] border p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-current/20 bg-black/20 text-muted-foreground">
          <Icon className="h-9 w-9" />
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{title}</p>
          <p className="mt-1 text-3xl font-black text-current">{value}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-black/20 px-4 py-5 text-sm text-secondary-text">
        <p className="font-semibold text-white">Coming soon</p>
        <p className="mt-2 leading-6">{description}</p>
      </div>
      <button className="btn-secondary mt-5 h-12 w-full cursor-not-allowed bg-card text-secondary-text opacity-70" disabled>
        Coming Soon
      </button>
    </div>
  );
}
