"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

type RuntimeCheck = {
  diagnostics: Array<{
    language: string;
    runtimeFound: boolean;
    compilerFound: boolean;
    version: string;
    executionMode: string;
  }>;
  selfTests: Array<{
    language: string;
    passed: boolean;
    status: string;
    message: string;
    runtimeMs: number;
    executionMode: string;
  }>;
  allPassing: boolean;
};

export default function JudgeHealthPage() {
  const [data, setData] = useState<RuntimeCheck | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/admin/runtime-check", { cache: "no-store", credentials: "include" });
      const text = await response.text();
      if (!response.ok) {
        console.warn("judge-health runtime-check failed", {
          status: response.status,
          statusText: response.statusText,
          body: text,
        });
        setError(`Runtime check failed (${response.status}): ${response.statusText}`);
        return;
      }
      const payload = JSON.parse(text) as { data?: RuntimeCheck };
      setData(payload.data ?? null);
      setLastChecked(new Date().toISOString());
      setError(null);
    };
    void sync();
  }, []);

  return (
    <div className="landing-shell min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-white">Judge Health</h1>
              <p className="mt-1 text-sm text-secondary-text">Blocking dashboard for runtime stability.</p>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-bold ${data?.allPassing ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-rose-400/30 bg-rose-400/10 text-rose-100"}`}>
              {data?.allPassing ? "Release Unblocked" : "Release Blocked"}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">Last Checked: {lastChecked ?? "Pending"}</div>
          {error ? <div className="mt-2 text-sm text-rose-200">{error}</div> : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-white/[0.04]">
              {data?.diagnostics?.map((row) => (
                <div key={row.language} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr] md:items-center">
                  <div className="font-semibold text-white">{row.language}</div>
                  <div className="text-sm text-secondary-text">Compiler Found: {row.compilerFound ? "Yes" : "No"}</div>
                  <div className="text-sm text-secondary-text">Runtime Found: {row.runtimeFound ? "Yes" : "No"}</div>
                  <div className="text-sm text-secondary-text">Version: {row.version}</div>
                  <div className="text-sm text-secondary-text">Mode: {row.executionMode}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-white/[0.04]">
              {data?.selfTests?.map((test) => (
                <div key={test.language} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1fr_1fr_1fr] md:items-center">
                  <div className="font-semibold text-white">{test.language}</div>
                  <div className="text-sm text-secondary-text">Run Test Result: {test.passed ? "Pass" : "Fail"}</div>
                  <div className="text-sm text-secondary-text">Status: {test.status}</div>
                  <div className="text-sm text-secondary-text">Mode: {test.executionMode}</div>
                  <div className="text-sm text-secondary-text">Checked: {test.runtimeMs}ms</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
