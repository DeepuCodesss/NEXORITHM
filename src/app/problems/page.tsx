"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Check, Clock, Coins, Flame, Gift, IndianRupee, Layers, List, Search, Trophy, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Difficulty, Problem } from "@/lib/mockData";

const formatTimeLeft = (endsAt: string) => {
  const totalSeconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return { minutes, seconds, expired: totalSeconds <= 0 };
};

const cleanDescription = (problem?: Problem) => problem?.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";

export default function ProblemsPage() {
  const { user, problems, liveReward, problemBoardConfig, isProblemSolved, solvedCount } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | Difficulty>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unsolved" | "Solved" | "Bookmarked">("All");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const topicOptions = ["All Topics", "Arrays", "Dynamic Programming", "Graphs", "Strings", "Binary Search"];
  const liveRewardProblem = problems.find((problem) => problem.id === liveReward.problemId) ?? problems[0];
  const liveTimeLeft = formatTimeLeft(liveReward.endsAt);
  const liveRewardActive = liveReward.isActive && !liveTimeLeft.expired;
  const upcomingProblems = problemBoardConfig.showUpcomingRewards
    ? problemBoardConfig.upcomingRewardItems
      .map((item) => problems.find((problem) => problem.id === item.problemId))
      .filter((problem): problem is Problem => Boolean(problem))
      .slice(0, 3)
    : [];

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const difficultyRank: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3, "Very Hard": 4 };
    return problems
      .filter((problem) => {
        const matchesSearch =
          !query ||
          problem.title.toLowerCase().includes(query) ||
          problem.topic.toLowerCase().includes(query) ||
          problem.pattern.toLowerCase().includes(query);
        const solved = isProblemSolved(problem.id);
        const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
        const matchesStatus =
          selectedStatus === "All" ||
          (selectedStatus === "Solved" && solved) ||
          (selectedStatus === "Unsolved" && !solved) ||
          (selectedStatus === "Bookmarked" && bookmarkedIds.includes(problem.id));
        const matchesTopic =
          selectedTopic === "All Topics" ||
          problem.topic.toLowerCase().includes(selectedTopic.toLowerCase()) ||
          problem.pattern.toLowerCase().includes(selectedTopic.toLowerCase());
        return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic;
      })
      .sort((a, b) => {
        if (sortBy === "Difficulty: Low to High") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
        if (sortBy === "Difficulty: High to Low") return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
        return a.level - b.level;
      });
  }, [bookmarkedIds, isProblemSolved, problems, searchQuery, selectedDifficulty, selectedStatus, selectedTopic, sortBy]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProblems = filteredProblems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const solveProblems = problems.filter((problem) => isProblemSolved(problem.id));
  const easySolvedCount = solveProblems.filter((problem) => problem.difficulty === "Easy").length;

  const milestoneItems = [
    { title: "7 Day Streak", description: "Keep your streak alive for 7 days to unlock ₹5.", current: user.currentStreak, target: 7, reward: 5 },
    { title: "40 Easy Solves", description: "Clear 40 Easy problems to unlock ₹5.", current: easySolvedCount, target: 40, reward: 5 },
    { title: "100 Problems Solved", description: "Solve 100 problems in total to unlock ₹25.", current: solveProblems.length, target: 100, reward: 25 },
  ];

  const stats = [
    { label: "Total Problems", value: problems.length.toLocaleString(), icon: Layers, tone: "text-primary bg-primary0/5" },
    { label: "Solved", value: solvedCount.toLocaleString(), icon: Check, tone: "text-success bg-success0/5" },
    { label: "Streak", value: `${user.currentStreak} Day`, icon: Flame, tone: "text-primary bg-primary0/5" },
    { label: "Total Earned", value: `₹${(user.moneyEarnedInr ?? 0).toLocaleString()}`, icon: IndianRupee, tone: "text-reward bg-reward/10" },
  ];

  const difficultyClass = (difficulty: Difficulty) => {
    if (difficulty === "Easy") return "text-success bg-success0/10";
    if (difficulty === "Medium") return "text-primary bg-primary0/10";
    return "text-primary bg-primary0/10";
  };

  const problemStatus = (problem: Problem) => {
    if (problem.id === liveReward.problemId && liveRewardActive) return "Live Reward";
    if (upcomingProblems.some((item) => item.id === problem.id)) return "Upcoming";
    if (isProblemSolved(problem.id)) return "Solved";
    return "No Active Reward";
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="landing-shell min-h-screen">
      <main className="mx-auto max-w-[1468px] px-6 py-5">
        <section className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_344px]">
          <div className="min-w-0 space-y-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">Problems</h1>
                <p className="mt-1 text-xs text-secondary-text">Solve problems. Win rewards. Get better every day.</p>

                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-base font-black leading-tight text-white">{stat.value}</div>
                          <div className="text-[11px] text-secondary-text">{stat.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search problems, topics or keywords..."
                      className="subtle-input h-11 w-full rounded-lg py-2 pl-11 pr-14 text-sm"
                    />
                    <span className="absolute right-3 top-3 rounded border border-border bg-card px-2 py-1 text-[10px] font-mono text-muted-foreground">
                      K
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {topicOptions.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`h-8 rounded-lg px-3 text-xs font-semibold ${selectedTopic === topic ? "bg-primary0 text-white" : "bg-card text-secondary-text hover:text-white"
                          }`}
                      >
                        {topic}
                      </button>
                    ))}
                    <button className="h-8 rounded-lg bg-card px-3 text-xs font-semibold text-secondary-text hover:text-white">
                      + More
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary0/20 bg-primary0/[0.01] p-4 shadow-[0_0_40px_rgba(99,102,241,0.12)]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary0/20 bg-primary0/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                    <Flame className="h-4 w-4" /> Live Reward Problem
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${liveRewardActive ? "text-success" : "text-muted-foreground"}`}>
                    <span className={`h-2 w-2 rounded-full ${liveRewardActive ? "bg-success" : "bg-muted-foreground"}`} />
                    {liveRewardActive ? "Live Now" : "Paused"}
                  </span>
                </div>

                {liveRewardActive ? (
                  <>
                    <h2 className="mt-3.5 text-xl font-black text-white">{liveRewardProblem?.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-success0/10 px-2 py-1 text-xs font-bold text-success">
                        {liveRewardProblem?.difficulty}
                      </span>
                      <span className="rounded-md bg-card px-2 py-1 text-xs text-secondary-text">{liveRewardProblem?.topic}</span>
                      <span className="rounded-md bg-card px-2 py-1 text-xs text-secondary-text">{liveRewardProblem?.pattern}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary-text">{cleanDescription(liveRewardProblem).slice(0, 88)}...</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                      <div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground">Reward</div>
                        <div className="mt-2 flex items-center gap-2 text-2xl font-black text-primary">
                          <Coins className="h-5 w-5 text-reward" />₹{liveReward.rewardMoneyInr}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold uppercase text-muted-foreground">Time Left</div>
                        <div className="mt-1 font-mono text-2xl font-black text-primary">
                          {liveTimeLeft.minutes}:{liveTimeLeft.seconds}
                        </div>
                        <div className="text-xs text-muted-foreground">min sec</div>
                      </div>
                    </div>
                    <Link href={`/workspace/${liveRewardProblem?.id}`} className="btn-primary mt-4 h-10 w-full gap-2 text-sm">
                      Solve Challenge <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-border px-4 py-5 text-center">
                    <div className="text-sm font-semibold text-secondary-text">Paused</div>
                    <div className="mt-1 text-xs text-muted-foreground">Enable a live reward in Admin to feature a problem here.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_1fr_280px]">
                <div>
                  <div className="mb-2 text-xs font-semibold text-secondary-text">Difficulty</div>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Easy", "Medium", "Hard"].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff as "All" | Difficulty)}
                        className={`h-8 rounded-lg px-3 text-xs font-bold ${selectedDifficulty === diff ? "bg-primary0 text-white" : "bg-card text-secondary-text hover:text-white"}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-secondary-text">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Unsolved", "Solved", "Bookmarked"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status as "All" | "Unsolved" | "Solved" | "Bookmarked")}
                        className={`h-8 rounded-lg px-3 text-xs font-bold ${selectedStatus === status ? "bg-primary0 text-white" : "bg-card text-secondary-text hover:text-white"}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-secondary-text">Sort By</div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="subtle-input h-8 min-w-0 flex-1 rounded-lg px-3 text-xs font-semibold"
                    >
                      <option>Most Recent</option>
                      <option>Difficulty: Low to High</option>
                      <option>Difficulty: High to Low</option>
                    </select>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-secondary-text hover:text-white">
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr className="border-b border-border bg-card text-xs text-secondary-text">
                      <th className="w-14 px-5 py-4 font-semibold">#</th>
                      <th className="px-4 py-4 font-semibold">Problem</th>
                      <th className="w-28 px-4 py-4 font-semibold">Difficulty</th>
                      <th className="w-32 px-4 py-4 font-semibold">Topic</th>
                      <th className="w-40 px-4 py-4 font-semibold">Status</th>
                      <th className="w-24 px-4 py-4 font-semibold">Reward</th>
                      <th className="w-40 px-5 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {visibleProblems.map((problem, index) => {
                      const status = problemStatus(problem);
                      const live = status === "Live Reward";
                      const upcoming = status === "Upcoming";
                      const solved = isProblemSolved(problem.id);
                      const bookmarked = bookmarkedIds.includes(problem.id);
                      return (
                        <tr key={problem.id} className={live ? "bg-primary0/[0.04]" : "hover:bg-hover"}>
                          <td className="px-5 py-4 text-sm text-white">{(safePage - 1) * pageSize + index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${live ? "bg-primary0/15 text-primary" : "bg-hover text-secondary-text"}`}>
                                {live ? <Flame className="h-4 w-4 fill-primary" /> : <Layers className="h-4 w-4" />}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-white">{problem.title}</div>
                                <div className="mt-1 truncate text-xs text-muted-foreground">{cleanDescription(problem).slice(0, 68)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-secondary-text">{problem.topic}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${live ? "bg-primary0/10 text-primary" : upcoming ? "bg-primary0/10 text-primary" : solved ? "bg-success0/10 text-success" : "bg-card text-secondary-text"}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {live || upcoming ? (
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                                <Coins className="h-4 w-4 text-reward" />₹{live ? liveReward.rewardMoneyInr : problem.prizeMoneyInr ?? liveReward.rewardMoneyInr}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Link href={`/workspace/${problem.id}`} className={live ? "btn-primary h-9 px-4 text-xs" : "btn-secondary h-9 px-4 text-xs"}>
                                {live ? "Solve Now" : upcoming ? "View" : "Solve"}
                              </Link>
                              <button
                                onClick={(event) => toggleBookmark(problem.id, event)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${bookmarked ? "bg-primary0/10 text-primary" : "bg-card text-muted-foreground hover:text-white"}`}
                              >
                                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <div className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-secondary-text">{safePage}</span> of <span className="font-semibold text-secondary-text">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="btn-secondary h-8 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages} className="btn-secondary h-8 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="h-5 w-5 text-primary" /> Upcoming Rewards
              </div>
              {problemBoardConfig.showUpcomingRewards ? (
                <div className="mt-3 space-y-3">
                  {upcomingProblems.length ? (
                    upcomingProblems.map((problem, index) => (
                      <div key={problem.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <div className="text-xs text-muted-foreground">{String(9 + index).padStart(2, "0")}:00 AM - {String(10 + index).padStart(2, "0")}:00 AM</div>
                          <div className="mt-1 text-sm font-bold text-foreground">{problem.title}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-reward/10 px-2 py-1 text-xs font-bold text-reward">
                          <Coins className="h-3.5 w-3.5" />₹{problem.prizeMoneyInr ?? liveReward.rewardMoneyInr}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No upcoming rewards are configured.</div>
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Upcoming rewards are turned off in Admin.</div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Gift className="h-5 w-5 text-primary" /> How Rewards Work
              </div>
              <div className="mt-3 space-y-2.5 text-sm text-secondary-text">
                <p className="flex gap-3"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />One featured problem is active at a time, and only the live one pays out the cash reward.</p>
                <p className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Solve before the timer ends to earn the live reward.</p>
                <p className="flex gap-3"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Milestones pay out separately when you hit their target.</p>
                <p className="flex gap-3"><IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Rewards are tracked per user, so progress and cash stay tied to your account.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Trophy className="h-5 w-5 text-primary" /> Reward Milestones
              </div>
              <div className="mt-3 space-y-3">
                {milestoneItems.map((item) => {
                  const progress = Math.min(100, Math.round((item.current / item.target) * 100));
                  return (
                    <div key={item.title} className="rounded-xl bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        <span className="rounded-md bg-reward/10 px-2 py-1 text-xs font-bold text-reward">₹{item.reward}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-reward" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{item.current} / {item.target}</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Zap className="h-5 w-5 text-primary" /> Your Progress
              </div>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Solved Problems</span><span className="font-bold text-white">{solvedCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total XP</span><span className="font-bold text-white">{user.xp.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Global Rank</span><span className="font-bold text-white">#{user.devRank.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cash Earned</span><span className="font-bold text-white">₹{(user.moneyEarnedInr ?? 0).toLocaleString()}</span></div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
