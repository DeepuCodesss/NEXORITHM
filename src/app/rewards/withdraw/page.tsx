"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CircleDollarSign, Clock3, IndianRupee, ShieldCheck, WalletCards } from "lucide-react";
import { useApp } from "@/context/AppContext";

type WithdrawalRequest = {
  id: string;
  amount: number;
  upiId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function WithdrawPage() {
  const { user } = useApp();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/withdrawals", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { currentBalance?: number; availableBalance?: number; withdrawalRequests?: WithdrawalRequest[] };
      };
      setCurrentBalance(Number(payload.data?.currentBalance ?? user.moneyEarnedInr ?? 0));
      setAvailableBalance(Number(payload.data?.availableBalance ?? user.moneyEarnedInr ?? 0));
      setWithdrawals(Array.isArray(payload.data?.withdrawalRequests) ? payload.data.withdrawalRequests : []);
    };

    void sync();
  }, [user.moneyEarnedInr]);

  const handleSubmit = async () => {
    setMessage("");
    const value = Math.floor(Number(amount));
    const response = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: value, upiId }),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;
    if (!response.ok) {
      setMessage(payload?.error || payload?.message || "Unable to create withdrawal request.");
      return;
    }
    setMessage("Withdrawal requested. Your money will be transferred to your bank under 10 minutes.");
    setAmount("");
    setUpiId("");
    const refreshResponse = await fetch("/api/withdrawals", { cache: "no-store" });
    if (!refreshResponse.ok) return;
    const refreshPayload = (await refreshResponse.json()) as {
      success?: boolean;
      data?: { currentBalance?: number; availableBalance?: number; withdrawalRequests?: WithdrawalRequest[] };
    };
    setCurrentBalance(Number(refreshPayload.data?.currentBalance ?? user.moneyEarnedInr ?? 0));
    setAvailableBalance(Number(refreshPayload.data?.availableBalance ?? user.moneyEarnedInr ?? 0));
    setWithdrawals(Array.isArray(refreshPayload.data?.withdrawalRequests) ? refreshPayload.data.withdrawalRequests : []);
  };

  const pendingExists = withdrawals.some((request) => request.status === "pending");

  return (
    <div className="app-shell min-h-screen bg-background pb-10">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/rewards" className="btn-secondary h-10 gap-2 px-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Rewards
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-secondary-text">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Cash-out center
          </div>
        </div>

        <section className="surface-panel overflow-hidden rounded-[28px] border border-border/80 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  <WalletCards className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Withdraw</h1>
                  <p className="mt-1 text-sm text-secondary-text">Request a payout from your earned cash balance.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <StatCard icon={CircleDollarSign} label="Current Balance" value={`₹${currentBalance.toLocaleString()}`} />
                <StatCard icon={IndianRupee} label="Available to Withdraw" value={`₹${availableBalance.toLocaleString()}`} />
              </div>

              <div className="mt-6 rounded-[24px] border border-border bg-card p-5">
                <h2 className="text-lg font-black text-white">Request Withdrawal</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Amount
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      type="number"
                      min={1}
                      max={availableBalance}
                      className="subtle-input mt-2 h-11 w-full rounded-xl px-3 text-sm"
                      placeholder="50"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    UPI ID
                    <input
                      value={upiId}
                      onChange={(event) => setUpiId(event.target.value)}
                      type="text"
                      className="subtle-input mt-2 h-11 w-full rounded-xl px-3 text-sm"
                      placeholder="Enter your UPI ID"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-secondary-text">
                  <div>Duplicate pending requests are blocked.</div>
                </div>

                {message && <div className="mt-4 rounded-xl border border-border bg-hover p-3 text-sm text-white">{message}</div>}

                <button
                  onClick={handleSubmit}
                  disabled={pendingExists}
                  className="btn-primary mt-5 h-11 w-full gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Request Withdrawal
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <section className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-black text-white">Pending Requests</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {withdrawals.filter((item) => item.status === "pending").length ? (
                    withdrawals
                      .filter((item) => item.status === "pending")
                      .map((request) => (
                        <div key={request.id} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-white">₹{request.amount.toLocaleString()}</div>
                              <div className="text-xs text-secondary-text">{request.upiId}</div>
                            </div>
                            <span className="rounded-full border border-border bg-hover px-2 py-1 text-[10px] font-bold uppercase text-secondary-text">
                              pending
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</div>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-secondary-text">
                      No pending requests.
                    </div>
                  )}
                </div>
              </section>

              <section className="surface-card rounded-[24px] border border-border p-5">
                <h2 className="text-lg font-black text-white">Withdrawal History</h2>
                <div className="mt-4 space-y-3">
                  {withdrawals.length ? (
                    withdrawals.map((request) => (
                      <div key={request.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">₹{request.amount.toLocaleString()}</div>
                            <div className="text-xs text-secondary-text">{request.upiId}</div>
                          </div>
                          <span className="rounded-full border border-border bg-hover px-2 py-1 text-[10px] font-bold uppercase text-secondary-text">
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-secondary-text">
                      No withdrawal requests yet.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-4 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-bold text-secondary-text">{label}</div>
    </div>
  );
}
