"use client";

import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { DAILY_PRIZE_PROBLEMS } from "@/lib/mockData";

export default function RewardsPage() {
  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="surface-panel rounded-lg p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-success/20 bg-success/10">
              <Gift className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Rewards</h1>
              <p className="mt-1 text-sm text-secondary-text">Today&apos;s visible reward pool.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {DAILY_PRIZE_PROBLEMS.map((problem) => (
              <Link
                key={problem.id}
                href={`/workspace/${problem.id}`}
                className="interactive-card rounded-lg border border-border bg-card p-4"
              >
                <div className="text-sm font-black text-white">{problem.title}</div>
                <div className="mt-2 text-xs font-bold text-success">Reward: ₹{problem.prizeMoneyInr}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-black text-primary">
                  Solve Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
