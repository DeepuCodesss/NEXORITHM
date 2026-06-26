"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Code2,
  Globe,
  BarChart2,
  Trophy,
  Flag,
  Settings,
  Plus,
  Sparkles,
  X,
  Flame,
  Check,
  AlertTriangle,
  Terminal,
  Calendar,
  ShieldQuestion,
  ChevronRight
} from "lucide-react";

type SubActivity = {
  id: string;
  status: string;
  problemTitle: string;
  problemSlug: string;
  language: string;
  createdAt: string;
};

type ProfilePayload = {
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  solvedCount: number;
  globalRank: number | null;
  college: string;
  joinedDate: string;
  isPro: boolean;
  recentActivity: SubActivity[];
  heatmap: Record<string, number>;
  submissionsByWeek: number[];
  langDist: Array<{ lang: string; pct: number; count: number; color: string }>;
  submissionStats: {
    accepted: number;
    wrongAnswer: number;
    runtimeError: number;
    compileError: number;
    acceptanceRate: number;
    totalAttempts: number;
  };
  collegeRank: number | null;
  monthlyProgress: {
    accepted: number;
    xp: number;
    coins: number;
    solved: number;
  };
  streakCalendar: Array<{ dayName: string; solved: boolean; dateStr: string }>;
  hasSolvedToday: boolean;
};

type ProfileClientProps = {
  profile: ProfilePayload;
  isOwner: boolean;
};

