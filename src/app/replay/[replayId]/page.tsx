"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { calculatePasteContribution, pasteContributionLabel, trustLevelForScore } from "@/lib/replay";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-secondary-text">Loading replay...</div>,
});

type ReplayEvent =
  | { type: "snapshot"; timestamp: number; code: string }
  | { type: "run" | "submit" | "paste" | "tab_switch" | "tab_hidden" | "tab_visible" | "window_blur" | "window_focus"; timestamp: number; charsPasted?: number; linesPasted?: number; label?: string; meta?: Record<string, unknown> };

type ReplayData = {
  id: string;
  problemId: string;
  language: string;
  replayData: { events: ReplayEvent[]; stats: { pasteCount: number; pastedCharacters: number; runCount: number; tabSwitchCount: number; solveTimeSeconds: number; trustScore: number } };
  solveTimeSeconds: number;
  trustScore: number;
  pasteCount: number;
  pastedCharacters: number;
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
  const trustScore = replay?.replayData.stats.trustScore ?? replay?.trustScore ?? 100;
  const trustLevel = trustLevelForScore(trustScore);
  const finalCodeCharacters = useMemo(() => {
    const lastSnapshot = [...events].reverse().find((event) => event.type === "snapshot");
    return lastSnapshot?.type === "snapshot" ? lastSnapshot.code.length : 0;
  }, [events]);
  const pasteContribution = calculatePasteContribution(replay?.pastedCharacters ?? replay?.replayData.stats.pastedCharacters ?? 0, finalCodeCharacters);
  const pasteContributionTrust = pasteContributionLabel(pasteContribution);
  const eventLabel = (event: ReplayEvent) => {
    switch (event.type) {
      case "snapshot":
        return "Snapshot";
      case "paste":
        return "Pasted";
      case "run":
        return "Run";
      case "submit":
        return "Submit";
      case "tab_hidden":
        return "Tab hidden";
      case "tab_visible":
        return "Tab visible";
      case "tab_switch":
        return "Tab switch";
      case "window_blur":
        return "Window blur";
      case "window_focus":
        return "Window focus";
    }
    return "Event";
  };

  useEffect(() => {
    if (!playing || !events.length) return;
    const timer = window.setInterval(() => {
      setCursor((current) => {
        const next = current + 1;
        if (next >= events.length) {
          window.clearInterval(timer);
          setPlaying(false);
          return current;
        }
        const event = events[next];
        if (event.type === "snapshot") setCode(event.code);
        return next;
      });
    }, Math.max(350, 1000 / speed));
    return () => window.clearInterval(timer);
  }, [events, playing, speed]);

  const restart = () => {
    const firstSnapshot = events.find((event) => event.type === "snapshot");
    setCode(firstSnapshot && firstSnapshot.type === "snapshot" ? firstSnapshot.code : "");
    setCursor(0);
    setPlaying(false);
  };

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
                  {replay?.user.fullName || replay?.user.username || "Coder"} • {replay?.language}
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
              <Editor
                height="100%"
                theme="vs-dark"
                language="javascript"
                value={code}
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
              />
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
                {events.map((event, index) => (
                  <div key={`${event.type}-${event.timestamp}-${index}`} className={`rounded-xl border px-3 py-2 text-sm ${index === cursor ? "border-primary bg-primary/10 text-white" : "border-border bg-background/50 text-secondary-text"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{eventLabel(event)}</span>
                      <span>{String(Math.floor(event.timestamp / 60)).padStart(2, "0")}:{String(event.timestamp % 60).padStart(2, "0")}</span>
                    </div>
                    {event.type === "snapshot" ? <div className="mt-1 truncate text-xs">{event.code.slice(0, 80) || "Empty snapshot"}</div> : null}
                    {event.type === "paste" ? <div className="mt-1 text-xs">Pasted {event.charsPasted ?? 0} chars</div> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold text-white">Trust Score</div>
              <div className="mt-2 text-3xl font-black text-white">{trustScore}/100</div>
              <div className="mt-1 text-xs text-secondary-text">{trustLevel}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-secondary-text">
                <div className="rounded-xl border border-border bg-background/40 p-3">Paste: <span className="font-semibold text-white">{replay?.pasteCount ?? 0}</span></div>
                <div className="rounded-xl border border-border bg-background/40 p-3">Tabs: <span className="font-semibold text-white">{replay?.tabSwitchCount ?? 0}</span></div>
              </div>
              <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Paste Contribution</div>
                <div className="mt-1 text-lg font-black text-white">{pasteContribution}%</div>
                <div className="mt-1 text-xs text-secondary-text capitalize">Trust impact: {pasteContributionTrust}</div>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm font-semibold text-white">Anti-Cheat Metadata</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-background/40 p-3">Paste Events: <span className="font-bold text-white">{replay?.pasteCount ?? 0}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Characters Pasted: <span className="font-bold text-white">{replay?.pastedCharacters ?? 0}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Run Attempts: <span className="font-bold text-white">{replay?.runCount ?? 0}</span></div>
                  <div className="rounded-xl border border-border bg-background/40 p-3">Tab Switches: <span className="font-bold text-white">{replay?.tabSwitchCount ?? 0}</span></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
