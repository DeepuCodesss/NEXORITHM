"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { Award, Briefcase, Code2, Flame, ShieldAlert, Trophy, UserRound } from "lucide-react";
import { DAILY_PRIZE_PROBLEMS } from "@/lib/mockData";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user, missions, problems, solvedCount } = useApp();
  const isGuestProfile = username === "guest" || username === user.username;

  if (!isGuestProfile) {
    return (
      <div className="app-shell flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl font-black text-white">Profile Not Available</h1>
        <p className="mt-2 max-w-md text-center text-sm leading-6 text-zinc-400">
          Public profiles will appear after authentication and user records are connected.
        </p>
        <Link href="/" className="btn-primary mt-5 h-10 px-4 text-xs">
          Return to question bank
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="surface-panel mb-8 rounded-lg p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Image src={user.avatarUrl} alt="" width={44} height={44} className="h-11 w-11 opacity-80" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{user.fullName}</h1>
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                    @{user.username}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  A clean profile shell for identity, progress, missions, verified submissions, streaks, and solved-problem analytics once the backend is connected.
                </p>
              </div>
            </div>
            <Link href="/" className="btn-primary h-10 px-4 text-xs">
              Start Practicing
            </Link>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            { label: "XP", value: user.xp, icon: Award },
            { label: "Coins", value: user.coins, icon: Trophy },
            { label: "Reputation", value: user.reputation, icon: UserRound },
            { label: "DevRank", value: user.devRank, icon: Briefcase },
            { label: "Current Streak", value: user.currentStreak, icon: Flame },
            { label: "Shields", value: user.streakShields, icon: ShieldAlert },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="surface-card rounded-lg p-4">
                <Icon className="mb-3 h-4 w-4 text-primary" />
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">{stat.label}</div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <Link
              href="/settings"
              className="inline-block btn-secondary h-9 px-4 text-xs"
            >
              Settings
            </Link>
            <p className="text-sm text-zinc-400">Email: {user.email}</p>
            <div>
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-zinc-500">Daily Prize Questions</h2>
              <div className="space-y-3">
                {DAILY_PRIZE_PROBLEMS.map((problem) => (
                  <Link
                    key={problem.id}
                    href={`/workspace/${problem.id}`}
                    className="interactive-card block rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black text-white">{problem.title}</h3>
                        <p className="mt-1 text-xs text-zinc-500">{problem.topic} / {problem.pattern}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-300">Rs. {problem.prizeMoneyInr?.toLocaleString("en-IN")}</div>
                        <div className="text-[10px] font-bold uppercase text-zinc-600">Prize</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-zinc-500">Question Bank Progress</h2>
              <div className="surface-card rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-black text-white">
                      {solvedCount.toLocaleString()} / {problems.length.toLocaleString()} solved
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Earn XP and coins on your first accepted submission for each problem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-zinc-500">Missions</h2>
            <div className="space-y-3">
              {missions.map((mission) => (
                <div key={mission.id} className="surface-card rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-blue-200">
                      {mission.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{mission.currentCount}/{mission.targetCount}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-black text-white">{mission.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{mission.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
