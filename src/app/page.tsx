"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Coins,
  IndianRupee,
  Search,
  Sparkles,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import LandingHeader from "@/components/LandingHeader";
import { DAILY_PRIZE_PROBLEMS, MOCK_PROBLEMS, QUESTION_COUNT, type Difficulty } from "@/lib/mockData";

const difficultyOptions: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard", "Very Hard"];
const topics = ["All", ...Array.from(new Set(MOCK_PROBLEMS.map((problem) => problem.topic)))];
const pageSize = 100;

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
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-16">
            <div className="relative surface-panel rounded-xl p-6 sm:p-8">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                <IndianRupee className="h-3.5 w-3.5" />
                Solve code. Rank up. Earn cash.
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Code your way to the{" "}
                <span className="text-glow-blue text-primary">top of the board</span> and win real prizes.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Nexorithm is a competitive coding arena. Solve algorithm problems, climb daily rankings,
                and share verified prize pools when you finish among the best solvers.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/problems" className="btn-primary h-11 gap-2 px-5 text-sm">
                  Start Solving
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
                  { label: "Questions", value: QUESTION_COUNT.toLocaleString(), icon: BookOpen },
                  { label: "Prize pools", value: "Rs. 8.5K+", icon: Coins },
                  { label: "Difficulty bands", value: "4", icon: Trophy },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="surface-card rounded-lg p-4">
                      <Icon className="mb-3 h-4 w-4 text-primary" />
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Sign up free",
                    copy: "Create your account with Google, GitHub, or email in seconds.",
                    icon: Sparkles,
                  },
                  {
                    step: "02",
                    title: "Solve & submit",
                    copy: "Pick prize problems, write code in the workspace, and pass the judge.",
                    icon: Zap,
                  },
                  {
                    step: "03",
                    title: "Rank & earn",
                    copy: "Top performers on the board share the daily cash prize pool.",
                    icon: TrendingUp,
                  },
                ].map((item) => {
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

            <div id="join" className="scroll-mt-24">
              <AuthPanel />
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Today&apos;s Prize Problems</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Solve fast, rank higher, and compete for verified cash pools.
                </p>
              </div>
              <Link href="/rankings" className="btn-secondary h-10 px-4 text-xs">
                See who is winning
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {DAILY_PRIZE_PROBLEMS.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/workspace/${problem.id}`}
                  className="interactive-card surface-panel block rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${difficultyClass(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <h3 className="mt-3 text-base font-black text-white">{problem.title}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {problem.topic} / {problem.pattern}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xl font-black text-emerald-300">
                        Rs. {problem.prizeMoneyInr?.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-zinc-600">Prize pool</div>
                    </div>
                  </div>
                </Link>
              ))}
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
