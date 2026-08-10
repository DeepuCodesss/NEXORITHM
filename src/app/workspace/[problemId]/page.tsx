"use client";

import { use, useEffect, useRef, useState, type CSSProperties, type ClipboardEvent as ReactClipboardEvent, type ElementType, type PointerEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { SignInButton, useUser } from "@clerk/nextjs";
import { languageById, SUPPORTED_LANGUAGES, type JudgeLanguage } from "@/lib/languages";
import type { SolveRewardResult } from "@/lib/mockData";
import SubmissionCelebrations, { type SubmissionCelebrationData, type SubmissionToastData } from "@/components/SubmissionCelebrations";
import { calculateTrustScore, createReplayPayload, normalizeReplayEvents, type ReplayEvent } from "@/lib/replay";
import {
  BookOpenCheck,
  ChevronLeft,
  FileCode2,
  FileText,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Terminal,
  ThumbsUp,
  Clock3,
  Trophy,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] font-mono text-sm text-secondary-text">
      Loading editor...
    </div>
  ),
});

type JudgeResponse = {
  success?: boolean;
  data?: {
    status?: string;
    message?: string;
    passedCount?: number;
    totalCount?: number;
    runtimeMs?: number;
    saved?: boolean;
    submissionId?: string | null;
    databaseError?: string | null;
    cases?: Array<{
      id: number;
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
      error?: string;
    }>;
    error?: string;
  };
  status?: string;
  message?: string;
  passedCount?: number;
  totalCount?: number;
  runtimeMs?: number;
  saved?: boolean;
  submissionId?: string | null;
  databaseError?: string | null;
  cases?: Array<{
    id: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }>;
  error?: string;
};

type SubmissionStatus = "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Unknown";

type SubmissionSummary = {
  status: SubmissionStatus;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  submissionId: string | null;
  saved: boolean;
  databaseError: string | null;
  cases: NonNullable<JudgeResponse["cases"]>;
  submittedAt: string;
};

type ProblemLeaderboardRow = {
  rank: number;
  user: string;
  username: string;
  avatarUrl: string;
  solveTime: number;
  language: string;
  replayId: string;
  trustScore: number;
  pasteContribution: number;
};

type ProblemLeaderboardResponse = {
  data?: {
    leaders?: ProblemLeaderboardRow[];
    pagination?: {
      total?: number;
    };
  };
};

const formatSolveTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
};

