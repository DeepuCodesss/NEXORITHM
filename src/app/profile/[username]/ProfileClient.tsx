"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Code2,
  Globe,
  Trophy,
  Settings,
  Plus,
  X,
  Flame,
  Check,
  AlertTriangle,
  Terminal,
  Calendar,
  ShieldQuestion,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  Zap,
  Star,
  UserPlus,
  CheckCircle,
  Crown,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { ProfilePayload } from "./page";

/* ───────────────────────── Mock Badges ───────────────────────── */
const MOCK_BADGES = [
  { id: 1, name: "First Blood", description: "Solve your first problem", xp: 50, date: "2023-10-12", rarity: "Common", icon: "🥇", unlocked: true },
  { id: 2, name: "Algorithm Master", description: "Solve 50 medium problems", xp: 500, date: "2024-01-05", rarity: "Rare", icon: "🧠", unlocked: true },
  { id: 3, name: "Consistency is Key", description: "7 day streak", xp: 100, date: "2024-03-20", rarity: "Uncommon", icon: "⭐", unlocked: true },
  { id: 4, name: "Speed Demon", description: "Solve a problem in under 2 minutes", xp: 200, date: null, rarity: "Epic", icon: "⚡", unlocked: false },
  { id: 5, name: "Bug Hunter", description: "Find 5 edge cases", xp: 300, date: null, rarity: "Rare", icon: "🐛", unlocked: false },
  { id: 6, name: "Weekend Warrior", description: "Solve 10 problems on weekends", xp: 150, date: null, rarity: "Uncommon", icon: "🛡️", unlocked: false },
];

