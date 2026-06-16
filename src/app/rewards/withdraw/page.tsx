"use client";

import Link from "next/link";
import { ArrowLeft, BadgeIndianRupee, CircleDollarSign, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { useApp } from "@/context/AppContext";

const badgeTiers = [
  { title: "Starter Badge", coins: 100, badgeValue: "Rs 5", perk: "Unlocks your first withdrawal tier" },
  { title: "Builder Badge", coins: 250, badgeValue: "Rs 15", perk: "Best for steady daily solving" },
  { title: "Elite Badge", coins: 500, badgeValue: "Rs 35", perk: "Reserved for strong streaks" },
  { title: "Champion Badge", coins: 1000, badgeValue: "Rs 80", perk: "Highest visible badge tier" },
];

export default function WithdrawBadgesPage() {
  const { user } = useApp();

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
            Withdraw badge wallet
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
                  <h1 className="text-3xl font-black text-white">Withdraw Badges</h1>
                  <p className="mt-1 text-sm text-secondary-text">Choose a badge tier that matches your coin balance.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {badgeTiers.map((badge) => {
                  const canWithdraw = user.coins >= badge.coins;
                  return (
                    <div
                      key={badge.title}
                      className={`rounded-[24px] border p-5 ${canWithdraw ? "border-success/30 bg-success/5" : "border-border bg-card/60"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-white">{badge.title}</p>
                          <p className="mt-1 text-sm text-secondary-text">{badge.perk}</p>
                        </div>
                        <div className={`rounded-2xl px-3 py-2 text-xs font-bold ${canWithdraw ? "bg-success/10 text-success" : "bg-black/20 text-secondary-text"}`}>
                          {canWithdraw ? "Available" : "Locked"}
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-secondary-text">Badge cost</p>
                          <p className="mt-1 text-2xl font-black text-white">{badge.coins} Coins</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-secondary-text">Withdraw value</p>
                          <p className="mt-1 text-xl font-black text-reward">{badge.badgeValue}</p>
                        </div>
                      </div>

                      <button
                        disabled={!canWithdraw}
                        className={`mt-5 h-11 w-full rounded-xl border text-sm font-bold transition ${
                          canWithdraw
                            ? "border-success/30 bg-success text-background hover:brightness-110"
                            : "border-border bg-black/20 text-secondary-text"
                        }`}
                      >
                        {canWithdraw ? "Withdraw Badge" : "Earn More Coins"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="surface-card rounded-[24px] border border-violet-500/30 p-5">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-black text-white">Wallet</h2>
                </div>

                <div className="mt-5 rounded-[22px] border border-border bg-black/20 p-4">
                  <p className="text-xs text-secondary-text">Current Coins</p>
                  <p className="mt-2 text-4xl font-black text-white">{user.coins}</p>
                  <p className="mt-2 text-sm text-secondary-text">Your rewards are tied to your real account.</p>
                </div>

                <div className="mt-4 rounded-[22px] border border-border bg-black/20 p-4">
                  <div className="flex items-center gap-2">
                    <BadgeIndianRupee className="h-4 w-4 text-reward" />
                    <p className="text-sm font-black text-white">Badge rules</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary-text">
                    Badges unlock as your coin balance grows. This page is the new badge withdrawal hub.
                  </p>
                </div>
              </div>

              <div className="surface-card rounded-[24px] border border-border p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-white">Next Step</h2>
                </div>
                <p className="mt-2 text-sm text-secondary-text">If you want, I can connect these buttons to a real withdrawal table in the database next.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
