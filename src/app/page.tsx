"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bolt,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Crown,
  Flame,
  IndianRupee,
  Medal,
  Rocket,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import LandingHeader from "@/components/LandingHeader";
import { MOCK_PROBLEMS, type Difficulty } from "@/lib/mockData";

const difficultyOptions: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard", "Very Hard"];
const topics = ["All", ...Array.from(new Set(MOCK_PROBLEMS.map((problem) => problem.topic)))];
const pageSize = 100;

const howItWorks = [
  {
    step: "01",
    title: "Sign Up",
    copy: "Create your free account and set up your coding profile.",
    icon: Users,
  },
  {
    step: "02",
    title: "Solve Daily Problems",
    copy: "Choose today's challenge, submit your solution, and pass the judge.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Earn Rewards",
    copy: "Top solvers and milestone achievers unlock real wallet rewards.",
    icon: Wallet,
  },
  {
    step: "04",
    title: "Build Streaks",
    copy: "Stay consistent, grow your streak, and unlock bonus milestones.",
    icon: Flame,
  },
];

const rewardMilestones = [
  {
    title: "Daily Challenge",
    label: "Rank Reward",
    amount: "₹5",
    detail: "Top 1 gets ₹5 • Top 3 gets ₹3 • Top 10 gets XP",
    icon: Trophy,
    accent: "text-amber-300 border-amber-400/60 bg-amber-400/10",
    amountClass: "text-amber-300",
    glow: "from-amber-500/20 via-orange-500/10",
    line: "bg-amber-400",
  },
  {
    title: "7 Days",
    label: "Streak Reward",
    amount: "₹5",
    detail: "Solve daily for 7 straight days",
    icon: Flame,
    accent: "text-orange-300 border-orange-400/60 bg-orange-400/10",
    amountClass: "text-orange-300",
    glow: "from-orange-500/20 via-amber-500/10",
    line: "bg-orange-400",
  },
  {
    title: "15 Days",
    label: "Streak Reward",
    amount: "₹10",
    detail: "Keep your streak alive for 15 days",
    icon: Target,
    accent: "text-red-300 border-red-400/60 bg-red-400/10",
    amountClass: "text-red-300",
    glow: "from-red-500/20 via-rose-500/10",
    line: "bg-red-400",
  },
  {
    title: "30 Days",
    label: "Streak Reward",
    amount: "₹25",
    detail: "Complete a full 30-day streak",
    icon: Rocket,
    accent: "text-purple-300 border-purple-400/60 bg-purple-400/10",
    amountClass: "text-purple-300",
    glow: "from-purple-500/20 via-fuchsia-500/10",
    line: "bg-purple-400",
  },
  {
    title: "40 Easy Problems",
    label: "Problem Reward",
    amount: "₹5",
    detail: "Finish the beginner Easy track",
    icon: CheckCircle2,
    accent: "text-cyan-300 border-cyan-400/60 bg-cyan-400/10",
    amountClass: "text-cyan-300",
    glow: "from-cyan-500/20 via-sky-500/10",
    line: "bg-cyan-400",
  },
  {
    title: "100 Problems Solved",
    label: "Progress Reward",
    amount: "₹25",
    detail: "Reach 100 total accepted solutions",
    icon: Medal,
    accent: "text-violet-300 border-violet-400/60 bg-violet-400/10",
    amountClass: "text-violet-300",
    glow: "from-violet-500/20 via-indigo-500/10",
    line: "bg-violet-400",
  },
  {
    title: "250 Problems Solved",
    label: "Power Reward",
    amount: "₹100",
    detail: "Reach 250 total accepted solutions",
    icon: Bolt,
    accent: "text-yellow-300 border-yellow-400/60 bg-yellow-400/10",
    amountClass: "text-yellow-300",
    glow: "from-yellow-500/20 via-lime-500/10",
    line: "bg-yellow-400",
  },
  {
    title: "365-Day Streak",
    label: "Legend Reward",
    amount: "₹500",
    detail: "Special badge plus cash reward",
    icon: Crown,
    accent: "text-fuchsia-300 border-fuchsia-400/60 bg-fuchsia-400/10",
    amountClass: "text-fuchsia-300",
    glow: "from-fuchsia-500/20 via-pink-500/10",
    line: "bg-fuchsia-400",
  },
];