/* ───────────────────────── Animated Counter ───────────────────────── */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!value) { setCount(0); return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.floor(ease * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ───────────────────────── Deterministic Random ───────────────────── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const HERO_DOTS = [...Array(15)].map((_, i) => ({
  id: `dot-${i}`,
  size: seededRandom(i) * 2 + 1,
  left: `${seededRandom(i + 1) * 100}%`,
  top: `${seededRandom(i + 2) * 100}%`,
  duration: seededRandom(i + 3) * 10 + 10,
  delay: seededRandom(i + 4) * -10,
}));

const CODE_SYMBOLS = ["{ }", "< >", "[ ]", "( )", "+", ";"];
const HERO_SYMBOLS = [...Array(6)].map((_, i) => ({
  id: `sym-${i}`,
  symbol: CODE_SYMBOLS[i % CODE_SYMBOLS.length],
  left: `${seededRandom(i + 5) * 90 + 5}%`,
  top: `${seededRandom(i + 6) * 80 + 10}%`,
  duration: seededRandom(i + 7) * 15 + 15,
  delay: seededRandom(i + 8) * -10,
}));

/* ───────────────────────── Design Tokens ──────────────────────────── */
const CARD = "rounded-2xl border border-[#1E2736] bg-[#111827] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200";
const CARD_HOVER = "hover:border-[#7C3AED]/40 hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)] hover:-translate-y-[2px]";
const CARD_PAD = "p-6";
const CARD_TITLE = "text-[18px] font-bold text-white tracking-tight flex items-center gap-2";
const LABEL = "text-[12px] font-bold text-[#94A3B8]/70 uppercase tracking-wider";
const META = "text-[13px] text-[#64748B] font-mono";

/* ───────────────────────── Component ──────────────────────────────── */
type ProfileClientProps = {
  profile: ProfilePayload;
  isOwner: boolean;
};

export default function ProfileClient({ profile: initialProfile, isOwner }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfilePayload>(initialProfile);
  const [modalType, setModalType] = useState<"college" | "all-activity" | "badges" | "heatmap-day" | "journey" | null>(null);
  const [collegeInput, setCollegeInput] = useState("");
  const [submittingCollege, setSubmittingCollege] = useState(false);
  const [collegeError, setCollegeError] = useState("");
  const [heatmapDate, setHeatmapDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: string; data: { count: number; xp: number; languages: string[] } } | null>(null);
  const [graphPeriod, setGraphPeriod] = useState<7 | 30>(7);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const handleConnectCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeInput.trim()) { setCollegeError("College name cannot be empty"); return; }
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
        setProfile((prev) => ({ ...prev, college: collegeInput.trim() }));
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

  /* ── Derived values ── */
  const currentLevel = profile.level;
  const currentLevelXP = profile.xp % 100;
  const xpToNext = 100 - currentLevelXP;
  const hasNoCollege = !profile.college || profile.college.includes("Connect");

  /* ── Heatmap ── */
  const currentMonth = heatmapDate.getMonth();
  const currentYear = heatmapDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  /* ── Helpers ── */
  function heatColor(count: number) {
    if (count === 0) return "#1A1E29";
    if (count === 1) return "#4C1D95";
    if (count <= 3) return "#6D28D9";
    if (count <= 5) return "#8B5CF6";
    return "#A78BFA";
  }

  /* ── Solves Overview Chart Data ── */
  const getChartData = (days: number) => {
    const data: { label: string; val: number; dateStr: string }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = days <= 7
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const val = profile.heatmap[dateStr]?.count || 0;
      data.push({ label, val, dateStr });
    }
    return data;
  };

  const chartData = getChartData(graphPeriod);
  const chartTotal = chartData.reduce((a, b) => a + b.val, 0);
  const chartMax = Math.max(...chartData.map(d => d.val), 1);

  // Previous period comparison
  const getPrevTotal = (days: number) => {
    const now = new Date();
    let total = 0;
    for (let i = days * 2 - 1; i >= days; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      total += profile.heatmap[dateStr]?.count || 0;
    }
    return total;
  };
  const prevTotal = getPrevTotal(graphPeriod);
  const trendPct = prevTotal > 0 ? Math.round(((chartTotal - prevTotal) / prevTotal) * 100) : chartTotal > 0 ? 100 : 0;

  // Difficulty breakdown for selected period
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - graphPeriod);
  const periodStartStr = periodStart.toISOString().slice(0, 10);
  const periodSubs = profile.recentActivity.filter(s => s.status === "Accepted" && s.createdAt.slice(0, 10) >= periodStartStr);
  const easyCount = periodSubs.filter(s => s.difficulty?.toLowerCase() === "easy").length;
  const mediumCount = periodSubs.filter(s => s.difficulty?.toLowerCase() === "medium").length;
  const hardCount = periodSubs.filter(s => s.difficulty?.toLowerCase() === "hard").length;

  /* ── SVG Chart Helpers ── */
  const chartW = 300;
  const chartH = 130;
  const padX = 20;
  const padY = 20;
  const chartPoints = chartData.map((d, i) => ({
    x: padX + (i / Math.max(chartData.length - 1, 1)) * (chartW - 2 * padX),
    y: padY + (1 - d.val / chartMax) * (chartH - 2 * padY),
    ...d,
  }));

  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      path += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };
  const linePath = getBezierPath(chartPoints);
  const fillPath = chartPoints.length >= 2
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartH} L ${chartPoints[0].x} ${chartH} Z`
    : "";

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Accepted": return { text: "Accepted", icon: Check, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" };
      case "Wrong Answer": return { text: "Wrong Answer", icon: X, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" };
      case "Runtime Error": return { text: "Runtime Error", icon: AlertTriangle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" };
      case "Compilation Error": return { text: "Compile Error", icon: Terminal, color: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10" };
      default: return { text: "Attempted", icon: ShieldQuestion, color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" };
    }
  };

  const getTimelineIcon = (iconName: string) => {
    switch (iconName) {
      case "UserPlus": return <UserPlus className="h-3.5 w-3.5" />;
      case "CheckCircle": return <CheckCircle className="h-3.5 w-3.5" />;
      case "Zap": return <Zap className="h-3.5 w-3.5" />;
      case "Flame": return <Flame className="h-3.5 w-3.5" />;
      case "Star": return <Star className="h-3.5 w-3.5" />;
      case "Award": return <Award className="h-3.5 w-3.5" />;
      case "Crown": return <Crown className="h-3.5 w-3.5" />;
      default: return <Check className="h-3.5 w-3.5" />;
    }
  };

  // Badge progress: toward first badge = solve 5 problems
  const badgeGoal = 5;
  const badgeProgress = Math.min(profile.solvedCount, badgeGoal);

  return (
    <div className="flex-1 min-w-0 p-6 flex flex-col gap-5 bg-[#0B0D12]" role="main" aria-label="Profile">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2A3242; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7C3AED; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes flow-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />

      {/* ════════════════ HERO ════════════════ */}
      <section
        className="rounded-2xl border border-[#1E2736] bg-gradient-to-br from-[#111827] to-[#0B0D12] px-8 py-9 flex items-center justify-between gap-8 relative overflow-hidden"
        aria-label="Profile hero"
      >
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          {HERO_DOTS.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#7C3AED]/15"
              style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
              animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.15, 1] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            />
          ))}
          {HERO_SYMBOLS.map((p) => (
            <motion.div
              key={p.id}
              className="absolute text-[#7C3AED]/8 font-mono text-[10px] font-bold select-none"
              style={{ left: p.left, top: p.top }}
              animate={{ y: ["0px", "-15px", "0px"], opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            >
              {p.symbol}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full">
          {/* Avatar */}
          <motion.div
            animate={{ y: ["0px", "-4px", "0px"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-[88px] w-[88px] shrink-0 rounded-full border-2 border-[#1E2736] overflow-hidden bg-[#1C2230] relative shadow-[0_0_24px_rgba(124,58,237,0.12)]"
          >
            <Image src={profile.avatarUrl} alt={`${profile.fullName}'s avatar`} width={88} height={88} unoptimized className="h-full w-full object-cover" />
            {profile.isPro && (
              <span className="absolute bottom-0 w-full text-center bg-gradient-to-r from-[#7C3AED] to-[#C084FC] text-white text-[9px] py-0.5 font-bold uppercase tracking-widest" aria-label="Pro member">
                Pro
              </span>
            )}
          </motion.div>

          {/* Info */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <h1 className="text-[40px] font-black text-white tracking-tight leading-none">{profile.fullName}</h1>
                {profile.solvedCount >= 100 && (
                  <BadgeCheck className="h-6 w-6 fill-[#7C3AED] text-white shrink-0" aria-label="Verified solver" />
                )}
              </div>
              <p className="text-[15px] font-mono text-[#A78BFA] leading-none mb-2">@{profile.username}</p>
            </div>
            <div className="flex items-center gap-6 text-[15px] text-[#94A3B8] flex-wrap mt-4 select-none">
              <span className="flex items-center gap-2 text-white font-semibold"><Code2 className="h-4 w-4 text-[#60A5FA]" /> {profile.solvedCount} Solved</span>
              <span className="text-[#1E2736] font-bold">•</span>
              <span className="flex items-center gap-2 text-white font-semibold"><Target className="h-4 w-4 text-[#22C55E]" /> Level {currentLevel}</span>
              <span className="text-[#1E2736] font-bold">•</span>
              <span className="flex items-center gap-2 text-white font-semibold"><Zap className="h-4 w-4 text-[#F59E0B]" /> {profile.xp} XP</span>
              <span className="text-[#1E2736] font-bold">•</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#64748B]" /> Joined {new Date(profile.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              {!hasNoCollege && (
                <>
                  <span className="text-[#1E2736] font-bold">•</span>
                  <span className="flex items-center gap-2 text-[#A78BFA] font-bold"><Globe className="h-4 w-4 text-[#7C3AED]" /> {profile.college}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              {isOwner && (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg border border-[#1E2736] bg-[#0B0D12]/60 px-4 py-2 text-[12px] font-semibold text-[#94A3B8] hover:text-white hover:border-[#7C3AED]/40 hover:bg-[#161B22] transition-all duration-[180ms] ease-out focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:ring-offset-2 focus:ring-offset-[#0B0D12]"
                >
                  <Settings className="h-3.5 w-3.5" /> Edit Profile
                </Link>
              )}
              {hasNoCollege && isOwner && (
                <button
                  onClick={() => setModalType("college")}
                  className="flex items-center gap-2 rounded-lg border border-[#7C3AED]/40 bg-[#7C3AED]/10 px-4 py-2 text-[12px] font-semibold text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white transition-all duration-[180ms] ease-out focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
                  aria-label="Connect your college"
                >
                  <Plus className="h-3.5 w-3.5" /> Connect College
                </button>
              )}
            </div>
          </div>

          {/* Profile Summary (Hero right) */}
          <div className="shrink-0 hidden md:flex flex-col justify-center border-l border-[#1E2736]/60 pl-6 ml-6 relative z-10 w-[250px] self-center">
            <div className="flex flex-col gap-4 text-[13px]">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[12px]">Level {profile.level}</span>
                  <span className="text-[#94A3B8]/60 font-mono text-[11px]">{currentLevelXP}/100 XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#1C2230] overflow-hidden border border-[#1E2736]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC] relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentLevelXP}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-[11px] mt-2">
                  <span className="text-[#94A3B8]/50 uppercase tracking-wide font-bold">Next Reward</span>
                  <span className="text-[#A78BFA] font-bold">Profile Border</span>
                </div>
              </div>
              <div className="h-px bg-[#1E2736]/60" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <p className="text-[#94A3B8]/50 text-[11px] uppercase tracking-wider font-black">Global Rank</p>
                  <p className="font-mono text-[16px] font-black text-white mt-1">#{profile.globalRank || "—"}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8]/50 text-[11px] uppercase tracking-wider font-black">Top %</p>
                  <p className="font-mono text-[16px] font-black text-[#FBBF24] mt-1">{profile.globalRank ? (profile.globalRank === 1 ? "0.01%" : profile.globalRank <= 100 ? "0.1%" : "1%") : "—"}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8]/50 text-[11px] uppercase tracking-wider font-black">Streak</p>
                  <p className="font-mono text-[16px] font-black text-[#F97316] mt-1">{profile.currentStreak} Day{profile.currentStreak !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8]/50 text-[11px] uppercase tracking-wider font-black">Longest</p>
                  <p className="font-mono text-[16px] font-black text-[#60A5FA] mt-1">{profile.longestStreak} Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ MAIN GRID ════════════════ */}
      <div className="flex flex-col gap-5">

        {/* ── ROW 1: Activity | Solves Overview | Badges | Journey ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* ── Activity Heatmap (col-span-4) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className={`${CARD} ${CARD_HOVER} px-5 pt-4 pb-4 lg:col-span-4 h-[360px] flex flex-col`}
            aria-label="Activity calendar"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={CARD_TITLE}><Calendar className="h-5 w-5 text-[#7C3AED]" /> Activity</span>
              <div className="flex items-center gap-2.5 select-none">
                <span className="text-[12px] font-semibold text-[#64748B] font-mono">{profile.solvedCount} Solves</span>
                <div className="flex items-center gap-0 bg-[#0B0D12] border border-[#1E2736] rounded-lg p-0.5 shadow-inner">
                  <button
                    onClick={() => setHeatmapDate(new Date(currentYear, currentMonth - 1, 1))}
                    className="p-1 hover:bg-[#1C2230] rounded text-[#64748B] transition-colors focus:outline-none hover:text-white"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-white w-[68px] text-center font-mono select-none">
                    {heatmapDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setHeatmapDate(new Date(currentYear, currentMonth + 1, 1))}
                    className="p-1 hover:bg-[#1C2230] rounded text-[#64748B] transition-colors focus:outline-none hover:text-white"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Heatmap Grid — centered, dense */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-[300px]">
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-[3px] mb-[3px]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[10px] font-semibold text-[#64748B]/60 text-center select-none">{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentYear}-${currentMonth}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-[3px] w-full"
                  >
                    {calendarDays.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} className="aspect-square rounded-[4px]" />;

                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const data = profile.heatmap[dateStr] || { count: 0, xp: 0, languages: [] };
                      const daySubmissions = profile.recentActivity.filter(s => s.createdAt.startsWith(dateStr));
                      const acceptedCount = daySubmissions.filter(s => s.status === "Accepted").length;
                      const wrongCount = daySubmissions.filter(s => s.status !== "Accepted").length;

                      return (
                        <div key={dateStr} className="relative group aspect-square">
                          <button
                            className="w-full h-full rounded-[4px] border border-transparent transition-all duration-150 hover:scale-[1.15] hover:z-10 hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] hover:ring-1 hover:ring-[#A855F7]/60 focus:outline-none"
                            style={{ background: heatColor(data.count) }}
                            onClick={() => {
                              if (data.count > 0) {
                                setSelectedDay({ date: dateStr, data });
                                setModalType("heatmap-day");
                              }
                            }}
                            aria-label={`${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${data.count} solved, +${data.xp} XP`}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none" role="tooltip">
                            <motion.div
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
                              className="bg-[#1C2230] border border-[#2A3242] px-3 py-2 rounded-lg shadow-2xl w-[150px] flex flex-col gap-0.5"
                            >
                              <span className="text-[10px] font-semibold text-white border-b border-[#2A3242] pb-1 mb-0.5">
                                {new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <div className="flex justify-between text-[9px]">
                                <span className="text-[#94A3B8]">Solved</span>
                                <span className="text-white font-semibold">{data.count}</span>
                              </div>
                              <div className="flex justify-between text-[9px]">
                                <span className="text-[#94A3B8]">XP</span>
                                <span className="text-[#A78BFA] font-semibold">+{data.xp}</span>
                              </div>
                              {acceptedCount > 0 && (
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-[#94A3B8]">Accepted</span>
                                  <span className="text-[#22C55E] font-semibold">{acceptedCount}</span>
                                </div>
                              )}
                              {wrongCount > 0 && (
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-[#94A3B8]">Wrong</span>
                                  <span className="text-[#EF4444] font-semibold">{wrongCount}</span>
                                </div>
                              )}
                            </motion.div>
                            <div className="border-[5px] border-transparent border-t-[#1C2230] -mt-px" />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ── Solves Overview Graph (col-span-4) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`${CARD} ${CARD_HOVER} px-5 pt-4 pb-4 lg:col-span-4 h-[360px] flex flex-col`}
            aria-label="Solves overview"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className={CARD_TITLE}><BarChart3 className="h-5 w-5 text-[#7C3AED]" /> Solves Overview</span>
                <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Last {graphPeriod} Days</p>
              </div>
              <div className="flex items-center gap-0 bg-[#0B0D12] border border-[#1E2736] rounded-lg p-0.5 shadow-inner select-none">
                {([7, 30] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setGraphPeriod(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-150 ${
                      graphPeriod === p
                        ? "bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30"
                        : "text-[#64748B] hover:text-white border border-transparent"
                    }`}
                  >
                    {p}D
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-end gap-3 mb-2">
              <span className="text-[36px] font-black text-white leading-none tracking-tight">
                <AnimatedCounter value={chartTotal} />
              </span>
              <span className="text-[11px] text-[#64748B] font-medium pb-1">Total Solves</span>
              <div className="ml-auto flex items-center gap-1 pb-1">
                <TrendingUp className={`h-3.5 w-3.5 ${trendPct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} />
                <span className={`text-[13px] font-bold ${trendPct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {trendPct >= 0 ? '+' : ''}{trendPct}%
                </span>
                <span className="text-[10px] text-[#64748B] ml-1">vs last {graphPeriod}d</span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="flex-1 min-h-0 relative">
              {hoveredPointIdx !== null && chartPoints[hoveredPointIdx] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bg-[#1C2230] border border-[#2A3242] px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none flex flex-col gap-0.5 z-50 text-[10px]"
                  style={{
                    left: `${(chartPoints[hoveredPointIdx].x / chartW) * 100}%`,
                    bottom: `${100 - (chartPoints[hoveredPointIdx].y / (chartH + 20)) * 100 + 10}%`,
                    transform: "translateX(-50%)"
                  }}
                >
                  <span className="font-semibold text-white border-b border-[#2A3242] pb-0.5 mb-0.5 whitespace-nowrap">
                    {new Date(chartPoints[hoveredPointIdx].dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#94A3B8]">Solves</span>
                    <span className="text-[#A78BFA] font-bold">{chartPoints[hoveredPointIdx].val}</span>
                  </div>
                </motion.div>
              )}

              <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((pct) => (
                  <line
                    key={pct}
                    x1={padX} y1={padY + pct * (chartH - 2 * padY)}
                    x2={chartW - padX} y2={padY + pct * (chartH - 2 * padY)}
                    stroke="#1E2736" strokeWidth="0.5" strokeDasharray="4 3"
                  />
                ))}
                {/* Fill */}
                {fillPath && (
                  <motion.path
                    d={fillPath}
                    fill="url(#chartFill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                )}
                {/* Line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                />
                {/* Points */}
                {chartPoints.map((pt, i) => (
                  <g key={i}>
                    {/* Active highlight ring */}
                    {hoveredPointIdx === i && (
                      <circle
                        cx={pt.x} cy={pt.y} r="8"
                        fill="none" stroke="#7C3AED" strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}
                    <motion.circle
                      cx={pt.x} cy={pt.y} r={hoveredPointIdx === i ? "5" : "4"}
                      fill={hoveredPointIdx === i ? "#7C3AED" : "#111827"} 
                      stroke="#7C3AED" strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                    />
                    {pt.val > 0 && hoveredPointIdx !== i && (
                      <motion.text
                        x={pt.x} y={pt.y - 10}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="9"
                        fontWeight="700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                      >
                        {pt.val}
                      </motion.text>
                    )}
                    {/* Invisible larger hover region for easy interaction */}
                    <circle
                      cx={pt.x} cy={pt.y} r="14"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(i)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                  </g>
                ))}
                {/* X-axis labels */}
                {chartPoints.filter((_, i) => graphPeriod <= 7 || i % Math.ceil(graphPeriod / 7) === 0).map((pt) => (
                  <text
                    key={pt.dateStr}
                    x={pt.x} y={chartH + 12}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {pt.label}
                  </text>
                ))}
              </svg>
            </div>

            {/* Difficulty Breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: "Easy", count: easyCount, icon: Code2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/8", border: "border-[#22C55E]/15" },
                { label: "Medium", count: mediumCount, icon: Zap, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/8", border: "border-[#F59E0B]/15" },
                { label: "Hard", count: hardCount, icon: Flame, color: "text-[#EF4444]", bg: "bg-[#EF4444]/8", border: "border-[#EF4444]/15" },
              ].map((d) => {
                const DIcon = d.icon;
                return (
                  <div key={d.label} className={`${d.bg} border ${d.border} rounded-xl py-2 flex flex-col items-center gap-0.5`}>
                    <DIcon className={`h-3.5 w-3.5 ${d.color}`} />
                    <span className="text-[18px] font-black text-white leading-none">{d.count}</span>
                    <span className={`text-[10px] font-semibold ${d.color}`}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Badges (col-span-2) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className={`${CARD} ${CARD_HOVER} px-4 pt-4 pb-3 lg:col-span-2 h-[360px] flex flex-col`}
            aria-label="Badges"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={CARD_TITLE}><Award className="h-5 w-5 text-[#FBBF24]" /> Badges</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-h-0 select-none">
              <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                {MOCK_BADGES.filter(b => b.unlocked).slice(0, 3).map((badge) => (
                  <div key={badge.id} className="relative group flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#1C2230] to-[#12161F] border border-[#FBBF24]/20 hover:border-[#FBBF24]/60 min-h-[72px] px-1 py-1.5 hover:shadow-[0_0_12px_rgba(251,191,36,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <span className="text-[28px] group-hover:scale-110 transition-transform duration-200 leading-none">{badge.icon}</span>
                    <span className="text-[9px] font-bold text-white mt-1 text-center leading-tight w-full line-clamp-2">{badge.name}</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none w-[160px]">
                      <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }}
                        className="bg-[#1C2230] border border-[#2A3242] px-3 py-2 rounded-lg shadow-2xl w-full flex flex-col gap-0.5"
                      >
                        <span className="text-[10px] font-bold text-white border-b border-[#2A3242] pb-1 mb-0.5">{badge.name}</span>
                        <span className="text-[9px] text-[#94A3B8] leading-snug">{badge.description}</span>
                        <div className="flex justify-between text-[9px] mt-1 pt-1 border-t border-[#2A3242]">
                          <span className="text-[#A78BFA] font-bold">+{badge.xp} XP</span>
                          <span className="text-[#22C55E]">{badge.rarity}</span>
                        </div>
                      </motion.div>
                      <div className="border-[5px] border-transparent border-t-[#1C2230] -mt-px" />
                    </div>
                  </div>
                ))}
                {MOCK_BADGES.filter(b => !b.unlocked).slice(0, 3).map((badge) => (
                  <div key={badge.id} className="relative group flex flex-col items-center justify-center rounded-xl bg-[#12161F]/10 border border-[#1E2736]/20 min-h-[72px] px-1 py-1.5 opacity-20 hover:opacity-40 transition-all duration-200 cursor-pointer">
                    <span className="text-[28px] grayscale leading-none">{badge.icon}</span>
                    <span className="text-[9px] font-bold text-[#64748B] mt-1 text-center leading-tight w-full line-clamp-2">{badge.name}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalType("badges")}
                className="shrink-0 w-full py-1.5 rounded-lg border border-[#1E2736] bg-[#0B0D12] text-[10px] font-bold text-[#64748B] hover:text-white hover:border-[#FBBF24]/30 hover:bg-[#111827] transition-all duration-[180ms] ease-out flex items-center justify-center gap-1 focus:outline-none"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          {/* ── Journey Timeline (col-span-2) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className={`${CARD} ${CARD_HOVER} px-4 pt-4 pb-3 lg:col-span-2 h-[360px] flex flex-col`}
            aria-label="Journey timeline"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={CARD_TITLE}><Clock className="h-5 w-5 text-[#60A5FA]" /> Journey</span>
            </div>
            <div className="relative flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pr-1 relative pl-4 pb-4">
                <div className="absolute left-[13px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#7C3AED] via-[#7C3AED]/40 to-transparent shadow-[0_0_8px_rgba(124,58,237,0.5)]" aria-hidden="true" />
                <div className="flex flex-col gap-5 py-1">
                  {profile.journeyTimeline.map((item, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + idx * 0.06, duration: 0.35 }}
                      key={item.id}
                      className="relative flex items-center gap-2.5 group/item"
                    >
                      <motion.div
                        whileInView={{ scale: [1, 1.1, 1] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className={`h-6 w-6 rounded-full border-2 border-[#111827] flex items-center justify-center shrink-0 relative z-10 transition-all duration-200 ${
                          item.unlocked
                            ? "bg-[#7C3AED] text-white shadow-[0_0_8px_rgba(124,58,237,0.3)] group-hover/item:scale-110"
                            : "bg-[#1C2230] text-[#64748B]"
                        }`}
                      >
                        {getTimelineIcon(item.icon)}
                      </motion.div>
                      <div className={`min-w-0 flex-1 ${item.unlocked ? "" : "opacity-30 group-hover/item:opacity-60 transition-opacity"}`}>
                        <p className={`text-[11px] font-bold leading-tight ${item.unlocked ? "text-white" : "text-[#94A3B8]"}`}>{item.title}</p>
                        <p className="text-[9px] text-[#A78BFA]/50 font-mono mt-0.5">
                          {item.unlocked && item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : item.unlocked ? "Unlocked" : "Locked"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none z-20" />
            </div>
          </motion.div>

        </div>

        {/* ── ROW 2: Submissions ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className={`${CARD} ${CARD_HOVER} pt-5 pb-5 pr-6 pl-[28px] flex flex-col h-[340px]`}
          aria-label="Submissions log"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2736]/40">
            <span className={CARD_TITLE}><Code2 className="h-5 w-5 text-[#7C3AED]" /> Submissions</span>
            {profile.recentActivity.length > 5 && (
              <button
                onClick={() => setModalType("all-activity")}
                className="text-[12px] font-bold text-[#A78BFA] hover:text-[#C084FC] transition-colors duration-[180ms] flex items-center gap-1 focus:outline-none"
                aria-label="View all submissions"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {profile.recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1E2736] rounded-xl bg-[#0B0D12]/50">
              <Terminal className="h-8 w-8 text-[#2A3242] mb-2" />
              <p className="text-[15px] font-bold text-[#64748B]">No submissions yet</p>
              <p className="text-[13px] text-[#64748B] mt-1">Your recent coding activity will appear here.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
              {profile.recentActivity.slice(0, 5).map((item) => {
                const stat = getStatusDisplay(item.status);
                const StatusIcon = stat.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/problems/${item.problemSlug}`}
                    className="flex items-center justify-between gap-6 rounded-xl bg-[#0B0D12] hover:bg-[#111827] px-4 py-2.5 transition-all duration-[180ms] ease-out border border-transparent hover:border-[#7C3AED]/50 group hover:-translate-y-[2px] hover:shadow-[0_4px_16px_rgba(124,58,237,0.15)] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/40"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                        <StatusIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[15px] font-bold text-white truncate group-hover:text-[#C084FC] transition-colors">{item.problemTitle}</span>
                          {item.difficulty && (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold shrink-0 ${
                              item.difficulty === "Easy" ? "text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20" :
                              item.difficulty === "Medium" ? "text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20" :
                              "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20"
                            }`}>{item.difficulty}</span>
                          )}
                          <span className="text-[#94A3B8] bg-[#1C2230] border border-[#2E374A] px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 select-none">{item.language}</span>
                        </div>
                        <p className="text-[13px] text-[#64748B] group-hover:text-[#94A3B8]/80 transition-colors flex items-center gap-2 font-medium">
                          <span>{new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {item.runtimeMs !== undefined && (
                            <>
                              <span className="text-[#2A3242]">•</span>
                              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#F59E0B]" /> {item.runtimeMs}ms</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[14px] font-black ${item.status === "Accepted" ? "text-[#22C55E] group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "text-[#94A3B8]"} transition-all`}>
                        +{item.xpEarned} XP
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#2A3242] group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── ROW 3: Weekly Quest ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`${CARD} border-[#F59E0B]/20 bg-gradient-to-br from-[#F59E0B]/5 to-[#111827] px-5 py-3.5 relative overflow-hidden group/reward hover:border-[#F59E0B]/30 hover:-translate-y-[2px] transition-all duration-[180ms] ease-out`}
          aria-label="Weekly quest"
        >
          <div className="absolute -right-4 -top-4 h-20 w-20 bg-[#F59E0B]/8 blur-3xl rounded-full group-hover/reward:bg-[#F59E0B]/12 transition-all duration-500" aria-hidden="true" />
          <div className="flex flex-col gap-2.5 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={CARD_TITLE}><Target className="h-5 w-5 text-[#F59E0B] group-hover/reward:scale-110 transition-transform" /> Weekly Quest</span>
                <span className="text-[11px] font-black text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-lg border border-[#F59E0B]/20 select-none">In Progress</span>
              </div>
              <span className="text-[13px] text-[#64748B] font-mono">~2 days left</span>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-[13px] font-medium text-[#94A3B8]">Solve <span className="text-white font-bold">3 more problems</span> this week</p>
                <p className="text-[13px] font-bold text-white">4 <span className="text-[#64748B] font-normal">/ 7 Solved</span></p>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#1C2230] overflow-hidden border border-[#1E2736]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(4 / 7) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22C55E]/10 text-[#22C55E] text-[11px] font-extrabold border border-[#22C55E]/20">
                <Zap className="h-3.5 w-3.5" /> +50 XP
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24] text-[11px] font-extrabold border border-[#FBBF24]/20">
                <Trophy className="h-3.5 w-3.5" /> +10 Coins
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 4: Performance — 4 separate stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Acceptance", value: profile.submissionStats.acceptanceRate, suffix: "%", color: "text-[#22C55E]", glow: "drop-shadow-[0_0_8px_rgba(34,197,94,0.15)]", icon: Check, iconColor: "text-[#22C55E]", hoverBorder: "hover:border-[#22C55E]/30" },
            { label: "Solved", value: profile.submissionStats.accepted, suffix: "", color: "text-white", glow: "", icon: Code2, iconColor: "text-[#60A5FA]", hoverBorder: "hover:border-[#60A5FA]/30" },
            { label: "Avg Runtime", value: profile.submissionStats.averageRuntime, suffix: "ms", color: "text-[#A78BFA]", glow: "drop-shadow-[0_0_8px_rgba(167,139,250,0.15)]", icon: Zap, iconColor: "text-[#A78BFA]", hoverBorder: "hover:border-[#A78BFA]/30" },
            { label: "Avg Attempts", value: profile.submissionStats.averageAttempts, suffix: "", color: "text-[#F59E0B]", glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.15)]", icon: Target, iconColor: "text-[#F59E0B]", hoverBorder: "hover:border-[#F59E0B]/30" },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                className={`${CARD} ${CARD_HOVER} ${stat.hoverBorder} px-4 py-4 flex flex-col items-center justify-center text-center h-[120px] group`}
              >
                <div className="flex items-center gap-2 mb-2 select-none">
                  <StatIcon className={`h-4 w-4 ${stat.iconColor} group-hover:scale-110 transition-transform duration-200`} />
                  <span className={LABEL}>{stat.label}</span>
                </div>
                <p className={`text-[44px] font-black leading-none tracking-tight ${stat.color} ${stat.glow}`}>
                  {stat.value ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : "—"}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* ════════════════ MODALS ════════════════ */}
      <AnimatePresence>
        {modalType && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setModalType(null); }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#111827] border border-[#1E2736] rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#1C2230] text-[#94A3B8] hover:text-white hover:bg-[#2A3242] transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {/* College Modal */}
              {modalType === "college" && (
                <form onSubmit={handleConnectCollege} className="p-6">
                  <h3 className="text-[18px] font-bold text-white flex items-center gap-2 mb-2">🏛️ Connect College</h3>
                  <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-5">Connect your college to compete with classmates.</p>
                  {collegeError && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[12px] font-semibold text-[#EF4444]">{collegeError}</div>
                  )}
                  <input
                    type="text" value={collegeInput} onChange={(e) => setCollegeInput(e.target.value)}
                    placeholder="Enter College Name (e.g. GLA University)"
                    className="w-full h-11 rounded-lg border border-[#1E2736] bg-[#0B0D12] px-4 text-[13px] text-white placeholder-[#64748B] focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/30 transition-all mb-5"
                    aria-label="College name"
                  />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setModalType(null)} className="px-5 py-2 rounded-lg text-[12px] font-semibold text-[#94A3B8] hover:bg-[#1C2230] hover:text-white transition-all focus:outline-none">Cancel</button>
                    <button type="submit" disabled={submittingCollege} className="px-5 py-2 rounded-lg bg-[#7C3AED] text-[12px] font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50">
                      {submittingCollege ? "Connecting..." : "Connect Now"}
                    </button>
                  </div>
                </form>
              )}

              {/* Badges Modal */}
              {modalType === "badges" && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-[#1C2230] border-2 border-[#1E2736] flex items-center justify-center mx-auto mb-4 text-2xl">🛡️</div>
                  <h3 className="text-[18px] font-bold text-white mb-2">Badge Collection</h3>
                  <div className="inline-block bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-4">Coming Soon</div>
                  <p className="text-[13px] text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                    The badge engine is being built. Earn certificates, contest medals, and credentials here soon.
                  </p>
                  <button onClick={() => setModalType(null)} className="mt-6 px-8 py-2.5 rounded-lg bg-[#1C2230] hover:bg-[#7C3AED] text-[12px] font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50">Got it</button>
                </div>
              )}

              {/* Heatmap Day Modal */}
              {modalType === "heatmap-day" && selectedDay && (
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-white flex items-center gap-2 mb-4 border-b border-[#1E2736] pb-3">
                    <Calendar className="h-5 w-5 text-[#7C3AED]" />
                    {new Date(selectedDay.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-[#0B0D12] border border-[#1E2736] rounded-xl p-4 text-center">
                      <p className="text-[28px] font-black text-[#22C55E]">{selectedDay.data.count}</p>
                      <p className={LABEL + " mt-1"}>Problems Solved</p>
                    </div>
                    <div className="bg-[#0B0D12] border border-[#1E2736] rounded-xl p-4 text-center">
                      <p className="text-[28px] font-black text-[#A78BFA]">+{selectedDay.data.xp}</p>
                      <p className={LABEL + " mt-1"}>XP Earned</p>
                    </div>
                  </div>
                  <div className="bg-[#0B0D12] border border-[#1E2736] rounded-xl p-4">
                    <p className="text-[12px] font-semibold text-white mb-2">Languages Used</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDay.data.languages.map(lang => (
                        <span key={lang} className="px-2.5 py-1 bg-[#1C2230] rounded-md text-[10px] font-mono text-[#94A3B8] uppercase border border-[#1E2736]">{lang}</span>
                      ))}
                      {selectedDay.data.languages.length === 0 && <span className={META}>No languages recorded.</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Full Activity Modal */}
              {modalType === "all-activity" && (
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-white flex items-center gap-2 mb-4">📜 All Submissions</h3>
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-1.5">
                    {profile.recentActivity.map((item) => {
                      const stat = getStatusDisplay(item.status);
                      const StatusIcon = stat.icon;
                      return (
                        <Link
                          key={item.id}
                          href={`/problems/${item.problemSlug}`}
                          onClick={() => setModalType(null)}
                          className="flex items-center justify-between gap-3 rounded-lg bg-[#0B0D12] border border-[#1E2736] px-4 py-2.5 hover:bg-[#111827] hover:border-[#7C3AED]/20 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`p-1.5 rounded-md ${stat.bg} ${stat.color} shrink-0`}><StatusIcon className="h-3.5 w-3.5" /></span>
                            <div className="min-w-0">
                              <span className="text-[12px] font-semibold text-white truncate group-hover:text-[#C084FC] transition-colors block mb-0.5">{item.problemTitle}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[#94A3B8] bg-[#1C2230] px-1.5 py-0.5 rounded text-[9px] font-mono">{item.language}</span>
                                {item.difficulty && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    item.difficulty === "Easy" ? "text-[#22C55E] bg-[#22C55E]/10" :
                                    item.difficulty === "Medium" ? "text-[#F59E0B] bg-[#F59E0B]/10" :
                                    "text-[#EF4444] bg-[#EF4444]/10"
                                  }`}>{item.difficulty}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[11px] font-bold block mb-0.5 ${item.status === "Accepted" ? "text-[#22C55E]" : "text-[#94A3B8]"}`}>+{item.xpEarned} XP</span>
                            <p className={META}>{new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Journey Modal */}
              {modalType === "journey" && (
                <div className="p-6">
                  <h3 className="text-[18px] font-bold text-white flex items-center gap-2 mb-5">🗺️ Full Journey</h3>
                  <div className="relative pl-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="absolute left-[17px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-[#7C3AED] via-[#1E2736] to-transparent" />
                    <div className="flex flex-col gap-4">
                      {profile.journeyTimeline.map((item) => (
                        <div key={item.id} className="relative flex items-start gap-3">
                          <div className={`h-7 w-7 rounded-full border-[3px] border-[#111827] flex items-center justify-center shrink-0 relative z-10 ${
                            item.unlocked ? "bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]" : "bg-[#1C2230] text-[#64748B]"
                          }`}>
                            {getTimelineIcon(item.icon)}
                          </div>
                          <div className={`pt-0.5 min-w-0 flex-1 ${item.unlocked ? "" : "opacity-50"}`}>
                            <p className={`text-[12px] font-semibold ${item.unlocked ? "text-white" : "text-[#94A3B8]"}`}>{item.title}</p>
                            {item.unlocked ? (
                              <p className="text-[10px] text-[#A78BFA] font-mono mt-0.5">
                                {item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unlocked"}
                              </p>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-1 w-full max-w-[110px]">
                                <div className="h-1 flex-1 rounded-full bg-[#1C2230] overflow-hidden">
                                  <div className="h-full bg-[#64748B]/60 w-1/3" />
                                </div>
                                <span className="text-[9px] text-[#64748B] font-mono">In progress</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
