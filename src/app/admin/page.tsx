"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Coins, Plus, Save, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const toDatetimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value: string) => new Date(value).toISOString();

export default function AdminPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { problems, liveReward, problemBoardConfig, saveLiveReward, saveProblemBoardConfig } = useApp();
  const [query, setQuery] = useState("");
  const [problemId, setProblemId] = useState(liveReward?.problemId ?? "");
  const [rewardMoneyInr, setRewardMoneyInr] = useState(String(liveReward?.rewardMoneyInr ?? 0));
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(liveReward?.startsAt ?? new Date().toISOString()));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(liveReward?.endsAt ?? new Date().toISOString()));
  const [isActive, setIsActive] = useState(liveReward?.isActive ?? false);
  const [showUpcomingRewards, setShowUpcomingRewards] = useState(problemBoardConfig.showUpcomingRewards);
  const [upcomingRewardItems, setUpcomingRewardItems] = useState(problemBoardConfig.upcomingRewardItems);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (clerkUser?.publicMetadata?.role !== "admin") {
      router.replace("/");
    }
  }, [clerkUser?.publicMetadata?.role, isLoaded, router]);

  useEffect(() => {
    queueMicrotask(() => {
      setProblemId(liveReward?.problemId ?? "");
      setRewardMoneyInr(String(liveReward?.rewardMoneyInr ?? 0));
      setStartsAt(toDatetimeLocal(liveReward?.startsAt ?? new Date().toISOString()));
      setEndsAt(toDatetimeLocal(liveReward?.endsAt ?? new Date().toISOString()));
      setIsActive(liveReward?.isActive ?? false);
    });
  }, [liveReward]);

  useEffect(() => {
    queueMicrotask(() => {
      setShowUpcomingRewards(problemBoardConfig.showUpcomingRewards);
      setUpcomingRewardItems(problemBoardConfig.upcomingRewardItems);
    });
  }, [problemBoardConfig]);

  const selectedProblem = problems.find((problem) => problem.id === problemId) ?? problems[0];

  const visibleProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return problems
      .filter((problem) => {
        if (!normalized) return true;
        return (
          problem.title.toLowerCase().includes(normalized) ||
          problem.topic.toLowerCase().includes(normalized) ||
          problem.pattern.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 40);
  }, [problems, query]);

  const setDuration = (minutes: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60 * 1000);
    setStartsAt(toDatetimeLocal(start.toISOString()));
    setEndsAt(toDatetimeLocal(end.toISOString()));
  };

  const updateUpcomingItem = (index: number, problemIdValue: string) => {
    setUpcomingRewardItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { problemId: problemIdValue } : item)),
    );
  };

  const addUpcomingItem = () => {
    setUpcomingRewardItems((current) => [...current, { problemId: "" }].slice(0, 3));
  };

  const removeUpcomingItem = (index: number) => {
    setUpcomingRewardItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = () => {
    saveLiveReward({
      problemId,
      rewardMoneyInr: Number(rewardMoneyInr),
      startsAt: fromDatetimeLocal(startsAt),
      endsAt: fromDatetimeLocal(endsAt),
      isActive,
    });
    saveProblemBoardConfig({
      showUpcomingRewards,
      upcomingRewardItems,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="landing-shell min-h-screen">
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary0/15 bg-primary0/10 px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Reward Admin
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Live Reward Control</h1>
            <p className="mt-1 text-sm text-secondary-text">
              Pick the active problem, set prize money, and manage the upcoming reward strip on Problems.
            </p>
          </div>
          <Link href="/problems" className="btn-secondary h-10 gap-2 px-4 text-sm">
            View Problems
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/withdrawals" className="btn-primary h-10 gap-2 px-4 text-sm">
            Withdrawals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Reward Money
                <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3">
                  <Coins className="h-4 w-4 text-primary" />
                  <input
                    value={rewardMoneyInr}
                    onChange={(event) => setRewardMoneyInr(event.target.value)}
                    type="number"
                    min="1"
                    className="w-full bg-transparent text-sm font-bold text-white outline-none"
                  />
                </div>
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
                <button
                  type="button"
                  onClick={() => setIsActive((current) => !current)}
                  className={`mt-2 flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-bold ${isActive
                      ? "border-success0/20 bg-success0/10 text-success"
                      : "border-border bg-card text-secondary-text"
                    }`}
                >
                  {isActive ? "Live Now" : "Paused"}
                  <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-success" : "bg-muted-foreground"}`} />
                </button>
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Starts At
                <input
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  type="datetime-local"
                  className="subtle-input mt-2 h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ends At
                <input
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  type="datetime-local"
                  className="subtle-input mt-2 h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[30, 45, 60, 120].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDuration(minutes)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-secondary-text hover:text-white"
                >
                  {minutes} min
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Problem</label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, topic, or pattern..."
                  className="subtle-input h-11 w-full rounded-xl py-2 pl-10 pr-3 text-sm"
                />
              </div>

              <div className="mt-3 max-h-[380px] overflow-auto rounded-xl border border-border">
                {visibleProblems.map((problem) => (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => setProblemId(problem.id)}
                    className={`flex w-full items-center justify-between gap-3 border-b border-white/[0.04] px-4 py-3 text-left last:border-b-0 ${problemId === problem.id ? "bg-primary0/10" : "hover:bg-hover"
                      }`}
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{problem.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {problem.topic} / {problem.pattern}
                      </span>
                    </span>
                    <span className="rounded border border-success0/10 bg-success0/10 px-2 py-0.5 text-[10px] font-bold text-success">
                      {problem.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Upcoming Rewards</div>
                  <p className="mt-1 text-xs text-muted-foreground">Turn this off to show no upcoming problems on the board.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpcomingRewards((current) => !current)}
                  className={`flex h-10 items-center rounded-xl border px-3 text-xs font-bold ${showUpcomingRewards
                      ? "border-success0/20 bg-success0/10 text-success"
                      : "border-border bg-card text-secondary-text"
                    }`}
                >
                  {showUpcomingRewards ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {upcomingRewardItems.map((item, index) => (
                  <div key={`${index}-${item.problemId}`} className="flex items-center gap-2">
                    <select
                      value={item.problemId}
                      onChange={(event) => updateUpcomingItem(index, event.target.value)}
                      className="subtle-input h-10 min-w-0 flex-1 rounded-lg px-3 text-sm"
                    >
                      <option value="">No upcoming problem</option>
                      {problems.slice(0, 80).map((problem) => (
                        <option key={problem.id} value={problem.id}>
                          {problem.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeUpcomingItem(index)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-secondary-text hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addUpcomingItem}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-secondary-text hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </button>
            </div>

            <button onClick={handleSave} className="btn-primary mt-6 h-11 w-full gap-2 text-sm">
              <Save className="h-4 w-4" />
              {saved ? "Saved Live Reward" : "Save Live Reward"}
            </button>
          </div>

          <aside className="rounded-2xl border border-primary0/20 bg-primary0/[0.01] p-5 shadow-[0_0_40px_rgba(99,102,241,0.12)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary0/15 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <span className="live-dot" />
                Preview
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                <Clock className="h-3.5 w-3.5" />
                Scheduled
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-black text-white">{selectedProblem?.title}</h2>
            <p className="mt-2 text-sm text-secondary-text">
              {selectedProblem?.topic} / {selectedProblem?.pattern}
            </p>
            <div className="mt-6 border-t border-border pt-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reward</div>
              <div className="mt-2 flex items-center gap-2 text-[36px] font-black leading-none text-primary">
                <Coins className="h-6 w-6 text-primary" />
                {Math.max(0, Math.round(Number(rewardMoneyInr) || 0)) > 0
                  ? `₹${Math.max(0, Math.round(Number(rewardMoneyInr) || 0))}`
                  : "No cash reward"}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