const difficultyClass = (difficulty: Difficulty) => {
  if (difficulty === "Easy") return "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";
  if (difficulty === "Medium") return "text-amber-300 border-amber-400/20 bg-amber-400/10";
  if (difficulty === "Hard") return "text-rose-300 border-rose-400/20 bg-rose-400/10";
  return "text-cyan-200 border-cyan-300/20 bg-cyan-300/10";
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [topic, setTopic] = useState("All");
  const [page, setPage] = useState(1);

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return MOCK_PROBLEMS.filter((problem) => {
      const matchesSearch =
        !query ||
        problem.title.toLowerCase().includes(query) ||
        problem.topic.toLowerCase().includes(query) ||
        problem.pattern.toLowerCase().includes(query) ||
        String(problem.level).includes(query);
      const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
      const matchesTopic = topic === "All" || problem.topic === topic;
      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [difficulty, searchQuery, topic]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProblems = filteredProblems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const updateDifficulty = (nextDifficulty: "All" | Difficulty) => {
    setDifficulty(nextDifficulty);
    setPage(1);
  };

  const updateTopic = (nextTopic: string) => {
    setTopic(nextTopic);
    setPage(1);
  };

  return (
    <div className="app-shell">
      <LandingHeader />

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="hero-glow" />
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
            <div className="relative surface-panel rounded-xl p-6 sm:p-8">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                <IndianRupee className="h-3.5 w-3.5" />
                Learn coding. Stay consistent. Earn rewards.
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Solve. Streak. <span className="text-glow-blue text-primary">Earn.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Complete daily coding challenges, build streaks, climb leaderboards, and earn rewards
                directly to your wallet. The reward is a bonus; the real win is becoming sharper every day.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/problems" className="btn-primary h-11 gap-2 px-5 text-sm">
                  Start Solving Today
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/rankings" className="btn-secondary h-11 px-5 text-sm">
                  View Leaderboard
                </Link>
                <a href="#join" className="btn-secondary h-11 px-5 text-sm lg:hidden">
                  Create Account
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Daily practice", copy: "New coding challenges keep your routine moving.", icon: BookOpen },
                  { label: "Streak pressure", copy: "Miss fewer days by turning consistency into a visible goal.", icon: Flame },
                  { label: "Wallet unlocks", copy: "Rewards appear when milestones are actually completed.", icon: Wallet },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="surface-card rounded-lg p-4">
                      <Icon className="mb-3 h-4 w-4 text-primary" />
                      <div className="text-sm font-black text-white">{stat.label}</div>
                      <div className="mt-2 text-xs leading-5 text-zinc-500">{stat.copy}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-white">How It Works</h2>
                    <p className="mt-1 text-xs text-zinc-500">Understand the platform in 10 seconds.</p>
                  </div>
                  <Sparkles className="hidden h-5 w-5 text-primary sm:block" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  {howItWorks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="step-card rounded-lg p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] font-black tracking-[0.2em] text-primary">{item.step}</span>
                          <Icon className="h-4 w-4 text-zinc-500" />
                        </div>
                        <h3 className="text-sm font-black text-white">{item.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">{item.copy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div id="join" className="scroll-mt-24">
              <AuthPanel />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Reward path
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Milestones That Pay You Back</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Every card shows the target and reward openly. Build skill, keep your streak alive,
                  and let the rewards become the bonus that keeps you moving.
                </p>
              </div>
              <Link href="/problems" className="btn-primary h-11 gap-2 px-5 text-sm">
                Start Earning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute left-8 right-8 top-[4.25rem] hidden h-0.5 bg-gradient-to-r from-orange-400 via-red-400 to-fuchsia-400 opacity-70 md:block" />
              <div className="absolute left-8 right-8 top-[4.25rem] hidden border-t border-dashed border-white/25 md:block" />

              <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
                {rewardMilestones.map((milestone) => {
                  const Icon = milestone.icon;
                  return (
                    <Link
                      key={milestone.title}
                      href="/problems"
                      className="group relative flex min-h-[21rem] flex-col items-center pt-12"
                    >
                      <div className={`absolute top-0 z-10 flex h-20 w-20 items-center justify-center rounded-full border ${milestone.accent} shadow-[0_0_34px_rgba(255,255,255,0.08)] transition-transform duration-200 group-hover:-translate-y-1`}>
                        <Icon className={`h-9 w-9 ${milestone.amountClass}`} />
                      </div>
                      <div className={`absolute top-20 h-8 w-0.5 ${milestone.line}`} />
                      <div className={`relative flex h-full w-full flex-col items-center overflow-hidden rounded-xl border bg-gradient-to-b ${milestone.glow} to-white/[0.025] px-5 pb-6 pt-16 text-center transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_70px_rgba(0,0,0,0.38)] ${milestone.accent}`}>
                        <div className={`absolute inset-x-8 top-0 h-px ${milestone.line}`} />
                        <div className="text-2xl font-black uppercase tracking-wide text-white">{milestone.title}</div>
                        <div className={`mt-4 h-1 w-16 rounded-full ${milestone.line}`} />
                        <div className="mt-7 text-lg font-bold text-zinc-300">{milestone.label}</div>
                        <div className={`mt-5 text-6xl font-black leading-none tracking-tight ${milestone.amountClass}`}>
                          {milestone.amount}
                        </div>
                        <div className="mt-7 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-zinc-500">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <p className="mt-5 min-h-10 text-xs font-semibold leading-5 text-zinc-400">{milestone.detail}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="surface-panel rounded-lg p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Question Bank</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Showing {visibleProblems.length} of {filteredProblems.length.toLocaleString()} matching questions.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search level, topic, pattern..."
                    className="subtle-input h-10 w-full rounded-md py-2 pl-9 pr-3 text-xs"
                  />
                </div>
                <select
                  value={difficulty}
                  onChange={(event) => updateDifficulty(event.target.value as "All" | Difficulty)}
                  className="subtle-input h-10 rounded-md px-3 text-xs"
                >
                  {difficultyOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select
                  value={topic}
                  onChange={(event) => updateTopic(event.target.value)}
                  className="subtle-input h-10 rounded-md px-3 text-xs"
                >
                  {topics.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
              <div className="hidden grid-cols-[72px_1fr_130px_120px] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 sm:grid">
                <span>Level</span>
                <span>Question</span>
                <span>Difficulty</span>
                <span className="text-right">Action</span>
              </div>
              {visibleProblems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/workspace/${problem.id}`}
                  className="grid gap-3 border-b border-white/5 px-4 py-4 text-xs transition-colors last:border-b-0 hover:bg-white/[0.04] sm:grid-cols-[72px_1fr_130px_120px]"
                >
                  <span className="font-mono text-zinc-500">#{problem.level}</span>
                  <div>
                    <div className="font-bold text-zinc-100">{problem.title}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">{problem.topic} / {problem.pattern}</div>
                  </div>
                  <span className={`w-fit self-start rounded border px-2 py-0.5 text-[10px] font-bold ${difficultyClass(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-primary sm:justify-end">
                    Attempt
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage === 1}
                className="btn-secondary h-10 gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <div className="text-center text-xs font-semibold text-zinc-500">
                Page {safePage} of {totalPages}
              </div>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage === totalPages}
                className="btn-secondary h-10 gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
