"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Filter, Medal, Search, School, Trophy, Zap } from "lucide-react";
type LeaderboardEntry = {
  rank: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  college: string;
  streak: number;
  solvedCount: number;
  isPro: boolean;
  devRank: number;
};

export default function Rankings() {
  const [filterType, setFilterType] = useState<"global" | "college" | "friends" | "monthly">("global");
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const sync = async () => {
      const scope = filterType === "global" ? "global" : filterType;
      const response = await fetch(`/api/leaderboard?scope=${scope}&college=${encodeURIComponent("IIT")}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { success?: boolean; data?: { leaderboard?: LeaderboardEntry[] } };
      setLeaderboard(Array.isArray(payload.data?.leaderboard) ? payload.data.leaderboard : []);
    };
    void sync();
  }, [filterType]);

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const matchesQuery =
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.college.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (filterType === "college") return entry.college.includes("IIT") || entry.college.includes("BITS");
    if (filterType === "friends") return ["aravind_sharma", "code_ninja", "logic_bomb"].includes(entry.username);
    return true;
  });

  const filters = [
    ["global", "Global Leaderboard", "All time"],
    ["college", "College Arena", "Top colleges"],
    ["friends", "Friends League", "Mutuals"],
    ["monthly", "Monthly Reset", "June 2026"],
  ] as const;

  return (
    <div className="app-shell pb-12">
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              <Trophy className="h-6 w-6 text-primary" />
              Global Standings
            </h1>
            <p className="mt-1 text-sm text-secondary-text">Verified rankings will appear here once real submissions are available.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search coder or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="subtle-input h-10 w-full rounded-md pl-9 pr-4 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
          <aside className="surface-panel rounded-lg p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Ranking Scopes
            </h2>
            <div className="space-y-2">
              {filters.map(([value, label, helper]) => (
                <button
                  key={value}
                  onClick={() => setFilterType(value)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs font-bold transition-colors ${
                    filterType === value
                      ? "border-border bg-hover text-white"
                      : "border-transparent text-secondary-text hover:bg-hover hover:text-white"
                  }`}
                >
                  <span>{label}</span>
                  <span className="font-mono text-[10px] opacity-60">{helper}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="surface-panel overflow-hidden rounded-lg lg:col-span-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-hover font-mono text-muted-foreground">
                    <th className="w-12 px-4 py-3 text-center font-black">Rank</th>
                    <th className="px-4 py-3 font-black">Developer</th>
                    <th className="px-4 py-3 font-black">College</th>
                    <th className="px-4 py-3 text-center font-black">Streak</th>
                    <th className="px-4 py-3 text-center font-black">Solved</th>
                    <th className="px-4 py-3 text-right font-black">Global Rank</th>
                    <th className="px-4 py-3 text-right font-black">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeaderboard.map((entry) => {
                    return (
                      <tr key={entry.username} className="transition-colors hover:bg-hover">
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-secondary-text">
                          {entry.rank === 1 && <Trophy className="mx-auto h-4 w-4 text-primary" />}
                          {entry.rank === 2 && <Medal className="mx-auto h-4 w-4 text-secondary-text" />}
                          {entry.rank === 3 && <Medal className="mx-auto h-4 w-4 text-primary" />}
                          {entry.rank > 3 && entry.rank}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link href={`/profile/${entry.username}`} className="group flex items-center gap-2">
                            <Image src={entry.avatarUrl} alt="" width={24} height={24} className="h-6 w-6 rounded-full border border-border object-cover" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-foreground transition-colors group-hover:text-primary">{entry.username}</span>
                                {entry.isPro && (
                                  <span className="rounded border border-primary/20 bg-primary/10 px-1 text-[8px] font-black uppercase tracking-wider text-primary">
                                    PRO
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">{entry.fullName}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-secondary-text">
                          <div className="flex items-center gap-1">
                            <School className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="max-w-[180px] truncate">{entry.college}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-primary">
                          <span className="inline-flex items-center gap-0.5">
                            <Flame className="h-3.5 w-3.5 fill-current" />
                            {entry.streak}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-secondary-text">{entry.solvedCount}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-white">
                          <Zap className="mr-1 inline h-3.5 w-3.5 text-primary" />
                          {entry.devRank}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-secondary-text">{entry.xp.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="p-10 text-center">
                <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-bold text-secondary-text">No rankings yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Connect the judge and persist accepted submissions to fill this table.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