export default function WorkspacePage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = use(params);
  const { problems, solveProblem, user, liveReward } = useApp();
  const { user: clerkUser, isLoaded } = useUser();
  const isGuest = isLoaded && !clerkUser;

  const matchedProblem = problems.find((p) => p.id === problemId);
  const problem = matchedProblem ?? problems[0];
  const invalidProblemId = !matchedProblem;
  const starterCode = problem.starterCode.javascript;

  const [language, setLanguage] = useState<JudgeLanguage>("javascript");
  const [code, setCode] = useState(starterCode);

  type LeftTab = "description" | "leaderboard" | "editorial" | "solutions" | "discussions" | "testcases";
  const [leftTab, setLeftTab] = useState<LeftTab>("description");

  type BottomTab = "testcase" | "console";

  // Console state
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<BottomTab>("testcase");
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [consoleLogs, setConsoleLogs] = useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary | null>(null);
  const [toast, setToast] = useState<SubmissionToastData | null>(null);
  const [celebration, setCelebration] = useState<SubmissionCelebrationData | null>(null);
  const [streakToast, setStreakToast] = useState<string | null>(null);
  const [levelToast, setLevelToast] = useState<{ from: number; to: number; title: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [leaders, setLeaders] = useState<ProblemLeaderboardRow[]>([]);
  const [leadersTotal, setLeadersTotal] = useState(0);
  const [leadersLoading, setLeadersLoading] = useState(false);
  const [backHref] = useState(() => {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.pathname.startsWith("/contests")) {
        return `${referrer.pathname}${referrer.search}${referrer.hash}`;
      }
    } catch {
      // Fallback below.
    }
    return "/problems";
  });
  const replayClockRef = useRef(0);
  const replayEventsRef = useRef<ReplayEvent[]>([{ type: "snapshot", timestamp: 0, code: starterCode }]);
  const replayStatsRef = useRef({ pasteCount: 0, pastedCharacters: 0, largeInsertCount: 0, runCount: 0, tabSwitchCount: 0, solveTimeSeconds: 0, trustScore: 100 });
  const snapshotTimerRef = useRef<number | null>(null);
  const lastSnapshotCodeRef = useRef(starterCode);

  const currentProblemIndex = Math.max(0, problems.findIndex((item) => item.id === problem.id));
  const nextProblemHref = `/workspace/${problems[(currentProblemIndex + 1) % problems.length]?.id ?? problem.id}`;
  const activeLiveCash =
    liveReward &&
    liveReward.isActive &&
    liveReward.problemId === problem.id &&
    new Date(liveReward.startsAt).getTime() <= now &&
    new Date(liveReward.endsAt).getTime() > now
      ? liveReward.rewardMoneyInr
      : 0;

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!streakToast) return;
    const timer = window.setTimeout(() => setStreakToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [streakToast]);

  useEffect(() => {
    if (!levelToast) return;
    const timer = window.setTimeout(() => setLevelToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [levelToast]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const replayTimer = window.setInterval(() => {
      replayClockRef.current += 1;
    }, 1000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(replayTimer);
    };
  }, []);

  useEffect(() => {
    replayClockRef.current = 0;
    replayEventsRef.current = [{ type: "snapshot", timestamp: 0, code: starterCode }];
    replayStatsRef.current = { pasteCount: 0, pastedCharacters: 0, largeInsertCount: 0, runCount: 0, tabSwitchCount: 0, solveTimeSeconds: 0, trustScore: 100 };
    lastSnapshotCodeRef.current = starterCode;
    queueMicrotask(() => {
      setCode(starterCode);
      setLanguage("javascript");
      setLeftTab("description");
      setBottomTab("testcase");
    });
  }, [problem.id, starterCode]);

  useEffect(() => {
    const sync = async () => {
      if (invalidProblemId) return;
      setLeadersLoading(true);
      const response = await fetch(`/api/problems/${problem.id}/leaderboard?pageSize=10`, { cache: "no-store" });
      if (!response.ok) {
        setLeaders([]);
        setLeadersTotal(0);
        setLeadersLoading(false);
        return;
      }
      const payload = (await response.json()) as ProblemLeaderboardResponse;
      setLeaders(Array.isArray(payload.data?.leaders) ? payload.data!.leaders : []);
      setLeadersTotal(payload.data?.pagination?.total ?? 0);
      setLeadersLoading(false);
    };
    void sync();
  }, [invalidProblemId, problem.id]);

  const handleLanguageChange = (nextLanguage: JudgeLanguage) => {
    setLanguage(nextLanguage);
    setCode(problem.starterCode[nextLanguage]);
  };

  const handleResetCode = () => {
    if (confirm("Reset current editor code to default template?")) {
      setCode(problem.starterCode[language]);
    }
  };

  const replayTimestamp = () => replayClockRef.current;

  const recordReplayEvent = (event: ReplayEvent) => {
    replayEventsRef.current = [...replayEventsRef.current, event].slice(-60);
  };

  const recordSnapshot = (nextCode: string) => {
    if (nextCode === lastSnapshotCodeRef.current) return;
    lastSnapshotCodeRef.current = nextCode;
    recordReplayEvent({ type: "snapshot", timestamp: replayTimestamp(), code: nextCode.slice(0, 6000) });
  };

  const scheduleSnapshot = (nextCode: string) => {
    if (snapshotTimerRef.current) window.clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = window.setTimeout(() => {
      recordSnapshot(nextCode);
      snapshotTimerRef.current = null;
    }, 2500);
  };

  const onTabSwitch = (tab: string) => {
    replayStatsRef.current.tabSwitchCount += 1;
    recordReplayEvent({ type: "tab_switch", timestamp: replayTimestamp(), label: tab });
  };

  const onRunAttempt = () => {
    replayStatsRef.current.runCount += 1;
    recordReplayEvent({ type: "run", timestamp: replayTimestamp() });
  };

  const onSubmitAttempt = () => {
    recordReplayEvent({ type: "submit", timestamp: replayTimestamp() });
  };

  const recordPaste = (pastedText: string, source: "monaco" | "wrapper") => {
    if (!pastedText) return;
    const charsPasted = pastedText.length;
    const linesPasted = pastedText.split(/\r?\n/).length;
    replayStatsRef.current.pasteCount += 1;
    replayStatsRef.current.pastedCharacters += charsPasted;
    console.log("[replay] paste detected", { source });
    console.log("[replay] chars pasted", charsPasted);
    console.log("[replay] lines pasted", linesPasted);
    recordReplayEvent({
      type: "paste",
      timestamp: replayTimestamp(),
      charsPasted,
      linesPasted,
    });
    scheduleSnapshot(`${code}${pastedText.slice(0, 2000)}`);
  };

  const recordLargeInsert = (charsInserted: number, linesInserted: number) => {
    replayStatsRef.current.largeInsertCount += 1;
    recordReplayEvent({
      type: "large_insert",
      timestamp: replayTimestamp(),
      charsInserted,
      linesInserted,
    });
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      recordReplayEvent({
        type: document.hidden ? "tab_hidden" : "tab_visible",
        timestamp: replayTimestamp(),
      });
    };
    const handleWindowBlur = () => {
      recordReplayEvent({ type: "window_blur", timestamp: replayTimestamp() });
    };
    const handleWindowFocus = () => {
      recordReplayEvent({ type: "window_focus", timestamp: replayTimestamp() });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const onPaste = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData("text");
    recordPaste(pasted, "wrapper");
  };

  const shouldShowCelebration = (reward?: SolveRewardResult) =>
    Boolean(reward?.awarded) &&
    Boolean(
      (reward?.levelBefore && reward?.levelAfter && reward.levelAfter > reward.levelBefore) ||
        (reward?.currentStreak && reward.currentStreak >= 7) ||
        (typeof reward?.moneyGainedInr === "number" && reward.moneyGainedInr > 0) ||
        Boolean(reward?.unlockedTitle) ||
        !reward?.alreadySolved,
    );

  const formatJudgeResponse = (result: JudgeResponse, reward?: SolveRewardResult) => {
    if (result.error) return result.error;

    const lines = [
      `${result.status ?? "Unknown"}: ${result.message ?? "Judge finished."}`,
      `Passed ${result.passedCount ?? 0}/${result.totalCount ?? 0} cases in ${result.runtimeMs ?? 0}ms.`,
    ];

    if (reward?.awarded) {
      lines.push("");
      const rewardPieces = [`+${reward.xpGained} XP`, `+${reward.coinsGained} coins`, `+${reward.reputationGained} reputation`];
      if (reward.moneyGainedInr > 0) rewardPieces.splice(2, 0, `+₹${reward.moneyGainedInr} cash`);
      lines.push(rewardPieces.join("  "));
    } else if (reward?.alreadySolved && result.status === "Accepted") {
      lines.push("");
      lines.push("Already solved — no additional XP for this problem.");
    }

    if (typeof result.saved === "boolean") {
      lines.push(result.saved ? `Saved submission ${result.submissionId}.` : "Submission was judged but not saved.");
    }

    if (result.databaseError) {
      lines.push(`Database: ${result.databaseError}`);
    }

    for (const testCase of result.cases ?? []) {
      lines.push("");
      lines.push(`Case ${testCase.id}: ${testCase.passed ? "PASSED" : "FAILED"}`);
      lines.push(`Input: ${testCase.input}`);
      lines.push(`Expected: ${testCase.expected}`);
      lines.push(`Actual: ${testCase.actual || "(empty)"}`);
      if (testCase.error) lines.push(`Error: ${testCase.error}`);
    }

    return lines.join("\n");
  };

  const buildToast = (status: SubmissionStatus, result: JudgeResponse["data"], reward?: SolveRewardResult): SubmissionToastData => {
    if (status === "Accepted") {
      const rewardBits = [];
      const streak = reward?.currentStreak ?? 0;
      if (reward?.xpGained) rewardBits.push(`+${reward.xpGained} XP`);
      if (reward?.coinsGained) rewardBits.push(`+${reward.coinsGained} Coins`);
      if (streak > 0) rewardBits.push(`🔥 ${streak} Day Streak`);
      return {
        title: reward?.alreadySolved ? "Practice submission" : "Accepted",
        message: reward?.alreadySolved
          ? "No additional rewards earned."
          : rewardBits.length
            ? rewardBits.join(" • ")
            : "Submission passed all checks.",
        tone: "success",
      };
    }

    if (status === "Wrong Answer") {
      return {
        title: "Wrong Answer",
        message: `Passed ${result?.passedCount ?? 0}/${result?.totalCount ?? 0} test cases.`,
        tone: "error",
      };
    }

    return {
      title: status,
      message: result?.message || "Judge finished.",
      tone: "error",
    };
  };

  const callJudge = async (endpoint: "/api/submissions/run" | "/api/submissions") => {
    setConsoleOpen(true);
    setBottomTab("console");
    setConsoleLogs(endpoint.endsWith("/run") ? "Running code on backend judge..." : "Submitting code to backend judge...");
    if (endpoint === "/api/submissions") {
      replayStatsRef.current.solveTimeSeconds = replayTimestamp();
      recordSnapshot(code);
      onSubmitAttempt();
      console.log("[replay] event count before submit", replayEventsRef.current.length);
    } else {
      onRunAttempt();
    }

    const replay = endpoint === "/api/submissions"
      ? createReplayPayload(normalizeReplayEvents(replayEventsRef.current), {
          ...replayStatsRef.current,
          solveTimeSeconds: Math.max(1, replayStatsRef.current.solveTimeSeconds),
          trustScore: calculateTrustScore(
            {
              pasteCount: replayStatsRef.current.pasteCount,
              pastedCharacters: replayStatsRef.current.pastedCharacters,
              largeInsertCount: replayStatsRef.current.largeInsertCount,
              runCount: replayStatsRef.current.runCount,
              tabSwitchCount: replayStatsRef.current.tabSwitchCount,
              solveTimeSeconds: Math.max(1, replayStatsRef.current.solveTimeSeconds),
            },
            normalizeReplayEvents(replayEventsRef.current),
          ),
        })
      : undefined;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        language,
        code,
        replay,
      }),
    });
    const payload = (await response.json()) as JudgeResponse;
    const result = payload.data ?? payload;

    if (!response.ok || payload.success === false) {
      throw new Error(result.error || "Judge request failed.");
    }

    let reward: SolveRewardResult | undefined;
    if (endpoint === "/api/submissions" && result.status === "Accepted" && result.saved) {
      const beforeStreak = user.currentStreak;
      const beforeXp = user.xp;
      reward = solveProblem(problem.id);
      const status = (result.status as SubmissionStatus) ?? "Unknown";
      if (reward.awarded) {
        const beforeLevel = reward.levelBefore ?? Math.max(1, Math.floor(beforeXp / 200) + 1);
        const afterLevel = reward.levelAfter ?? Math.max(1, Math.floor((beforeXp + reward.xpGained) / 200) + 1);
        if ((reward.currentStreak ?? beforeStreak) > beforeStreak) {
          setStreakToast(`🔥 ${reward.currentStreak} Day Streak!`);
        }
        if (afterLevel > beforeLevel) {
          setLevelToast({
            from: beforeLevel,
            to: afterLevel,
            title: reward.unlockedTitle || problem.title,
          });
        }
        setCelebration(
          shouldShowCelebration(reward)
            ? {
                problemTitle: problem.title,
                rewardLine: `+${reward.xpGained} XP • +${reward.coinsGained} Coins • 🔥 ${reward.currentStreak ?? beforeStreak} Day Streak`,
                xpGained: reward.xpGained,
                coinsGained: reward.coinsGained,
                moneyGainedInr: reward.moneyGainedInr > 0 ? reward.moneyGainedInr : undefined,
                showCash: reward.moneyGainedInr > 0,
                streak: reward.currentStreak ?? beforeStreak,
                levelBefore: beforeLevel,
                levelAfter: afterLevel,
                unlockedTitle: reward.unlockedTitle,
                nextProblemHref,
              }
            : null,
        );
      } else {
        setCelebration(null);
      }
      setToast(buildToast(status, result, reward));
    } else if (endpoint === "/api/submissions") {
      setToast(buildToast((result.status as SubmissionStatus) ?? "Unknown", result));
    }

    setSubmissionSummary({
      status: (result.status as SubmissionStatus) ?? "Unknown",
      passedCount: result.passedCount ?? 0,
      totalCount: result.totalCount ?? 0,
      runtimeMs: result.runtimeMs ?? 0,
      submissionId: result.saved ? result.submissionId ?? null : null,
      saved: Boolean(result.saved),
      databaseError: result.databaseError ?? null,
      cases: result.cases ?? [],
      submittedAt: new Date().toISOString(),
    });
    setConsoleLogs(formatJudgeResponse(result, reward));
    return { result, reward };
  };

  if (isLoaded && isGuest) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0F1117] px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-[#1E2736] bg-[#111827] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[#C084FC]">
            <BookOpenCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sign in to open problems</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#94A3B8]">
            You can still browse the problem list, but solving a question requires a Nexorithm account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SignInButton mode="modal">
              <button type="button" className="btn-primary h-11 px-5 text-sm font-bold">
                Sign In to Continue
              </button>
            </SignInButton>
            <Link href="/problems" className="btn-secondary h-11 px-5 text-sm font-bold">
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const leftTabs: Array<{ id: LeftTab; label: string; icon: ElementType }> = [
    { id: "description", label: "Description", icon: FileText },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "editorial", label: "Editorial", icon: BookOpenCheck },
    { id: "solutions", label: "Solutions", icon: FileCode2 },
    { id: "discussions", label: "Discuss", icon: MessageSquare },
    { id: "testcases", label: "Cases", icon: Terminal },
  ];
  const leftPanelStyle = {
    "--left-panel-width": `calc(${leftPanelWidth}% - 4px)`,
  } as CSSProperties;
  const rightPanelStyle = {
    "--right-panel-width": `calc(${100 - leftPanelWidth}% - 4px)`,
  } as CSSProperties;

  const renderLeaderboard = () => {
    const topLeader = leaders[0] ?? null;
    const totalAccepted = leadersTotal || leaders.length || 0;
    const languageCounts = new Map<string, number>();
    for (const leader of leaders) {
      languageCounts.set(leader.language, (languageCounts.get(leader.language) ?? 0) + 1);
    }
    const mostUsedLanguage = Array.from(languageCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? topLeader?.language ?? "JavaScript";
    const myLeader = leaders.find((leader) => leader.username === user.username || leader.user === user.fullName) ?? null;

    const rankAccent = (rank: number) => {
      if (rank === 1) return "border-amber-400/40 bg-amber-400/10 text-amber-100";
      if (rank === 2) return "border-slate-300/40 bg-slate-300/10 text-slate-100";
      if (rank === 3) return "border-orange-400/40 bg-orange-400/10 text-orange-100";
      return "border-border bg-background/40 text-secondary-text";
    };

    const languageTone = (language: string) => {
      const normalized = language.toLowerCase();
      if (normalized.includes("javascript")) return "border-amber-400/30 bg-amber-400/10 text-amber-100";
      if (normalized.includes("python")) return "border-sky-400/30 bg-sky-400/10 text-sky-100";
      if (normalized.includes("java")) return "border-orange-400/30 bg-orange-400/10 text-orange-100";
      if (normalized.includes("c++") || normalized.includes("cpp")) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
      return "border-border bg-hover text-secondary-text";
    };

    const normalizedLanguage = (language: string) => {
      const lower = language.toLowerCase();
      if (lower.includes("javascript")) return "JavaScript";
      if (lower.includes("python")) return "Python";
      if (lower.includes("java")) return "Java";
      if (lower.includes("c++") || lower.includes("cpp")) return "C++";
      return language;
    };
    return (
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">🏆 Total Accepted Solvers</div>
            <div className="mt-2 text-2xl font-black text-white">{totalAccepted}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">⚡ Fastest Solve</div>
            <div className="mt-2 text-2xl font-black text-white">{topLeader ? formatSolveTime(topLeader.solveTime) : "—"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">💻 Most Used Language</div>
            <div className="mt-2 text-2xl font-black text-white">{normalizedLanguage(mostUsedLanguage)}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">My Rank</div>
              <div className="mt-1 text-xs text-secondary-text">Your personal placement for this problem.</div>
            </div>
          </div>
          {myLeader ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Rank</div>
                <div className="mt-1 text-lg font-black text-white">#{myLeader.rank}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Solve Time</div>
                <div className="mt-1 text-lg font-black text-white">{formatSolveTime(myLeader.solveTime)}</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Language</div>
                <div className={`mt-1 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${languageTone(myLeader.language)}`}>
                  {normalizedLanguage(myLeader.language)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-secondary-text">
              <div className="font-bold text-white">Not ranked yet.</div>
              <div className="mt-1">Solve the problem to enter the leaderboard.</div>
            </div>
          )}
        </div>

        <div className="space-y-3 sm:hidden">
          {leadersLoading ? (
            Array.from({ length: 3 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-border bg-background/40" />)
          ) : leaders.length ? (
            leaders.map((leader) => (
              <div key={leader.replayId} className={`rounded-2xl border p-4 ${leader.rank <= 3 ? "bg-background/55" : "bg-background/35"} ${rankAccent(leader.rank)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="inline-flex h-9 w-14 items-center justify-center rounded-full border text-xs font-black bg-background/40 text-white">
                      {leader.rank === 1 ? "🏆 #1" : `#${leader.rank}`}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">{leader.user}</div>
                      <div className="mt-1 text-xs text-secondary-text">{formatSolveTime(leader.solveTime)}</div>
                      <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${languageTone(leader.language)}`}>
                        {normalizedLanguage(leader.language)}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/replay/${leader.replayId}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/20"
                  >
                    ▶ Replay
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-secondary-text">
              <div className="text-base font-bold text-white">Be the first solver to claim Rank #1.</div>
            </div>
          )}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-border bg-card sm:block">
          <div className="border-b border-border px-4 py-3">
            <div className="grid grid-cols-[72px_minmax(0,1.4fr)_88px_110px_110px] gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:grid-cols-[72px_minmax(0,1.6fr)_96px_132px_144px]">
              <div>Rank</div>
              <div>User</div>
              <div>Solve Time</div>
              <div>Language</div>
              <div>Replay</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {leadersLoading ? (
              Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse bg-background/40" />)
            ) : leaders.length ? (
              leaders.map((leader) => (
                <div
                  key={leader.replayId}
                  className={`grid grid-cols-[72px_minmax(0,1.4fr)_88px_110px_110px] gap-3 px-4 py-4 text-sm sm:grid-cols-[72px_minmax(0,1.6fr)_96px_132px_144px] ${leader.rank <= 3 ? "bg-background/55" : "bg-background/35"} ${leader.rank === 1 ? "shadow-[inset_0_0_0_1px_rgba(245,158,11,0.14)]" : ""}`}
                >
                  <div
                    className={`inline-flex h-9 w-14 items-center justify-center rounded-full border text-xs font-black ${rankAccent(leader.rank)}`}
                  >
                    {leader.rank === 1 ? "🏆 #1" : `#${leader.rank}`}
                  </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">{leader.user}</div>
                          <div className="truncate text-xs text-secondary-text">Accepted solve</div>
                        </div>
                  <div className="font-bold text-white">{formatSolveTime(leader.solveTime)}</div>
                  <div className="flex items-start">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${languageTone(leader.language)}`}>
                      {normalizedLanguage(leader.language)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Link
                      href={`/replay/${leader.replayId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/20 hover:shadow-[0_10px_20px_rgba(139,92,246,0.18)]"
                    >
                      ▶ Replay
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-secondary-text">
                <div className="text-base font-bold text-white">🏆 No leaderboard entries yet</div>
                <div className="mt-2">Be the first solver to claim Rank #1.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      await callJudge("/api/submissions/run");
    } catch (error) {
      setConsoleOpen(true);
      setConsoleLogs(error instanceof Error ? error.message : "Run failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      await callJudge("/api/submissions");
    } catch (error) {
      setConsoleOpen(true);
      setConsoleLogs(error instanceof Error ? error.message : "Submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishResize = (
    handlePointerMove: (moveEvent: globalThis.PointerEvent) => void,
    cursor: string,
  ) => {
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";

    const handlePointerUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleMainResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const nextWidth = (moveEvent.clientX / window.innerWidth) * 100;
      setLeftPanelWidth(Math.min(72, Math.max(28, nextWidth)));
    };

    finishResize(handlePointerMove, "col-resize");
  };

  const handlePanelResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = bottomPanelHeight;
    const rightPanelHeight = event.currentTarget.parentElement?.parentElement?.clientHeight ?? window.innerHeight;
    const maxHeight = Math.max(200, rightPanelHeight - 220);

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const nextHeight = startHeight + startY - moveEvent.clientY;
      setBottomPanelHeight(Math.min(maxHeight, Math.max(150, nextHeight)));
    };

    finishResize(handlePointerMove, "row-resize");
  };

  if (invalidProblemId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Problem not found</h1>
          <p className="mt-2 text-secondary-text">This problem link is no longer available.</p>
          <Link href="/problems" className="btn-primary mt-5 inline-flex h-10 items-center px-4 text-sm">
            Back to Problems
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 flex flex-col overflow-hidden bg-background">
      <SubmissionCelebrations
        toast={toast}
        onToastDismiss={() => setToast(null)}
        celebration={celebration}
        onCelebrationClose={() => setCelebration(null)}
      />
      {streakToast && (
        <div className="pointer-events-none fixed bottom-24 right-6 z-40 rounded-full border border-reward/30 bg-reward/10 px-4 py-2 text-sm font-bold text-reward shadow-[0_15px_30px_rgba(245,158,11,0.14)] xp-pop">
          {streakToast}
        </div>
      )}
      {levelToast && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-40 -translate-x-1/2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-bold text-success shadow-[0_15px_30px_rgba(34,197,94,0.14)] rank-up">
          ⭐ LEVEL UP! Level {levelToast.from} → Level {levelToast.to}
        </div>
      )}
      {/* Workbench Header */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-hover px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1 text-xs text-secondary-text hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-secondary-text">{problem.title}</span>
        </div>

        {/* Action Options */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as JudgeLanguage)}
            className="subtle-input rounded px-2 py-1 font-mono text-xs"
          >
            {SUPPORTED_LANGUAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            className="rounded border border-border bg-hover p-1.5 text-secondary-text transition-colors hover:text-white"
            title="Reset Starter Template"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main split workarea */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Side Panel: Description & Test Cases */}
        <div
          className="flex min-h-0 w-full min-w-0 flex-col bg-background/80 md:w-auto md:[flex-basis:var(--left-panel-width)]"
          style={leftPanelStyle}
        >
          <div className="flex overflow-x-auto border-b border-border bg-hover px-2">
            {leftTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setLeftTab(tab.id);
                    onTabSwitch(tab.id);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${leftTab === tab.id
                      ? "border-primary text-white"
                      : "border-transparent text-muted-foreground hover:text-secondary-text"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin">
            {leftTab === "description" && (
              <div className="prose prose-invert max-w-none text-secondary-text text-sm">
                <h1 className="text-lg font-bold text-white mb-2">{problem.title}</h1>
                <div className="flex items-center gap-3 mb-6 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded border ${problem.difficulty === "Very Easy"
                      ? "text-emerald-300 border-emerald-500 bg-emerald-500/20"
                      : problem.difficulty === "Easy"
                        ? "text-success border-success bg-success/20"
                        : problem.difficulty === "Medium"
                          ? "text-primary0 border-primary bg-primary/20"
                          : "text-destructive border-destructive bg-destructive/20"
                    }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-muted-foreground">Level: {problem.level}</span>
                  <span className="text-muted-foreground">Topic: {problem.topic}</span>
                </div>
                <div className="mb-5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3 text-secondary-text">
                    <span className="font-semibold text-white">XP Reward:</span>
                    <span className="font-semibold text-primary">+{problem.xpReward} XP</span>
                    <span className="font-semibold text-white">Coin Reward:</span>
                    <span className="font-semibold text-reward">+{problem.coinReward} Coins</span>
                    {activeLiveCash > 0 ? (
                      <>
                        <span className="font-semibold text-white">Cash Reward:</span>
                        <span className="font-semibold text-success">₹{activeLiveCash}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLeftTab("leaderboard")}
                  className="group mb-5 w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-hover/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white">
                        🏆 Fastest Solver: {leaders[0]?.username || leaders[0]?.user || "Loading..."} ({leaders[0] ? formatSolveTime(leaders[0].solveTime) : "--"})
                      </div>
                      <div className="mt-1 text-xs text-secondary-text">{leadersTotal || leaders.length || 0} accepted solvers</div>
                    </div>
                    <span className="text-xs font-semibold text-primary transition-transform duration-200 group-hover:translate-x-0.5">View Leaderboard →</span>
                  </div>
                </button>
                <div className="hidden mb-5 rounded-2xl border border-border bg-card p-4" aria-hidden="true">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">🏆 Fastest Solvers</div>
                      <div className="mt-1 text-xs text-secondary-text">Top accepted submissions for this problem.</div>
                    </div>
                    <Link href={`/problems/${problem.id}/leaderboard`} className="text-xs font-semibold text-primary hover:underline">
                      View Full Leaderboard →
                    </Link>
                  </div>
                  <div className="mt-4 space-y-2">
                    {leadersLoading ? (
                      Array.from({ length: 3 }, (_, index) => (
                        <div key={index} className="h-12 animate-pulse rounded-xl border border-border bg-hover/60" />
                      ))
                    ) : leaders.length ? (
                      leaders.slice(0, 3).map((leader) => (
                        <div key={leader.replayId} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-xs font-black text-white">
                              #{leader.rank}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{leader.user}</div>
                              <div className="text-[11px] text-secondary-text">{leader.language}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-bold text-reward">{leader.solveTime}s</div>
                            <Link href={`/replay/${leader.replayId}`} className="rounded-full border border-border bg-hover px-3 py-1 text-xs font-semibold text-secondary-text hover:text-white">
                              ▶ Replay
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-secondary-text">
                        No accepted replays yet for this problem.
                      </div>
                    )}
                  </div>
                </div>
                {/* Embedded HTML Problem Description */}
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
              </div>
            )}

            {leftTab === "leaderboard" && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-white">🏆 Fastest Solvers</h1>
                    <p className="mt-2 text-sm leading-6 text-secondary-text">
                      Accepted submissions ranked by solve time, with replay access for each entry.
                    </p>
                  </div>
                  <Link href={`/problems/${problem.id}/leaderboard`} className="mt-1 text-xs font-semibold text-primary hover:underline">
                    View Full Leaderboard →
                  </Link>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  {renderLeaderboard()}
                </div>
              </div>
            )}

            {leftTab === "editorial" && (
              <div className="space-y-6 text-sm text-secondary-text">
                <div>
                  <h1 className="text-lg font-bold text-white">Editorial</h1>
                  <p className="mt-2 leading-6 text-secondary-text">{problem.editorial.overview}</p>
                </div>
                <div>
                  <h2 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Approach</h2>
                  <ol className="space-y-3">
                    {problem.editorial.approach.map((step, index) => (
                      <li key={step} className="flex gap-3 rounded border border-border bg-card p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="leading-6">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded border border-border bg-hover p-4">
                    <div className="text-xs font-mono uppercase text-muted-foreground">Time</div>
                    <div className="mt-1 font-mono text-sm font-bold text-white">{problem.editorial.complexity.time}</div>
                  </div>
                  <div className="rounded border border-border bg-hover p-4">
                    <div className="text-xs font-mono uppercase text-muted-foreground">Space</div>
                    <div className="mt-1 font-mono text-sm font-bold text-white">{problem.editorial.complexity.space}</div>
                  </div>
                </div>
              </div>
            )}

            {leftTab === "solutions" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-lg font-bold text-white">Optimized Solutions</h1>
                  <p className="mt-2 text-sm leading-6 text-secondary-text">
                    Reference implementations that pass this problem with the intended complexity.
                  </p>
                </div>
                {problem.optimizedSolutions.map((solution) => (
                  <div key={solution.language} className="overflow-hidden rounded border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div className="text-sm font-bold text-white">{solution.label}</div>
                      <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        Optimized
                      </span>
                    </div>
                    <p className="px-4 py-3 text-sm leading-6 text-secondary-text">{solution.explanation}</p>
                    <pre className="overflow-x-auto border-t border-border bg-black/25 p-4 text-xs leading-5 text-foreground">
                      <code>{solution.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {leftTab === "discussions" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-lg font-bold text-white">Discussions</h1>
                  <p className="mt-2 text-sm leading-6 text-secondary-text">
                    Community notes, pitfalls, and hints for this problem.
                  </p>
                </div>
                {problem.discussions.map((discussion) => (
                  <article key={discussion.id} className="rounded border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-white">{discussion.title}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {discussion.author} / {discussion.role} / {discussion.postedAgo}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded border border-border bg-hover px-2 py-1 text-xs text-secondary-text">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {discussion.upvotes}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary-text">{discussion.body}</p>
                    <div className="mt-4 text-xs font-semibold text-muted-foreground">{discussion.replies} replies</div>
                  </article>
                ))}
              </div>
            )}

            {leftTab === "testcases" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 font-bold">SAMPLE TEST CASES</h3>
                  <div className="flex gap-2 mb-4">
                    {problem.testCases.map((tc) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTestCase(tc.id)}
                        className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${selectedTestCase === tc.id
                            ? "bg-card border-border text-white"
                            : "bg-card border-border text-secondary-text hover:text-white"
                          }`}
                      >
                        Case {tc.id}
                      </button>
                    ))}
                  </div>

                  {/* Render Selected Case */}
                  {problem.testCases.map((tc) => {
                    if (tc.id !== selectedTestCase) return null;
                    return (
                      <div key={tc.id} className="space-y-3 font-mono text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Input:</span>
                          <pre className="rounded border border-border bg-hover p-3 text-secondary-text">{tc.input}</pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Expected Output:</span>
                          <pre className="rounded border border-border bg-hover p-3 text-secondary-text">{tc.expected}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          onPointerDown={handleMainResizeStart}
          className="group hidden w-2 shrink-0 cursor-col-resize items-center justify-center border-x border-border bg-[#111318] transition-colors hover:bg-white/[0.06] md:flex"
          title="Resize panels"
        >
          <div className="h-12 w-1 rounded-full bg-border transition-colors group-hover:bg-secondary-text" />
        </div>

        {/* Right Side Panel: Editor & Code Execution Console */}
        <div
          className="relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#1e1e1e] md:w-auto md:[flex-basis:var(--right-panel-width)]"
          style={rightPanelStyle}
        >
          <div className="min-h-[180px] flex-1 overflow-hidden" onPaste={onPaste}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={languageById(language).monaco}
              value={code}
              onMount={(editor) => {
                editor.onDidPaste((event) => {
                  const pastedText = event.clipboardEvent?.clipboardData?.getData("text") ?? "";
                  recordPaste(pastedText, "monaco");
                });
              }}
              onChange={(val, ev) => {
                const nextCode = val || "";
                setCode(nextCode);
                if (ev?.changes?.length) {
                  let insertedChars = 0;
                  let insertedLines = 0;
                  for (const change of ev.changes) {
                    const text = change.text ?? "";
                    if (!text) continue;
                    insertedChars += text.length;
                    insertedLines += text.split(/\r?\n/).length;
                  }
                  if (insertedChars > 100 || insertedLines >= 3) {
                    console.log("[replay] large insert detected", { insertedChars, insertedLines });
                    recordLargeInsert(insertedChars, insertedLines);
                  }
                }
                scheduleSnapshot(nextCode);
              }}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: '"Fira Code", "Geist Mono", monospace',
                lineHeight: 20,
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
                padding: { top: 12 },
                cursorBlinking: "smooth",
                smoothScrolling: true,
                renderLineHighlight: "all",
              }}
            />
          </div>

          {/* Testcase and Console Panel */}
          <div
            className={`flex shrink-0 flex-col border-t border-border bg-background ${consoleOpen ? "" : "h-11"
              }`}
            style={consoleOpen ? { height: `${bottomPanelHeight}px` } : undefined}
          >
            {consoleOpen && (
              <div
                onPointerDown={handlePanelResizeStart}
                className="group flex h-3 cursor-row-resize items-center justify-center bg-card"
                title="Resize panel"
              >
                <div className="h-1 w-12 rounded-full bg-border transition-colors group-hover:bg-secondary-text" />
              </div>
            )}

            <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-[#111318] px-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setBottomTab("testcase");
                    onTabSwitch("testcase");
                    setConsoleOpen(true);
                  }}
                  className={`flex h-8 items-center gap-1.5 rounded px-3 text-xs font-bold transition-colors ${bottomTab === "testcase" && consoleOpen
                      ? "bg-hover text-white"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-secondary-text"
                    }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Testcase
                </button>
                <button
                  onClick={() => {
                    setBottomTab("console");
                    onTabSwitch("console");
                    setConsoleOpen(true);
                  }}
                  className={`flex h-8 items-center gap-1.5 rounded px-3 text-xs font-bold transition-colors ${bottomTab === "console" && consoleOpen
                      ? "bg-hover text-white"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-secondary-text"
                    }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Console
                </button>
              </div>
              <button
                onClick={() => setConsoleOpen((current) => !current)}
                className="rounded px-2 py-1 text-xs font-mono uppercase text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {consoleOpen ? "Collapse" : "Expand"}
              </button>
            </div>

            {consoleOpen && (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#0d0f13] p-4">
                {bottomTab === "testcase" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {problem.testCases.map((tc) => (
                        <button
                          key={tc.id}
                          onClick={() => {
                            setSelectedTestCase(tc.id);
                            onTabSwitch(`case-${tc.id}`);
                          }}
                          className={`rounded px-3 py-1.5 text-xs font-bold transition-colors ${selectedTestCase === tc.id
                              ? "bg-border text-white"
                              : "bg-hover text-secondary-text hover:bg-hover hover:text-white"
                            }`}
                        >
                          Case {tc.id}
                        </button>
                      ))}
                    </div>

                    {problem.testCases.map((tc) => {
                      if (tc.id !== selectedTestCase) return null;
                      return (
                        <div key={tc.id} className="grid gap-3 text-xs lg:grid-cols-2">
                          <div>
                            <div className="mb-1.5 font-bold text-secondary-text">Input</div>
                            <pre className="min-h-20 overflow-x-auto rounded border border-border bg-hover p-3 font-mono leading-5 text-foreground">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <div className="mb-1.5 font-bold text-secondary-text">Expected Output</div>
                            <pre className="min-h-20 overflow-x-auto rounded border border-border bg-hover p-3 font-mono leading-5 text-foreground">
                              {tc.expected}
                            </pre>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {bottomTab === "console" && (
                  <div className="space-y-4 text-xs text-secondary-text">
                    {submissionSummary && (
                      <div className={`rounded-2xl border p-4 ${submissionSummary.status === "Accepted"
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                        }`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className={`text-sm font-bold ${submissionSummary.status === "Accepted" ? "text-success" : "text-destructive"}`}>
                              {submissionSummary.status === "Accepted" ? "✓ Accepted" : submissionSummary.status}
                            </div>
                            <div className="mt-1 text-secondary-text">
                              {submissionSummary.passedCount}/{submissionSummary.totalCount} Passed
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {submissionSummary.runtimeMs} ms Runtime
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-border bg-background/40 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Memory Usage</div>
                            <div className="mt-1 font-semibold text-white">N/A</div>
                          </div>
                          <div className="rounded-xl border border-border bg-background/40 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">XP Earned</div>
                            <div className="mt-1 font-semibold text-white">{submissionSummary.status === "Accepted" ? `+${problem.xpReward}` : 0}</div>
                          </div>
                          <div className="rounded-xl border border-border bg-background/40 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Coins Earned</div>
                            <div className="mt-1 font-semibold text-white">{submissionSummary.status === "Accepted" ? `+${problem.coinReward}` : 0}</div>
                          </div>
                          <div className="rounded-xl border border-border bg-background/40 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved</div>
                            <div className="mt-1 font-semibold text-white">{submissionSummary.saved ? "Yes" : "No"}</div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-border bg-background/40 p-3 font-mono text-[11px] leading-5 text-secondary-text">
                          <div className="break-all">Submission ID: {submissionSummary.submissionId || "Pending"}</div>
                          <div className="mt-1">Submitted on: {new Date(submissionSummary.submittedAt).toLocaleString()}</div>
                          {submissionSummary.databaseError && <div className="mt-1 text-destructive">Database: {submissionSummary.databaseError}</div>}
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">Test Cases</div>
                            <button
                              type="button"
                              onClick={() => setBottomTab("testcase")}
                              className="rounded-lg border border-border bg-hover px-3 py-1.5 text-xs font-semibold text-secondary-text transition-colors hover:text-white"
                            >
                              View Submission
                            </button>
                          </div>
                          <div className="space-y-2">
                            {submissionSummary.cases.length ? submissionSummary.cases.map((testCase) => (
                              <div key={testCase.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className={testCase.passed ? "text-success" : "text-destructive"}>
                                    {testCase.passed ? "Case " : "Case "}
                                    {testCase.id}
                                  </span>
                                  <span className={testCase.passed ? "text-success" : "text-destructive"}>
                                    {testCase.passed ? "✓ Passed" : "Failed"}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">{testCase.error ? "Error" : "Runtime n/a"}</div>
                              </div>
                            )) : (
                              <div className="rounded-xl border border-border bg-background/40 px-3 py-2 text-muted-foreground">
                                Test case results will appear here after a submission.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {consoleLogs ? (
                      <pre className="whitespace-pre-wrap font-mono leading-relaxed">{consoleLogs}</pre>
                    ) : (
                      <span className="text-muted-foreground">
                        Console is idle. Click &apos;Run Code&apos; or &apos;Submit Code&apos; to see judge output.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Workbench Footer Bar */}
          <div className="relative z-10 flex h-14 shrink-0 items-center justify-end border-t border-border bg-[#111318] px-4 shadow-[0_-12px_28px_rgba(0,0,0,0.24)]">
            <div className="flex gap-3">
              {/* Run Code */}
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-secondary-text" />
                {isRunning ? "Running" : "Run Code"}
              </button>

              {/* Submit Code */}
              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="btn-primary px-4 py-1.5 text-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSubmitting ? "Submitting" : "Submit Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
