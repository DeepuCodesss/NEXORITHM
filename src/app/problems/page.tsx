"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { MOCK_PROBLEMS, QUESTION_COUNT, type Difficulty } from "@/lib/mockData";

const difficultyOptions: Array<"All" | Difficulty> = ["All", "Easy", "Medium", "Hard", "Very Hard"];
const topics = ["All", ...Array.from(new Set(MOCK_PROBLEMS.map((problem) => problem.topic)))];
const pageSize = 100;

const difficultyClass = (difficulty: Difficulty) => {
  if (difficulty === "Easy") return "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";
  if (difficulty === "Medium") return "text-amber-300 border-amber-400/20 bg-amber-400/10";
  if (difficulty === "Hard") return "text-rose-300 border-rose-400/20 bg-rose-400/10";
  return "text-cyan-200 border-cyan-300/20 bg-cyan-300/10";
};

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [topic, setTopic] = useState("All");
  const [page, setPage] = useState(1);

  const filteredProblems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return MOCK_PROBLEMS.filter((problem) => {
      const matchesSearch =
        !query ||
        problem.title.toLowerCase().includes(query) ||
        problem.topic.toLowerCase().includes(query) ||
        problem.pattern.toLowerCase().includes(query) ||
        String(problem.level).includes(query);
      const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
      const matchesTopic = topic === "All" || problem.topic === topic;
      return matchesSearch && matchesDifficulty && matchesTopic;
    });
  }, [difficulty, searchQuery, topic]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleProblems = filteredProblems.slice((safePage - 1) * pageSize, safePage * pageSize);

  const updateDifficulty = (nextDifficulty: "All" | Difficulty) => {
    setDifficulty(nextDifficulty);
    setPage(1);
  };

  const updateTopic = (nextTopic: string) => {
    setTopic(nextTopic);
    setPage(1);
  };

  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <section className="surface-panel mb-8 rounded-lg p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-blue-200">
                <BookOpen className="h-3.5 w-3.5" />
                {QUESTION_COUNT.toLocaleString()} problems
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Problems</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Browse the complete algorithm ladder from basics to very hard problems. Filter by topic, difficulty, or level and jump straight into the workspace.
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-3xl">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search level, topic, pattern..."
                  className="subtle-input h-10 w-full rounded-md py-2 pl-9 pr-3 text-xs"
                />
              </div>
              <select
                value={difficulty}
                onChange={(event) => updateDifficulty(event.target.value as "All" | Difficulty)}
                className="subtle-input h-10 rounded-md px-3 text-xs"
              >
                {difficultyOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select
                value={topic}
                onChange={(event) => updateTopic(event.target.value)}
                className="subtle-input h-10 rounded-md px-3 text-xs"
              >
                {topics.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Full Catalog</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Showing {visibleProblems.length} of {filteredProblems.length.toLocaleString()} matching problems.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-500">
              <Filter className="h-3.5 w-3.5" />
              Page {safePage} of {totalPages}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <div className="hidden grid-cols-[72px_1fr_140px_130px_120px] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 md:grid">
              <span>Level</span>
              <span>Problem</span>
              <span>Topic</span>
              <span>Difficulty</span>
              <span className="text-right">Action</span>
            </div>

            {visibleProblems.map((problem) => (
              <Link
                key={problem.id}
                href={`/workspace/${problem.id}`}
                className="grid gap-3 border-b border-white/5 px-4 py-4 text-xs transition-colors last:border-b-0 hover:bg-white/[0.04] md:grid-cols-[72px_1fr_140px_130px_120px]"
              >
                <span className="font-mono text-zinc-500">#{problem.level}</span>
                <div>
                  <div className="font-bold text-zinc-100">{problem.title}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">{problem.pattern}</div>
                </div>
                <span className="text-zinc-400">{problem.topic}</span>
                <span className={`w-fit self-start rounded border px-2 py-0.5 text-[10px] font-bold ${difficultyClass(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary md:justify-end">
                  Solve
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className="btn-secondary h-10 gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <div className="text-center text-xs font-semibold text-zinc-500">
              {filteredProblems.length.toLocaleString()} results
            </div>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className="btn-secondary h-10 gap-1 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
