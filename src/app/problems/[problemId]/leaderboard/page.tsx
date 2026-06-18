"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Play } from "lucide-react";

type Leader = {
  rank: number;
  user: string;
  username: string;
  avatarUrl: string;
  solveTime: number;
  language: string;
  replayId: string;
};

export default function ProblemLeaderboardPage({ params }: { params: Promise<{ problemId: string }> }) {
  const [problemId, setProblemId] = useState("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void params.then((value) => setProblemId(value.problemId));
  }, [params]);

  useEffect(() => {
    if (!problemId) return;
    const sync = async () => {
      setLoading(true);
      const response = await fetch(`/api/problems/${problemId}/leaderboard?page=${page}&pageSize=50`, { cache: "no-store" });
      if (!response.ok) {
        setLeaders([]);
        setPages(1);
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { data?: { leaders?: Leader[]; pagination?: { pages?: number } } };
      setLeaders(Array.isArray(payload.data?.leaders) ? payload.data!.leaders : []);
      setPages(Math.max(1, payload.data?.pagination?.pages ?? 1));
      setLoading(false);
    };
    void sync();
  }, [problemId, page]);

  return (
    <div className="landing-shell min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href={`/workspace/${problemId}`} className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to problem
        </Link>
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-white">🏆 Fastest Solvers</h1>
              <p className="mt-1 text-sm text-secondary-text">Accepted solutions ranked by solve time and submission timestamp.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Top {leaders.length || 50}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-xl bg-hover/60" />
                ))}
              </div>
            ) : leaders.length ? (
              <div className="divide-y divide-white/[0.04]">
                {leaders.map((leader) => (
                  <div key={leader.replayId} className="flex items-center justify-between gap-4 bg-background/60 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-black text-white">
                        #{leader.rank}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{leader.user}</div>
                        <div className="text-xs text-secondary-text">{leader.language}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-black text-reward">{leader.solveTime}s</div>
                      <Link href={`/replay/${leader.replayId}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-hover px-3 py-2 text-xs font-semibold text-secondary-text hover:text-white">
                        <Play className="h-3.5 w-3.5" />
                        Replay
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-secondary-text">No replay data yet.</div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Page {page} of {pages}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="btn-secondary h-9 px-3 text-xs">
                Previous
              </button>
              <button onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page >= pages} className="btn-secondary h-9 px-3 text-xs">
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
