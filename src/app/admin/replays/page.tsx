"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Play, Trash2 } from "lucide-react";

type ReplayRow = {
  id: string;
  solveTimeSeconds: number;
  language: string;
  pasteCount: number;
  pastedCharacters: number;
  runCount: number;
  tabSwitchCount: number;
  createdAt: string;
  user: { username: string; fullName: string };
  problem: { title: string; slug: string };
};

export default function AdminReplaysPage() {
  const [replays, setReplays] = useState<ReplayRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch(`/api/admin/replays?page=${page}&pageSize=20`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { replays?: ReplayRow[]; pagination?: { pages?: number } } };
      setReplays(Array.isArray(payload.data?.replays) ? payload.data!.replays : []);
      setPages(Math.max(1, payload.data?.pagination?.pages ?? 1));
    };
    void sync();
  }, [page]);

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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-white">Solution Replays</h1>
              <p className="mt-1 text-sm text-secondary-text">First accepted replays only. Small JSON payloads, no media files.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Page {page} of {pages}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-white/[0.04]">
              {replays.map((replay) => (
                <div key={replay.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{replay.user.fullName || replay.user.username}</div>
                    <div className="text-xs text-secondary-text">{replay.problem.title} • {replay.language}</div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{replay.solveTimeSeconds}s</span>
                    <span>{JSON.stringify(replay).length} bytes</span>
                    <Link href={`/replay/${replay.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-hover px-3 py-2 font-semibold text-secondary-text hover:text-white">
                      <Play className="h-3.5 w-3.5" />
                      View Replay
                    </Link>
                    <button onClick={() => deleteReplay(replay.id)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-hover px-3 py-2 font-semibold text-secondary-text hover:text-white">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Page {page} of {pages}</div>
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
