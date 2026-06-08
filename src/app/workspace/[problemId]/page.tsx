"use client";

import { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { languageById, SUPPORTED_LANGUAGES, type JudgeLanguage } from "@/lib/languages";
import type { SolveRewardResult } from "@/lib/mockData";
import { Play, Send, ChevronLeft, RefreshCw, Terminal, FileText, Award, Coins, CheckCircle2 } from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] font-mono text-sm text-zinc-400">
      Loading editor...
    </div>
  ),
});

type JudgeResponse = {
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

export default function WorkspacePage({ params }: { params: Promise<{ problemId: string }> }) {
  const { problemId } = use(params);
  const { problems, solveProblem, isProblemSolved } = useApp();
  
  const problem = problems.find((p) => p.id === problemId) || problems[0];

  const [language, setLanguage] = useState<JudgeLanguage>("javascript");
  const [code, setCode] = useState(problem.starterCode.javascript);
  
  // Tabs: 'description' | 'testcases'
  const [leftTab, setLeftTab] = useState<"description" | "testcases">("description");
  
  // Console state
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<SolveRewardResult | null>(null);

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
      lines.push(`+${reward.xpGained} XP  +${reward.coinsGained} coins  +${reward.reputationGained} reputation`);
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

  const callJudge = async (endpoint: "/api/submissions/run" | "/api/submissions") => {
    setConsoleOpen(true);
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
    const result = (await response.json()) as JudgeResponse;

    let reward: SolveRewardResult | undefined;
    if (endpoint === "/api/submissions" && result.status === "Accepted") {
      reward = solveProblem(problem.id);
      if (reward.awarded) {
        setRewardBanner(reward);
      } else {
        setRewardBanner(null);
      }
    }

    setConsoleLogs(formatJudgeResponse(result, reward));
    return { result, reward };
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-1 flex-col bg-background">
      {rewardBanner?.awarded && (
        <div className="flex items-center justify-between gap-4 border-b border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-sm font-bold text-emerald-200">Accepted — problem solved!</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs font-mono text-emerald-100/90">
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />+{rewardBanner.xpGained} XP
                </span>
                <span className="inline-flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />+{rewardBanner.coinsGained} coins
                </span>
                <span>+{rewardBanner.reputationGained} reputation</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setRewardBanner(null)}
            className="text-xs font-mono uppercase text-emerald-200/70 hover:text-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {isProblemSolved(problem.id) && !rewardBanner?.awarded && (
        <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
          You have already solved this problem. Submit again to practice — no extra XP.
        </div>
      )}
      {/* Workbench Header */}
      <div className="flex h-11 items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-semibold text-zinc-300">{problem.title}</span>
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
            className="rounded border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition-colors hover:text-white"
            title="Reset Starter Template"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main split workarea */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Panel: Description & Test Cases */}
        <div className="flex w-full flex-col border-r border-white/10 bg-background/80 md:w-1/2">
          <div className="flex border-b border-white/10 bg-white/[0.04] px-2">
            <button
              onClick={() => setLeftTab("description")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                leftTab === "description"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              onClick={() => setLeftTab("testcases")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                leftTab === "testcases"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Test Cases
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            {leftTab === "description" ? (
              <div className="prose prose-invert max-w-none text-zinc-300 text-sm">
                <h1 className="text-lg font-bold text-white mb-2">{problem.title}</h1>
                <div className="flex items-center gap-3 mb-6 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded border ${
                    problem.difficulty === "Easy"
                      ? "text-emerald-400 border-emerald-950 bg-emerald-950/20"
                      : problem.difficulty === "Medium"
                      ? "text-amber-500 border-amber-950 bg-amber-950/20"
                      : "text-red-400 border-red-950 bg-red-950/20"
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-zinc-500">Level: {problem.level}</span>
                  <span className="text-zinc-500">Topic: {problem.topic}</span>
                </div>
                {/* Embedded HTML Problem Description */}
                <div
                  className="space-y-4"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3 font-bold">SAMPLE TEST CASES</h3>
                  <div className="flex gap-2 mb-4">
                    {problem.testCases.map((tc) => (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTestCase(tc.id)}
                        className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                          selectedTestCase === tc.id
                            ? "bg-zinc-800 border-zinc-700 text-white"
                            : "bg-zinc-900/50 border-zinc-900 text-zinc-400 hover:text-white"
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
                          <span className="text-zinc-500">Input:</span>
                          <pre className="rounded border border-white/10 bg-white/[0.04] p-3 text-zinc-300">{tc.input}</pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-zinc-500">Expected Output:</span>
                          <pre className="rounded border border-white/10 bg-white/[0.04] p-3 text-zinc-300">{tc.expected}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel: Editor & Code Execution Console */}
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden relative">
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={languageById(language).monaco}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
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

          {/* Code Execution Panel Overlay */}
          <div className={`flex flex-col border-t border-white/10 bg-background transition-all duration-300 ${
            consoleOpen ? "h-64" : "h-10"
          }`}>
            {/* Console Bar */}
            <div className="flex h-10 cursor-pointer select-none items-center justify-between border-b border-white/10 bg-white/[0.04] px-4"
                 onClick={() => setConsoleOpen(!consoleOpen)}>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Logs</span>
              </div>
              <button className="text-zinc-500 hover:text-white text-xs font-mono uppercase">
                {consoleOpen ? "Collapse" : "Expand"}
              </button>
            </div>

            {/* Console Output area */}
            <div className="flex-1 overflow-y-auto bg-black/20 p-4 font-mono text-xs text-zinc-400">
              {consoleLogs ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{consoleLogs}</pre>
              ) : (
                <span className="text-zinc-600">Console is idle. Click &apos;Run Code&apos; or &apos;Submit&apos; to execute logs.</span>
              )}
            </div>
          </div>

          {/* Workbench Footer Bar */}
          <div className="relative z-10 flex h-14 items-center justify-between border-t border-white/10 bg-white/[0.04] px-4">
            <button
              onClick={() => {
                setConsoleOpen(!consoleOpen);
                if (!consoleOpen && !consoleLogs) {
                  setConsoleLogs("Console initialized. Output will appear here.");
                }
              }}
              className="btn-secondary px-3.5 py-1.5 text-xs"
            >
              Console
            </button>

            <div className="flex gap-3">
              {/* Run Code */}
            <button
              onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
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
