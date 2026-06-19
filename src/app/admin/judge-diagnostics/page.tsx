"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type DiagnosticRow = {
  language: string;
  runtimeFound: boolean;
  compilerFound: boolean;
  version: string;
  executionMode: string;
  runtimePath?: string | null;
  compilerPath?: string | null;
};

export default function JudgeDiagnosticsPage() {
  const [rows, setRows] = useState<DiagnosticRow[]>([]);

  useEffect(() => {
    const sync = async () => {
      const response = await fetch("/api/admin/judge-diagnostics", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data?: { diagnostics?: DiagnosticRow[] } };
      setRows(Array.isArray(payload.data?.diagnostics) ? payload.data!.diagnostics : []);
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
          <h1 className="text-2xl font-black text-white">Judge Diagnostics</h1>
          <p className="mt-1 text-sm text-secondary-text">Toolchain availability and execution mode by language.</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-white/[0.04]">
              {rows.map((row) => (
                <div key={row.language} className="grid gap-3 px-4 py-4 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center">
                  <div className="font-semibold text-white">{row.language}</div>
                  <div className="text-sm text-secondary-text">Runtime: {row.runtimeFound ? "Found" : "Missing"}</div>
                  <div className="text-sm text-secondary-text">Compiler: {row.compilerFound ? "Found" : "Missing"}</div>
                  <div className="text-sm text-secondary-text">Version: {row.version}</div>
                  <div className="text-sm text-secondary-text">Mode: {row.executionMode}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
