"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-secondary-text">Loading replay...</div>,
});

type ReplayEvent =
  | { type: "snapshot"; timestamp: number; code: string }
  | {
      type: "run" | "submit" | "paste" | "large_insert" | "tab_switch" | "tab_hidden" | "tab_visible" | "window_blur" | "window_focus";
      timestamp: number;
      charsPasted?: number;
      linesPasted?: number;
      charsInserted?: number;
      linesInserted?: number;
      label?: string;
      meta?: Record<string, unknown>;
    };

type ReplayData = {
  id: string;
  problemId: string;
  language: string;
  replayData: {
    events: ReplayEvent[];
    stats: { pasteCount: number; pastedCharacters: number; largeInsertCount: number; runCount: number; tabSwitchCount: number; solveTimeSeconds: number; trustScore: number };
  };
  solveTimeSeconds: number;
  trustScore: number;
  pasteCount: number;
  pastedCharacters: number;
  largeInsertCount: number;
  runCount: number;
  tabSwitchCount: number;
  user: { username: string; fullName: string };
  problem: { title: string };
};

const speedOptions = [1, 2, 4];

export default function ReplayPage({ params }: { params: Promise<{ replayId: string }> }) {
  const [replayId, setReplayId] = useState("");
  const [replay, setReplay] = useState<ReplayData | null>(null);
  const [code, setCode] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cursor, setCursor] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    void params.then((value) => setReplayId(value.replayId));
  }, [params]);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { user?: { publicMetadata?: { role?: string } | null } | null } };
      setIsAdmin(payload.data?.user?.publicMetadata?.role === "admin");
    };
    void sync();
  }, []);

  useEffect(() => {
    if (!replayId) return;
    const sync = async () => {
      const response = await fetch(`/api/replays/${replayId}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { replay?: ReplayData } };
      const loaded = payload.data?.replay ?? null;
      setReplay(loaded);
      const firstSnapshot = loaded?.replayData.events.find((event) => event.type === "snapshot");
      setCode(firstSnapshot && firstSnapshot.type === "snapshot" ? firstSnapshot.code : "");
      setCursor(0);
      setPlaying(false);
    };
    void sync();
  }, [replayId]);

  const events = useMemo(() => replay?.replayData.events ?? [], [replay]);
  const visibleEvents = useMemo(
    () => (isAdmin ? events : events.filter((event) => event.type === "snapshot" || event.type === "run" || event.type === "submit")),
    [events, isAdmin],
  );

  const eventLabel = (event: ReplayEvent) => {
    switch (event.type) {
      case "snapshot":
        return "Snapshot";
      case "run":
        return "Run";
      case "submit":
        return "Submit";
      case "paste":
        return "Paste";
      case "large_insert":
        return "Large insert";
      case "tab_switch":
        return "Tab switch";
      case "tab_hidden":
        return "Tab hidden";
      case "tab_visible":
        return "Tab visible";
      case "window_blur":
        return "Window blur";
      case "window_focus":
        return "Window focus";
    }
  };

  useEffect(() => {
    if (!playing || !visibleEvents.length) return;
    const timer = window.setInterval(() => {
      setCursor((current) => {
        const next = current + 1;
        if (next >= visibleEvents.length) {
          window.clearInterval(timer);
          setPlaying(false);
          return current;
        }
        const event = visibleEvents[next];
        if (event.type === "snapshot") setCode(event.code);
        return next;
      });
    }, Math.max(350, 1000 / speed));
    return () => window.clearInterval(timer);
  }, [visibleEvents, playing, speed]);

  const restart = () => {
    const firstSnapshot = visibleEvents.find((event) => event.type === "snapshot");
    setCode(firstSnapshot && firstSnapshot.type === "snapshot" ? firstSnapshot.code : "");
    setCursor(0);
    setPlaying(false);
  };

  const adminCounts = useMemo(() => {
    const stats = replay?.replayData.stats;
    const windowBlurCount = events.filter((event) => event.type === "window_blur").length;
    const largeInsertCount = events.filter((event) => event.type === "large_insert").length;
    return {
      trustScore: stats?.trustScore ?? replay?.trustScore ?? 100,
      pasteCount: stats?.pasteCount ?? replay?.pasteCount ?? 0,
      pastedCharacters: stats?.pastedCharacters ?? replay?.pastedCharacters ?? 0,
      tabSwitchCount: stats?.tabSwitchCount ?? replay?.tabSwitchCount ?? 0,
      largeInsertCount: stats?.largeInsertCount ?? replay?.largeInsertCount ?? largeInsertCount,
      windowBlurCount,
    };
  }, [events, replay]);

  return (
    <div className="landing-shell min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href={replay ? `/workspace/${replay.problemId}` : "/problems"} className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">{replay?.problem.title ?? "Replay"}</h1>
                <p className="mt-1 text-sm text-secondary-text">
                  {replay?.user.fullName || replay?.user.username || "Coder"} â€¢ {replay?.language}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPlaying((v) => !v)} className="btn-primary h-10 gap-2 px-4 text-sm">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? "Pause" : "Play"}
                </button>
                <button onClick={restart} className="btn-secondary h-10 gap-2 px-4 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              </div>
            </div>
            <div className="mt-4 h-[620px] overflow-hidden rounded-2xl border border-border bg-[#1e1e1e]">
              <Editor height="100%" theme="vs-dark" language="javascript" value={code} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, automaticLayout: true }} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Timeline</div>
                <div className="flex gap-1">
                  {speedOptions.map((option) => (
                    <button key={option} onClick={() => setSpeed(option)} className={`rounded px-2 py-1 text-xs font-bold ${speed === option ? "bg-primary text-white" : "bg-hover text-secondary-text"}`}>
                      {option}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {visibleEvents.map((event, index) => (
                  <div key={`${event.type}-${event.timestamp}-${index}`} className={`rounded-xl border px-3 py-2 text-sm ${index === cursor ? "border-primary bg-primary/10 text-white" : "border-border bg-background/50 text-secondary-text"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{eventLabel(event)}</span>
                      <span>
                        {String(Math.floor(event.timestamp / 60)).padStart(2, "0")}:{String(event.timestamp % 60).padStart(2, "0")}
                      </span>
                    </div>
                    {event.type === "snapshot" ? <div className="mt-1 truncate text-xs">{event.code.slice(0, 80) || "Empty snapshot"}</div> : null}
                    {isAdmin && event.type === "paste" ? <div className="mt-1 text-xs">Pasted {event.charsPasted ?? 0} chars</div> : null}
                    {isAdmin && event.type === "large_insert" ? (
                      <div className="mt-1 text-xs">
                        Large insert {event.charsInserted ?? 0} chars{typeof event.linesInserted === "number" ? ` / ${event.linesInserted} lines` : ""}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm font-semibold text-white">Anti-Cheat Metadata</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-background/40 p-3">Trust Score: <span className="font-bold text-white">{adminCounts.trustScore}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Paste Count: <span className="font-bold text-white">{adminCounts.pasteCount}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Characters Pasted: <span className="font-bold text-white">{adminCounts.pastedCharacters}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Tab Switch Count: <span className="font-bold text-white">{adminCounts.tabSwitchCount}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Large Insert Count: <span className="font-bold text-white">{adminCounts.largeInsertCount}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Window Blur Count: <span className="font-bold text-white">{adminCounts.windowBlurCount}</span></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