export default function ProfileClient({ profile: initialProfile, isOwner }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfilePayload>(initialProfile);
  const [modalType, setModalType] = useState<"college" | "all-activity" | "all-languages" | "badges" | null>(null);
  const [collegeInput, setCollegeInput] = useState("");
  const [submittingCollege, setSubmittingCollege] = useState(false);
  const [collegeError, setCollegeError] = useState("");

  const handleConnectCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeInput.trim()) {
      setCollegeError("College name cannot be empty");
      return;
    }
    setSubmittingCollege(true);
    setCollegeError("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college: collegeInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh page or update local state
        setProfile((prev) => ({
          ...prev,
          college: collegeInput.trim(),
          // recalculate rankings dynamically locally or let server page handle reload
        }));
        setModalType(null);
        window.location.reload();
      } else {
        setCollegeError(data.error || "Failed to update college");
      }
    } catch (err) {
      console.error(err);
      setCollegeError("Network error. Please try again.");
    } finally {
      setSubmittingCollege(false);
    }
  };

  const heatmapEntries = Object.entries(profile.heatmap);
  const weeks: Array<Array<{ date: string; count: number }>> = [];
  let week: Array<{ date: string; count: number }> = [];
  heatmapEntries.forEach(([date, count], i) => {
    week.push({ date, count });
    if (week.length === 7 || i === heatmapEntries.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const maxBar = Math.max(...profile.submissionsByWeek, 1);
  const r = 32;
  const circ = 2 * Math.PI * r;
  const totalSolved = profile.solvedCount || 1;
  const easy = Math.round(profile.solvedCount * 0.6);
  const medium = Math.round(profile.solvedCount * 0.28);
  const hard = Math.max(0, profile.solvedCount - easy - medium);
  const ePct = easy / totalSolved;
  const mPct = medium / totalSolved;
  const hPct = hard / totalSolved;

  function timeAgo(iso: string) {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function heatColor(count: number) {
    if (count === 0) return "#1C2230";
    if (count === 1) return "#4C1D95";
    if (count <= 3) return "#6D28D9";
    if (count <= 6) return "#7C3AED";
    return "#A78BFA";
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Accepted":
        return { text: "Accepted", icon: Check, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" };
      case "Wrong Answer":
        return { text: "Wrong Answer", icon: X, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" };
      case "Runtime Error":
        return { text: "Runtime Error", icon: AlertTriangle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" };
      case "Compilation Error":
        return { text: "Compile Error", icon: Terminal, color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" };
      default:
        return { text: "Attempted", icon: ShieldQuestion, color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" };
    }
  };

  const hasNoCollege = !profile.college || profile.college.includes("Connect");

  return (
    <div className="flex-1 min-w-0 p-3 flex flex-col gap-2 relative overflow-hidden h-full">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A3242;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7C3AED;
        }
        @keyframes flow-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(76, 29, 149, 0.15), rgba(15, 17, 23, 0.4));
          background-size: 200% 200%;
          animation: flow-gradient 10s ease infinite;
        }
      `}} />

      {/* Row 1: Profile card / Hero */}
      <section className="rounded-xl border border-[#2A3242] bg-[#161B22] hero-gradient px-5 py-3 flex items-center justify-between gap-4 relative overflow-hidden shrink-0 transition-all hover:border-[#7C3AED]/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.05)]">
        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#A78BFA]/10 blur-[1px]"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 80 + 10}%`,
                bottom: "-10px",
              }}
              animate={{
                y: ["0px", "-100px"],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
          <div className="absolute right-0 top-0 h-full w-[350px] bg-gradient-to-l from-[#7C3AED]/10 to-transparent blur-3xl pointer-events-none" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="h-16 w-16 shrink-0 rounded-full border-2 border-[#7C3AED] overflow-hidden bg-[#1C2230] relative shadow-[0_0_12px_rgba(124,58,237,0.3)]">
            <Image src={profile.avatarUrl} alt="" width={64} height={64} unoptimized className="h-full w-full object-cover" />
            {profile.isPro && (
              <span className="absolute bottom-0 right-0 bg-[#7C3AED] text-white text-[7px] px-1 font-bold rounded-tl-md uppercase tracking-wider">
                Pro
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl font-black text-white tracking-tight">{profile.fullName}</h1>
              {profile.solvedCount > 0 && (
                <BadgeCheck className="h-4 w-4 fill-[#7C3AED] text-white shrink-0" />
              )}
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8]">@{profile.username}</p>
            <p className="text-[10px] text-[#64748B] mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Joined {new Date(profile.joinedDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>&bull;</span>
              <span>India 🇮🇳</span>
              {!hasNoCollege && (
                <>
                  <span>&bull;</span>
                  <span className="text-[#A78BFA] font-medium flex items-center gap-0.5">
                    🏛️ {profile.college}
                  </span>
                </>
              )}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {isOwner && (
                <Link
                  href="/settings"
                  className="flex items-center gap-1 rounded-md border border-[#2A3242] bg-[#0F1117] px-2.5 py-1 text-[9px] font-bold text-[#94A3B8] hover:text-white hover:border-[#7C3AED]/40 hover:bg-[#161B22] transition-all"
                >
                  <Settings className="h-3 w-3" /> Edit Profile
                </Link>
              )}
              {hasNoCollege && isOwner && (
                <button
                  onClick={() => setModalType("college")}
                  className="flex items-center gap-1 rounded-md border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-2.5 py-1 text-[9px] font-bold text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm"
                >
                  <Plus className="h-3 w-3" /> Connect College
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero right: Streak Summary card */}
        <div className="relative z-10 bg-[#0F1117]/60 backdrop-blur-md border border-[#2A3242] rounded-xl px-4 py-2 text-right hidden sm:block shadow-lg">
          <div className="flex items-center gap-1.5 justify-end mb-0.5">
            <span className="text-xs">🔥</span>
            <span className="text-[9px] text-[#64748B] uppercase tracking-wider">Current Streak</span>
          </div>
          <p className="text-2xl font-black text-white leading-none">
            {profile.currentStreak} <span className="text-xs font-semibold text-[#94A3B8]">Days</span>
          </p>
          <p className="text-[9px] text-[#64748B] mt-1 font-mono">
            {profile.hasSolvedToday ? (
              <span className="text-[#22C55E] font-medium">✓ Today's solve complete</span>
            ) : (
              <span className="text-[#F59E0B]">⏳ Solve today to save streak</span>
            )}
          </p>
        </div>
      </section>

      {/* Row 2: Stat cards */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        {[
          { label: "Current Streak", value: `${profile.currentStreak} Days`, emoji: "🔥", color: "#F97316" },
          { label: "Best Streak", value: `${profile.longestStreak} Days`, emoji: "📅", color: "#60A5FA" },
          {
            label: "Global Rank",
            value: profile.globalRank ? `#${profile.globalRank}` : "N/A",
            emoji: "🏆",
            color: "#FBBF24"
          },
          { label: "XP Points", value: profile.xp, emoji: null, isXP: true, color: "#A78BFA" },
          { label: "Wallet Balance", value: `${profile.coins} Coins`, emoji: "🪙", color: "#FBBF24" }
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#2A3242] bg-[#161B22] px-3 py-2.5 transition-all hover:border-[#2A3242]/80 hover:translate-y-[-1px]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider">{s.label}</span>
              {s.emoji && <span className="text-sm leading-none">{s.emoji}</span>}
              {s.isXP && (
                <span className="text-[8px] font-bold border border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#A78BFA] rounded px-1 py-0.5 leading-none">
                  XP
                </span>
              )}
            </div>
            <p className="text-lg font-black leading-tight" style={{ color: s.color }}>
              {s.value}
            </p>
            {s.isXP && (
              <div className="mt-2.5">
                <div className="h-1 rounded-full bg-[#2A3242] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7C3AED] transition-all duration-500"
                    style={{ width: `${Math.min(100, profile.xp % 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[8px] text-[#64748B] mt-1 font-mono">
                  <span>Level {Math.floor(profile.xp / 100) + 1}</span>
                  <span>{Math.min(100, profile.xp % 100)}/100 XP</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Row 3: Heatmap | Recent Activity | Badges */}
      <div className="grid gap-2 flex-1 min-h-0" style={{ gridTemplateColumns: "1.2fr 1fr 230px" }}>
        {/* Heatmap */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex flex-col overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-[#F97316]" /> Solved Submissions Heatmap
            </span>
            <span className="text-[9px] text-[#64748B] font-mono">Last 90 Days</span>
          </div>

          {heatmapEntries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A3242] rounded-xl p-4">
              <p className="text-[10px] text-[#64748B] text-center">No submissions tracked yet.</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 justify-center">
              <div className="flex gap-[3px] mb-1 pl-5">
                {["Apr", "May", "Jun"].map((m) => (
                  <span key={m} className="flex-1 text-[8px] text-[#64748B] text-center">
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex gap-[3px] flex-1 min-h-0 items-stretch">
                <div className="flex flex-col justify-around pr-1.5 font-mono text-[7px] text-[#64748B] shrink-0 select-none">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
                <div className="flex gap-[3px] flex-1">
                  {weeks.map((w, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px] flex-1">
                      {w.map(({ date, count }) => (
                        <div key={date} className="relative group flex-1">
                          <div
                            className="w-full rounded-[2px] transition-opacity hover:opacity-60 aspect-square"
                            style={{ background: heatColor(count), minHeight: "5px" }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#0F1117] border border-[#2A3242] text-[8px] text-white px-1.5 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none font-mono">
                            {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}:{" "}
                            {count === 0 ? "0 solved" : `${count} solved`}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0F1117]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#2A3242]/30 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-[#64748B]">Less</span>
                  {["#1C2230", "#4C1D95", "#6D28D9", "#7C3AED", "#A78BFA"].map((c) => (
                    <div key={c} className="h-1.5 w-1.5 rounded-[1px]" style={{ background: c }} />
                  ))}
                  <span className="text-[8px] text-[#64748B]">More</span>
                </div>
                <span className="text-[8px] text-[#64748B] font-mono">
                  Total Solved: {profile.solvedCount} problems
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex flex-col overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Code2 className="h-3.5 w-3.5 text-[#7C3AED]" /> Submissions Log
            </span>
            {profile.recentActivity.length > 5 && (
              <button
                onClick={() => setModalType("all-activity")}
                className="text-[9px] font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
              >
                View All
              </button>
            )}
          </div>

          {profile.recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A3242] rounded-xl p-4">
              <p className="text-[10px] text-[#64748B] text-center">No submissions yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1 max-h-[110px]">
                {profile.recentActivity.slice(0, 10).map((item) => {
                  const stat = getStatusDisplay(item.status);
                  const Icon = stat.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#0F1117] hover:bg-[#0F1117]/80 px-2.5 py-1.5 transition-colors border border-[#2A3242]/30"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`p-1 rounded-md ${stat.bg} ${stat.color} shrink-0`}>
                          <Icon className="h-3 w-3" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/problems/${item.problemSlug}`}
                            className="text-[10px] font-bold text-white truncate hover:text-[#A78BFA] transition-colors block"
                          >
                            {item.problemTitle}
                          </Link>
                          <span className="text-[8px] text-[#64748B] font-mono uppercase">{item.language}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <p className="text-[8px] text-[#64748B] font-mono">{timeAgo(item.createdAt)}</p>
                        <span
                          className={`text-[9px] font-black ${
                            item.status === "Accepted" ? "text-[#22C55E]" : "text-[#94A3B8]"
                          }`}
                        >
                          {item.status === "Accepted" ? "+10 XP" : "+5 XP"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Progress Timeline below Recent Activity list */}
              <div className="mt-2 pt-2 border-t border-[#2A3242]/30 shrink-0">
                <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mb-1.5">
                  📅 Monthly Progress (Last 30 Days)
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: "Solved", val: profile.monthlyProgress.solved, color: "text-[#22C55E]" },
                    { label: "Accepted", val: profile.monthlyProgress.accepted, color: "text-[#22C55E]" },
                    { label: "XP", val: `+${profile.monthlyProgress.xp}`, color: "text-[#A78BFA]" },
                    { label: "Coins", val: `+${profile.monthlyProgress.coins}`, color: "text-[#FBBF24]" }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#0F1117] rounded-md px-1.5 py-1 text-center border border-[#2A3242]/20">
                      <p className={`text-[10px] font-black leading-none ${stat.color}`}>{stat.val}</p>
                      <p className="text-[7px] text-[#64748B] mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex flex-col overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-[#7C3AED]" /> Badges
            </span>
            <button
              onClick={() => setModalType("badges")}
              className="text-[9px] font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
            >
              View Collection
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A3242]/60 rounded-xl p-3 bg-[#0F1117]/30">
            <div className="h-10 w-10 rounded-full bg-[#2A3242]/30 flex items-center justify-center mb-1.5 text-base">
              🛡️
            </div>
            <p className="text-[9px] font-bold text-white text-center leading-tight">No badges earned yet</p>
            <p className="text-[8px] text-[#64748B] text-center leading-snug mt-1 max-w-[150px]">
              Solve problems, maintain streaks, and participate in contests to unlock achievements.
            </p>
            <button
              onClick={() => setModalType("badges")}
              className="mt-2.5 flex items-center gap-1 rounded bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2 py-1 text-[8px] font-bold text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white transition-all"
            >
              View Collection
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Solved | Submission Stats | Language Dist */}
      <div className="grid grid-cols-3 gap-2 shrink-0" style={{ height: "135px" }}>
        {/* Solved Problems */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex items-center gap-3 overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="shrink-0 relative">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke="#1C2230" strokeWidth="8" />
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#22C55E"
                strokeWidth="8"
                strokeDasharray={`${ePct * circ} ${circ}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
              />
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="8"
                strokeDasharray={`${mPct * circ} ${circ}`}
                strokeDashoffset={circ * 0.25 - ePct * circ}
                strokeLinecap="round"
              />
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#EF4444"
                strokeWidth="8"
                strokeDasharray={`${hPct * circ} ${circ}`}
                strokeDashoffset={circ * 0.25 - ePct * circ - mPct * circ}
                strokeLinecap="round"
              />
              <text x="36" y="32" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">
                {profile.solvedCount}
              </text>
              <text x="36" y="44" textAnchor="middle" fill="#64748B" fontSize="7" fontWeight="bold" className="uppercase tracking-wider">
                Solved
              </text>
            </svg>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-white mb-0.5">Problem Difficulty</p>
            {[
              { label: "Easy", count: easy, pct: Math.round(ePct * 100), color: "#22C55E" },
              { label: "Medium", count: medium, pct: Math.round(mPct * 100), color: "#F59E0B" },
              { label: "Hard", count: hard, pct: Math.round(hPct * 100), color: "#EF4444" }
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1 font-medium">
                  <span className="text-[8px]" style={{ color: d.color }}>
                    ●
                  </span>
                  <span className="text-[#94A3B8]">{d.label}</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="font-bold text-white">{d.count}</span>
                  <span className="text-[8px] text-[#64748B]">({d.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Stats */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex flex-col overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <span className="text-[10px] font-bold text-white flex items-center gap-1">
              <BarChart2 className="h-3 w-3 text-[#7C3AED]" /> Statistics Breakdown
            </span>
            <span className="text-[8px] text-[#64748B] font-mono">
              Acceptance: {profile.submissionStats.acceptanceRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 items-center">
            <div className="space-y-1.5">
              {[
                { label: "Accepted", count: profile.submissionStats.accepted, color: "bg-[#22C55E]" },
                { label: "Wrong Answers", count: profile.submissionStats.wrongAnswer, color: "bg-[#EF4444]" }
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-bold text-[#94A3B8]">
                    <span>{item.label}</span>
                    <span className="text-white font-mono">{item.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#2A3242] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: `${
                          profile.submissionStats.totalAttempts > 0
                            ? (item.count / profile.submissionStats.totalAttempts) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-center bg-[#0F1117]/60 rounded-lg p-2 border border-[#2A3242]/30">
              {[
                { label: "Runtime Err", v: profile.submissionStats.runtimeError, color: "text-[#F59E0B]" },
                { label: "Compile Err", v: profile.submissionStats.compileError, color: "text-[#A78BFA]" },
                { label: "Total Attempts", v: profile.submissionStats.totalAttempts, color: "text-white" },
                { label: "Solve Rate", v: `${profile.submissionStats.acceptanceRate}%`, color: "text-[#22C55E]" }
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-[10px] font-black leading-none ${s.color}`}>{s.v}</p>
                  <p className="text-[7px] text-[#64748B] mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="rounded-xl border border-[#2A3242] bg-[#161B22] p-3 flex flex-col overflow-hidden transition-all hover:border-[#2A3242]/80">
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <span className="text-[10px] font-bold text-white">Languages Spoken</span>
            {profile.langDist.length > 3 && (
              <button
                onClick={() => setModalType("all-languages")}
                className="text-[9px] font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
              >
                View All
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            {profile.langDist.length === 0 ? (
              <p className="text-[9px] text-[#64748B] text-center font-mono">No submissions yet.</p>
            ) : (
              profile.langDist.slice(0, 3).map((l) => (
                <div key={l.lang} className="flex items-center gap-2">
                  <span className="w-14 text-[9px] font-bold text-white truncate">{l.lang}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#2A3242] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: l.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${l.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[9px] text-[#94A3B8] w-7 text-right font-mono font-bold">
                    {l.pct}%
                  </span>
                  <span className="text-[8px] text-[#64748B] w-12 text-right font-mono">
                    {l.count} solves
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Rankings */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          {
            label: "Global Ranking",
            Icon: Globe,
            value: profile.globalRank ? `#${profile.globalRank}` : "Not Available Yet",
            sub: profile.globalRank ? "Recalculated post-solve" : "Complete your first challenge",
            color: "#60A5FA"
          },
          {
            label: "Country Ranking",
            Icon: Flag,
            value: "Not Available Yet",
            sub: "Requires regional validation",
            color: "#22C55E"
          },
          {
            label: "College Ranking",
            Icon: Award,
            value: hasNoCollege ? "Not Available Yet" : profile.collegeRank ? `#${profile.collegeRank}` : "#1",
            sub: hasNoCollege ? "Connect college to unlock" : profile.college,
            color: "#A78BFA"
          },
          {
            label: "Contest Rank (Month)",
            Icon: Trophy,
            value: "Not Available Yet",
            sub: "Participate in contests to rank",
            color: "#FBBF24"
          }
        ].map(({ label, Icon, value, sub, color }) => (
          <div
            key={label}
            className="rounded-xl border border-[#2A3242] bg-[#161B22] px-3 py-2 flex items-center gap-2.5 transition-all hover:border-[#2A3242]/80"
          >
            <div className="h-7 w-7 rounded-lg bg-[#1C2230] flex items-center justify-center shrink-0">
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider truncate">{label}</p>
              <p
                className={`font-black leading-tight ${
                  value === "Not Available Yet" ? "text-[10px] text-[#64748B]" : "text-sm"
                }`}
                style={{ color: value === "Not Available Yet" ? undefined : color }}
              >
                {value}
              </p>
              <p className="text-[8px] text-[#64748B] truncate font-mono mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#161B22] border border-[#2A3242] rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setModalType(null)}
                className="absolute top-3.5 right-3.5 text-[#94A3B8] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Connect College Modal */}
              {modalType === "college" && (
                <form onSubmit={handleConnectCollege} className="p-6">
                  <h3 className="text-base font-black text-white flex items-center gap-2 mb-2">
                    🏛️ Connect College
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                    Enter the name of your college or university. This allows you to view and compete in college-specific leaderboards and rankings.
                  </p>
                  {collegeError && (
                    <div className="mb-3 px-3 py-2 rounded bg-[#EF4444]/10 border border-[#EF4444]/25 text-[10px] font-bold text-[#EF4444]">
                      {collegeError}
                    </div>
                  )}
                  <input
                    type="text"
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    placeholder="Enter College Name (e.g. GLA University)"
                    className="w-full h-10 rounded-lg border border-[#2A3242] bg-[#0F1117] px-3 text-xs text-white placeholder-[#64748B] focus:border-[#7C3AED] focus:outline-none transition-all mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-lg border border-[#2A3242] text-xs font-bold text-[#94A3B8] hover:bg-[#1C2230] hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCollege}
                      className="px-4 py-2 rounded-lg bg-[#7C3AED] text-xs font-bold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      {submittingCollege ? "Connecting..." : "Connect"}
                    </button>
                  </div>
                </form>
              )}

              {/* All Activity Modal */}
              {modalType === "all-activity" && (
                <div className="p-5">
                  <h3 className="text-base font-black text-white flex items-center gap-2 mb-3">
                    📜 Submissions Log (All)
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1.5">
                    {profile.recentActivity.map((item) => {
                      const stat = getStatusDisplay(item.status);
                      const Icon = stat.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-[#0F1117] border border-[#2A3242]/30 px-3 py-2 hover:bg-[#0F1117]/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`p-1 rounded-md ${stat.bg} ${stat.color} shrink-0`}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <Link
                                href={`/problems/${item.problemSlug}`}
                                onClick={() => setModalType(null)}
                                className="text-[10px] font-bold text-white truncate hover:text-[#A78BFA] transition-colors block"
                              >
                                {item.problemTitle}
                              </Link>
                              <span className="text-[8px] text-[#64748B] font-mono uppercase">
                                {item.language}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[8px] text-[#64748B] font-mono">
                              {new Date(item.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            <span
                              className={`text-[9px] font-black ${
                                item.status === "Accepted" ? "text-[#22C55E]" : "text-[#94A3B8]"
                              }`}
                            >
                              {item.status === "Accepted" ? "+10 XP" : "+5 XP"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Languages Modal */}
              {modalType === "all-languages" && (
                <div className="p-5">
                  <h3 className="text-base font-black text-white flex items-center gap-2 mb-4">
                    💻 Language Breakdown
                  </h3>
                  <div className="space-y-3">
                    {profile.langDist.map((l) => (
                      <div key={l.lang} className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-white truncate">{l.lang}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#2A3242] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: l.color }} />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-8 text-right font-mono font-bold">
                          {l.pct}%
                        </span>
                        <span className="text-[10px] text-[#64748B] w-14 text-right font-mono">
                          {l.count} solves
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Modal */}
              {modalType === "badges" && (
                <div className="p-5 text-center">
                  <div className="h-14 w-14 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center mx-auto mb-3 text-2xl shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                    🛡️
                  </div>
                  <h3 className="text-base font-black text-white mb-1">Badge Collection</h3>
                  <p className="text-xs text-[#A78BFA] font-bold">Coming Soon</p>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-2.5 max-w-sm mx-auto">
                    We are currently building the achievements and badge engine. In a future update, you will be able to display your earned certificates, contest medals, and contest credentials right here!
                  </p>
                  <button
                    onClick={() => setModalType(null)}
                    className="mt-5 w-full py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white transition-all"
                  >
                    Got it!
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
