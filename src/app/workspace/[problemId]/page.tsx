"use client";

import { use, useEffect, useState, type CSSProperties, type ElementType, type PointerEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { languageById, SUPPORTED_LANGUAGES, type JudgeLanguage } from "@/lib/languages";
import type { SolveRewardResult } from "@/lib/mockData";
import SubmissionCelebrations, { type SubmissionCelebrationData, type SubmissionToastData } from "@/components/SubmissionCelebrations";
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  Coins,
  FileCode2,
  FileText,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Terminal,
  ThumbsUp,
  Clock3,
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

export default function WorkspacePage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = use(params);
  const { problems, solveProblem, isProblemSolved, user } = useApp();

  const problem = problems.find((p) => p.id === problemId) || problems[0];

  const [language, setLanguage] = useState<JudgeLanguage>("javascript");
  const [code, setCode] = useState(problem.starterCode.javascript);

  type LeftTab = "description" | "editorial" | "solutions" | "discussions" | "testcases";
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
  const [rewardBanner, setRewardBanner] = useState<SolveRewardResult | null>(null);
  const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary | null>(null);
  const [toast, setToast] = useState<SubmissionToastData | null>(null);
  const [celebration, setCelebration] = useState<SubmissionCelebrationData | null>(null);
  const [streakToast, setStreakToast] = useState<string | null>(null);
  const [levelToast, setLevelToast] = useState<{ from: number; to: number; title: string } | null>(null);

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

  const handleLanguageChange = (nextLanguage: JudgeLanguage) => {
    setLanguage(nextLanguage);
    setCode(problem.starterCode[nextLanguage]);
  };

  const handleResetCode = () => {
    if (confirm("Reset current editor code to default template?")) {
      setCode(problem.starterCode[language]);
    }
  };

  const formatJudgeResponse = (result: JudgeResponse, reward?: SolveRewardResult) => {
    if (result.error) return result.error;

    const lines = [
      `${result.status ?? "Unknown"}: ${result.message ?? "Judge finished."}`,
      `Passed ${result.passedCount ?? 0}/${result.totalCount ?? 0} cases in ${result.runtimeMs ?? 0}ms.`,
    ];

    if (reward?.awarded) {
      lines.push("");
      lines.push(`+${reward.xpGained} XP  +${reward.coinsGained} coins  +${reward.moneyGainedInr} INR  +${reward.reputationGained} reputation`);
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
        title: "Accepted",
        message: rewardBits.length ? rewardBits.join(" • ") : "Submission passed all checks.",
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        language,
        code,
      }),
    });
    const payload = (await response.json()) as JudgeResponse;
    const result = payload.data ?? payload;

    if (!response.ok || payload.success === false) {
      throw new Error(result.error || "Judge request failed.");
    }

    let reward: SolveRewardResult | undefined;
    if (endpoint === "/api/submissions" && result.status === "Accepted") {
      const beforeStreak = user.currentStreak;
      const beforeXp = user.xp;
      reward = solveProblem(problem.id);
      const status = (result.status as SubmissionStatus) ?? "Unknown";
      if (reward.awarded) {
        setRewardBanner(reward);
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
        setCelebration({
          problemTitle: problem.title,
          rewardLine: `+${reward.xpGained} XP • +${reward.coinsGained} Coins • 🔥 ${reward.currentStreak ?? beforeStreak} Day Streak`,
          xpGained: reward.xpGained,
          coinsGained: reward.coinsGained,
          moneyGainedInr: reward.moneyGainedInr,
          streak: reward.currentStreak ?? beforeStreak,
          levelBefore: beforeLevel,
          levelAfter: afterLevel,
          unlockedTitle: reward.unlockedTitle,
        });
      } else {
        setRewardBanner(null);
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

  const leftTabs: Array<{ id: LeftTab; label: string; icon: ElementType }> = [
    { id: "description", label: "Description", icon: FileText },
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
      {rewardBanner?.awarded && (
        <div className="flex items-center justify-between gap-4 border-b border-success/20 bg-success/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-bold text-success">Accepted — problem solved!</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs font-mono text-success/90">
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />+{rewardBanner.xpGained} XP
                </span>
                <span className="inline-flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />+{rewardBanner.coinsGained} coins
                </span>
                {rewardBanner.moneyGainedInr > 0 && <span>+₹{rewardBanner.moneyGainedInr} cash</span>}
                <span>+{rewardBanner.reputationGained} reputation</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setRewardBanner(null)}
            className="text-xs font-mono uppercase text-success/70 hover:text-success"
          >
            Dismiss
          </button>
        </div>
      )}

      {isProblemSolved(problem.id) && !rewardBanner?.awarded && (
        <div className="border-b border-border bg-card px-4 py-2 text-xs text-secondary-text">
          You have already solved this problem. Submit again to practice — no extra XP.
        </div>
      )}
      {/* Workbench Header */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-hover px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
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
                  onClick={() => setLeftTab(tab.id)}
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
                  <span className={`px-2 py-0.5 rounded border ${problem.difficulty === "Easy"
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
                {/* Embedded HTML Problem Description */}
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
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
          <div className="min-h-[180px] flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={languageById(language).monaco}
              value={code}
              onChange={(val) => setCode(val || "")}
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
                          onClick={() => setSelectedTestCase(tc.id)}
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
