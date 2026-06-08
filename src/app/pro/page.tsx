import Link from "next/link";
import { Clock, ShieldCheck, Trophy, BarChart3, Code2, ArrowLeft } from "lucide-react";

export default function ProPage() {
  return (
    <div className="app-shell">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to question bank
        </Link>

        <section className="surface-panel rounded-lg p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">NEXORITHM Membership Is Coming Soon</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
            Membership, payments, premium contests, visibility boosts, and subscription benefits are intentionally disabled for now. No checkout is simulated and no payment UI is active until Razorpay and backend entitlements are implemented.
          </p>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Trophy, title: "Premium Prize Contests", text: "Will unlock only after real contest operations and payout handling exist." },
            { icon: BarChart3, title: "Advanced Analytics", text: "Will use verified submission data from the judge and database." },
            { icon: Code2, title: "Advanced Practice Sets", text: "Will unlock curated tracks, timed ladders, and deeper progress analytics." },
            { icon: ShieldCheck, title: "Entitlements", text: "Will be activated by signed Razorpay webhooks, not browser state." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface-card rounded-lg p-5">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{item.text}</p>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
