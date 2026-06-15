"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";

export default function ContestsPage() {
  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="surface-panel rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Contests</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary-text">
                Scheduled contests will appear here once live contest rounds are connected. For now, practice from the question bank and daily challenges.
              </p>
              <Link href="/problems" className="btn-primary mt-5 h-10 gap-2 px-4 text-xs">
                Open Problems
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
