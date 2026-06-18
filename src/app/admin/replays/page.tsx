"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Play, Trash2 } from "lucide-react";

type ReplayRow = {
  id: string;
  solveTimeSeconds: number;
  trustScore: number;
  language: string;
  pasteCount: number;
  pastedCharacters: number;
  runCount: number;
  tabSwitchCount: number;
  createdAt: string;
  user: { username: string; fullName: string };
  problem: { title: string; slug: string };
};

type SortKey = "newest" | "lowest_trust" | "highest_paste" | "most_tab_switches" | "fastest_solve";

const trustTone = (score: number) => {
  if (score >= 90) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (score >= 40) return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  return "border-rose-400/30 bg-rose-400/10 text-rose-100";
};

const trustLabel = (score: number) => {
  if (score >= 90) return "Trusted";
  if (score >= 40) return "Suspicious";
  return "High Risk";
};

export default function AdminReplaysPage() {
  const [replays, setReplays] = useState<ReplayRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    const sync = async () => {
      const response = await fetch(`/api/admin/replays?page=${page}&pageSize=20&sort=${sort}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { replays?: ReplayRow[]; pagination?: { pages?: number } } };
      setReplays(Array.isArray(payload.data?.replays) ? payload.data!.replays : []);
      setPages(Math.max(1, payload.data?.pagination?.pages ?? 1));
    };
    void sync();
  }, [page, sort]);

  const deleteReplay = async (id: string) => {
    if (!confirm("Delete this replay?")) return;
    const response = await fetch(`/api/replays/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setReplays((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="landing-shell min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Replay Moderation</h1>
              <p className="mt-1 text-sm text-secondary-text">Trust score, paste pressure, and tab-switch analytics for replay review.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["newest", "Newest"],
                ["lowest_trust", "Lowest Trust"],
                ["highest_paste", "Highest Paste"],
                ["most_tab_switches", "Most Tabs"],
                ["fastest_solve", "Fastest Solve"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setPage(1);
                    setSort(key as SortKey);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${sort === key ? "border-primary bg-primary/10 text-primary" : "border-border bg-hover text-secondary-text hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-white/[0.04]">
              {replays.map((replay) => (
                <div key={replay.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{replay.user.fullName || replay.user.username}</div>
                    <div className="truncate text-xs text-secondary-text">{replay.problem.title}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{replay.solveTimeSeconds}s</span>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${trustTone(replay.trustScore)}`}>
                      {trustLabel(replay.trustScore)} · {replay.trustScore}/100
                    </span>
                    <span className="rounded-full border border-border bg-background/50 px-2 py-0.5 text-secondary-text">{replay.language}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Paste: {replay.pasteCount}</div>
                  <div className="text-xs text-muted-foreground">Chars: {replay.pastedCharacters}</div>
                  <div className="text-xs text-muted-foreground">Tabs: {replay.tabSwitchCount}</div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/replay/${replay.id}`} className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20">
                      <Play className="h-3.5 w-3.5" />
                      View Replay
                    </Link>
                    <button onClick={() => deleteReplay(replay.id)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-hover px-3 py-2 text-xs font-semibold text-secondary-text hover:text-white">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Page {page} of {pages}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="btn-secondary h-9 px-3 text-xs">Previous</button>
              <button onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page >= pages} className="btn-secondary h-9 px-3 text-xs">Next</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
