"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Coins, Gift, Trophy, Wallet } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type HistoryItem = {
  id: string;
  type: string;
  source: string;
  amount: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  xp: "XP",
  coins: "Coins",
  cash: "Cash",
};

export default function RewardHistoryPage() {
  const { isSignedIn } = useUser();
  const [filter, setFilter] = useState("all");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch(`/api/rewards/history?type=${filter}&page=${page}&pageSize=10`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { history?: HistoryItem[]; total?: number } };
      setHistory(Array.isArray(payload.data?.history) ? payload.data.history : []);
      setTotal(Number(payload.data?.total ?? 0));
    };
    void sync();
  }, [filter, page]);

  const pages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="app-shell min-h-screen bg-background pb-10">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/rewards" className="btn-secondary h-10 gap-2 px-4 text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to Rewards
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            {isSignedIn ? "Your reward ledger" : "Sign in to view ledger"}
          </div>
        </div>

        <section className="surface-panel rounded-2xl border border-border p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Reward History</h1>
              <p className="mt-1 text-sm text-secondary-text">Timeline of XP, coins, cash, streaks, and withdrawals.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "xp", "coins", "cash", "withdrawals"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${filter === item ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-secondary-text"}`}
                >
                  {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {history.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-hover p-3">
                      {item.type === "xp" ? <Trophy className="h-4 w-4 text-primary" /> : item.type === "coins" ? <Coins className="h-4 w-4 text-reward" /> : <Gift className="h-4 w-4 text-success" />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {item.amount > 0 ? "+" : ""}
                        {item.type === "cash" ? `₹${Math.abs(item.amount)}` : `${Math.abs(item.amount)} ${typeLabels[item.type] ?? item.type}`}
                      </div>
                      <div className="mt-1 text-xs text-secondary-text">
                        {item.source.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {!history.length && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-secondary-text">
                No rewards yet.
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary h-9 px-3 text-xs" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>
                Previous
              </button>
              <button className="btn-secondary h-9 px-3 text-xs" disabled={page >= pages} onClick={() => setPage((v) => Math.min(pages, v + 1))}>
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
