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
  Trophy,
  Flag,
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
  Crown
} from "lucide-react";
import { ProfilePayload } from "./page";

// Deterministic pseudo-random based on seed (avoids impure Math.random during render)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Pre-computed particle data (static, no hooks needed)
const HERO_PARTICLES = [...Array(8)].map((_, i) => ({
  id: i,
  width: seededRandom(i * 7 + 1) * 4 + 2,
  height: seededRandom(i * 7 + 2) * 4 + 2,
  left: `${seededRandom(i * 7 + 3) * 80 + 10}%`,
  duration: seededRandom(i * 7 + 4) * 5 + 4,
  delay: seededRandom(i * 7 + 5) * 3,
}));

type ProfileClientProps = {
  profile: ProfilePayload;
  isOwner: boolean;
};

export default function ProfileClient({ profile: initialProfile, isOwner }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfilePayload>(initialProfile);
  const [modalType, setModalType] = useState<"college" | "all-activity" | "all-languages" | "badges" | "heatmap-day" | null>(null);
  const [collegeInput, setCollegeInput] = useState("");
  const [submittingCollege, setSubmittingCollege] = useState(false);
  const [collegeError, setCollegeError] = useState("");
  
  // Heatmap State
  const [heatmapDate, setHeatmapDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: string; data: { count: number; xp: number; languages: string[] } } | null>(null);



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

  const currentLevel = Math.floor(profile.xp / 100) + 1;
  const currentLevelXP = profile.xp % 100;
  const xpNeeded = 100 - currentLevelXP;


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

  const getTimelineIcon = (iconName: string) => {
    switch(iconName) {
      case "UserPlus": return <UserPlus className="h-4 w-4" />;
      case "CheckCircle": return <CheckCircle className="h-4 w-4" />;
      case "Zap": return <Zap className="h-4 w-4" />;
      case "Flame": return <Flame className="h-4 w-4" />;
      case "Star": return <Star className="h-4 w-4" />;
      case "Award": return <Award className="h-4 w-4" />;
      case "Crown": return <Crown className="h-4 w-4" />;
      default: return <Check className="h-4 w-4" />;
    }
  }

  const hasNoCollege = !profile.college || profile.college.includes("Connect");

  // Heatmap Calendar Logic (1 Month)
  const currentMonth = heatmapDate.getMonth();
  const currentYear = heatmapDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 6 = Sat
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handlePrevMonth = () => {
    setHeatmapDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const handleNextMonth = () => {
    setHeatmapDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="flex-1 min-w-0 p-4 flex flex-col gap-4 relative overflow-y-auto custom-scrollbar h-full bg-[#0B0D12]">
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
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(76, 29, 149, 0.05), rgba(11, 13, 18, 0.8));
          background-size: 200% 200%;
          animation: flow-gradient 10s ease infinite;
        }
      `}} />

      {/* Row 1: Hero Section */}
      <section className="rounded-2xl border border-[#2A3242] bg-[#12161F] hero-gradient px-6 py-5 flex items-center justify-between gap-6 relative overflow-hidden shrink-0 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {HERO_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#A78BFA]/20 blur-[1px]"
              style={{ width: p.width, height: p.height, left: p.left, bottom: "-10px" }}
              animate={{ y: ["0px", "-150px"], opacity: [0, 0.8, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            />
          ))}
          <div className="absolute right-0 top-0 h-full w-[400px] bg-gradient-to-l from-[#7C3AED]/10 to-transparent blur-3xl pointer-events-none" />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-20 w-20 shrink-0 rounded-full border-2 border-[#7C3AED] overflow-hidden bg-[#1C2230] relative shadow-[0_0_20px_rgba(124,58,237,0.3)] group">
            <Image src={profile.avatarUrl} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {profile.isPro && (
              <span className="absolute bottom-0 w-full text-center bg-[#7C3AED] text-white text-[9px] py-0.5 font-bold uppercase tracking-wider">
                Pro
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-2xl font-black text-white tracking-tight">{profile.fullName}</h1>
              {profile.solvedCount >= 100 && (
                <BadgeCheck className="h-5 w-5 fill-[#7C3AED] text-white shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
              )}
            </div>
            <p className="text-xs font-mono text-[#94A3B8] mb-1.5">@{profile.username}</p>
            <p className="text-[11px] text-[#64748B] flex items-center gap-2 flex-wrap">
              <span>Joined {new Date(profile.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              <span>&bull;</span>
              {!hasNoCollege && (
                <span className="text-[#A78BFA] font-medium flex items-center gap-1">
                  🏛️ {profile.college}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {isOwner && (
                <Link
                  href="/settings"
                  className="flex items-center gap-1.5 rounded-lg border border-[#2A3242] bg-[#0B0D12] px-3 py-1.5 text-[10px] font-bold text-[#94A3B8] hover:text-white hover:border-[#7C3AED]/40 hover:bg-[#161B22] transition-all"
                >
                  <Settings className="h-3.5 w-3.5" /> Edit Profile
                </Link>
              )}
              {hasNoCollege && isOwner && (
                <button
                  onClick={() => setModalType("college")}
                  className="flex items-center gap-1.5 rounded-lg border border-[#7C3AED]/40 bg-[#7C3AED]/10 px-3 py-1.5 text-[10px] font-bold text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Connect College
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Goal Panel */}
        <div className="relative z-10 bg-[#0B0D12]/80 backdrop-blur-md border border-[#2A3242] rounded-xl px-5 py-3 hidden md:flex flex-col gap-2 min-w-[200px] shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Current Goal</span>
            <span className="text-[10px] font-black text-[#A78BFA]">Level {currentLevel + 1}</span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-black text-white mb-1">
              <span>{currentLevelXP} XP</span>
              <span>100 XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1C2230] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C084FC]"
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelXP}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <p className="text-[9px] text-[#64748B] font-mono text-right">{xpNeeded} XP until next level</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Row: Streaks & Weekly Goal */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col justify-center transition-all hover:border-[#7C3AED]/40 hover:-translate-y-0.5 shadow-sm group">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-[#F97316] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Current Streak</span>
              </div>
              <p className="text-2xl font-black text-white">{profile.currentStreak} <span className="text-xs text-[#64748B]">Days</span></p>
              <p className="text-[9px] mt-1 font-mono">
                {profile.hasSolvedToday ? (
                  <span className="text-[#22C55E]">✓ Safe today</span>
                ) : (
                  <span className="text-[#F59E0B]">⏳ Solve 1 today</span>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col justify-center transition-all hover:border-[#60A5FA]/40 hover:-translate-y-0.5 shadow-sm group">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-[#60A5FA] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Best Streak</span>
              </div>
              <p className="text-2xl font-black text-white">{profile.longestStreak} <span className="text-xs text-[#64748B]">Days</span></p>
              <p className="text-[9px] mt-1 font-mono text-[#64748B]">All time personal best</p>
            </div>
            <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col justify-center transition-all hover:border-[#22C55E]/40 hover:-translate-y-0.5 shadow-sm group">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Weekly Goal</span>
              </div>
              <p className="text-2xl font-black text-white">{profile.weeklyGoal.solvedDays} <span className="text-xs text-[#64748B]">/ {profile.weeklyGoal.targetDays}</span></p>
              <div className="mt-2 h-1 rounded-full bg-[#1C2230] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#22C55E]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile.weeklyGoal.solvedDays / profile.weeklyGoal.targetDays) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>

          {/* 1-Month Heatmap */}
          <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-5 shrink-0 transition-all hover:border-[#2A3242]/80">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#7C3AED]" /> Activity Calendar
              </span>
              <div className="flex items-center gap-3">
                <select 
                  className="bg-[#0B0D12] border border-[#2A3242] text-[#94A3B8] text-xs rounded px-2 py-1 outline-none font-mono"
                  value={currentYear}
                  onChange={(e) => setHeatmapDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="flex items-center gap-1 bg-[#0B0D12] border border-[#2A3242] rounded p-0.5">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-[#1C2230] rounded text-[#94A3B8] transition-colors"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <span className="text-xs font-bold text-white w-20 text-center font-mono">
                    {heatmapDate.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-[#1C2230] rounded text-[#94A3B8] transition-colors"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[10px] font-bold text-[#64748B] text-center uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="aspect-square rounded-md bg-transparent" />;
                
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const data = profile.heatmap[dateStr] || { count: 0, xp: 0, languages: [] };
                
                return (
                  <div key={dateStr} className="relative group aspect-square">
                    <button 
                      className="w-full h-full rounded-md border border-[#2A3242]/50 transition-all hover:scale-105 hover:ring-2 ring-[#7C3AED]/50"
                      style={{ background: heatColor(data.count) }}
                      onClick={() => {
                        if (data.count > 0) {
                          setSelectedDay({ date: dateStr, data });
                          setModalType("heatmap-day");
                        }
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                      <div className="bg-[#0B0D12] border border-[#2A3242] px-3 py-2 rounded-lg shadow-xl w-32 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-white border-b border-[#2A3242] pb-1">
                          {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-[#94A3B8]">Solved:</span>
                          <span className="text-white font-bold">{data.count}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-[#94A3B8]">XP Earned:</span>
                          <span className="text-[#A78BFA] font-bold">+{data.xp}</span>
                        </div>
                        {data.languages.length > 0 && (
                          <div className="flex flex-col text-[9px] font-mono mt-0.5">
                            <span className="text-[#94A3B8]">Languages:</span>
                            <span className="text-[#22C55E] truncate">{data.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-4 border-transparent border-t-[#2A3242] -mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-5 shrink-0 flex flex-col transition-all hover:border-[#2A3242]/80 h-[300px]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#7C3AED]" /> Submissions Log
              </span>
              {profile.recentActivity.length > 5 && (
                <button
                  onClick={() => setModalType("all-activity")}
                  className="text-[10px] font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors flex items-center gap-1"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {profile.recentActivity.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#2A3242]/60 rounded-xl bg-[#0B0D12]/50">
                <Terminal className="h-8 w-8 text-[#2A3242] mb-2" />
                <p className="text-xs font-bold text-[#64748B]">No submissions yet</p>
                <p className="text-[10px] text-[#64748B] mt-1">Your recent coding activity will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                {profile.recentActivity.slice(0, 15).map((item) => {
                  const stat = getStatusDisplay(item.status);
                  const Icon = stat.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#0B0D12] hover:bg-[#1C2230]/50 px-4 py-2.5 transition-colors border border-[#2A3242]/40 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/problems/${item.problemSlug}`}
                            className="text-xs font-bold text-white truncate hover:text-[#A78BFA] transition-colors block leading-tight mb-0.5"
                          >
                            {item.problemTitle}
                          </Link>
                          <div className="flex items-center gap-2 text-[9px] font-mono">
                            <span className="text-[#64748B] uppercase px-1.5 py-0.5 bg-[#1C2230] rounded-sm">{item.language}</span>
                            {item.difficulty && (
                              <span className={`px-1.5 py-0.5 rounded-sm bg-opacity-10 font-bold ${item.difficulty === 'Easy' ? 'text-[#22C55E] bg-[#22C55E]' : item.difficulty === 'Medium' ? 'text-[#F59E0B] bg-[#F59E0B]' : 'text-[#EF4444] bg-[#EF4444]'}`}>
                                {item.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className={`text-[10px] font-black ${item.status === "Accepted" ? "text-[#22C55E]" : "text-[#94A3B8]"}`}>
                          +{item.xpEarned} XP
                        </span>
                        <p className="text-[9px] text-[#64748B] font-mono">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Acceptance Rate", value: `${profile.submissionStats.acceptanceRate}%`, color: "text-[#22C55E]" },
              { label: "Problems Solved", value: profile.submissionStats.accepted, color: "text-white" },
              { label: "Avg Attempts", value: profile.submissionStats.averageAttempts || "N/A", color: "text-[#F59E0B]" },
              { label: "Avg Runtime", value: profile.submissionStats.averageRuntime ? `${profile.submissionStats.averageRuntime}ms` : "N/A", color: "text-[#A78BFA]" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-[#2A3242] bg-[#12161F] p-3 text-center transition-all hover:border-[#2A3242]/80">
                <p className={`text-lg font-black leading-tight ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Rankings */}
          <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col gap-3 shrink-0">
            <span className="text-sm font-black text-white flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-[#FBBF24]" /> Leaderboards
            </span>
            {[
              { label: "Global Rank", Icon: Globe, value: profile.globalRank ? `#${profile.globalRank}` : "Not Available Yet", sub: "Based on total XP & Solves", color: "#60A5FA" },
              { label: "College Rank", Icon: Award, value: hasNoCollege ? "Not Available Yet" : profile.collegeRank ? `#${profile.collegeRank}` : "Not Available Yet", sub: hasNoCollege ? "Connect college to unlock" : profile.college, color: "#A78BFA" },
              { label: "Contest Rank", Icon: Flag, value: "Not Available Yet", sub: "Participate in contests", color: "#F59E0B" }
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3 bg-[#0B0D12] p-2.5 rounded-lg border border-[#2A3242]/50">
                <div className="h-8 w-8 rounded bg-[#1C2230] flex items-center justify-center shrink-0">
                  <r.Icon className="h-4 w-4" style={{ color: r.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">{r.label}</p>
                  <p className={`font-black truncate ${r.value === "Not Available Yet" ? "text-[11px] text-[#64748B]" : "text-sm text-white"}`}>{r.value}</p>
                  <p className="text-[8px] text-[#64748B] font-mono truncate">{r.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-[#7C3AED]" /> Badges
              </span>
              <button
                onClick={() => setModalType("badges")}
                className="text-[10px] font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors"
              >
                View Collection
              </button>
            </div>
            <div className="flex flex-col items-center justify-center border border-dashed border-[#2A3242]/60 rounded-xl py-6 bg-[#0B0D12]/50">
              <div className="h-12 w-12 rounded-full bg-[#1C2230] flex items-center justify-center mb-3">
                <Award className="h-6 w-6 text-[#2A3242]" />
              </div>
              <p className="text-xs font-bold text-[#94A3B8]">No badges earned yet.</p>
              <p className="text-[9px] text-[#64748B] text-center max-w-[200px] mt-1.5 leading-relaxed">
                Solve problems, maintain streaks, and participate in contests to unlock achievements.
              </p>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="rounded-xl border border-[#2A3242] bg-[#12161F] p-4 flex flex-col flex-1 min-h-[300px]">
            <span className="text-sm font-black text-white flex items-center gap-2 mb-4 shrink-0">
              <Clock className="h-4 w-4 text-[#60A5FA]" /> Journey Timeline
            </span>
            <div className="relative pl-3 flex-1 overflow-y-auto custom-scrollbar">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-[#2A3242]" />
              <div className="flex flex-col gap-4">
                {profile.journeyTimeline.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-4">
                    <div className={`h-8 w-8 rounded-full border-4 border-[#12161F] flex items-center justify-center shrink-0 relative z-10 transition-colors ${item.unlocked ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]' : 'bg-[#1C2230] text-[#64748B]'}`}>
                      {getTimelineIcon(item.icon)}
                    </div>
                    <div className={`pt-1.5 ${item.unlocked ? 'opacity-100' : 'opacity-40'}`}>
                      <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
                      <p className="text-[9px] text-[#64748B] font-mono mt-0.5">
                        {item.unlocked 
                          ? (item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unlocked') 
                          : 'Locked'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-[#12161F] border border-[#2A3242] rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setModalType(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#1C2230] text-[#94A3B8] hover:text-white hover:bg-[#2A3242] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {modalType === "college" && (
                <form onSubmit={handleConnectCollege} className="p-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                    🏛️ Connect College
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
                    Enter the name of your college or university. This allows you to view and compete in college-specific leaderboards and rankings.
                  </p>
                  {collegeError && (
                    <div className="mb-4 px-3 py-2 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs font-bold text-[#EF4444]">
                      {collegeError}
                    </div>
                  )}
                  <input
                    type="text"
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    placeholder="Enter College Name (e.g. GLA University)"
                    className="w-full h-11 rounded-lg border border-[#2A3242] bg-[#0B0D12] px-4 text-sm text-white placeholder-[#64748B] focus:border-[#7C3AED] focus:outline-none transition-all mb-5"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-5 py-2 rounded-lg text-xs font-bold text-[#94A3B8] hover:bg-[#1C2230] hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCollege}
                      className="px-5 py-2 rounded-lg bg-[#7C3AED] text-xs font-bold text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                    >
                      {submittingCollege ? "Connecting..." : "Connect Now"}
                    </button>
                  </div>
                </form>
              )}

              {modalType === "badges" && (
                <div className="p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-[#1C2230] border-2 border-[#2A3242] flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl">
                    🛡️
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Badge Collection</h3>
                  <div className="inline-block bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-4">
                    Coming Soon
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                    We are currently building the achievements and badge engine. In a future update, you will be able to display your earned certificates, contest medals, and contest credentials right here!
                  </p>
                  <button
                    onClick={() => setModalType(null)}
                    className="mt-8 w-full max-w-[200px] mx-auto py-2.5 rounded-lg bg-[#2A3242] hover:bg-[#7C3AED] text-xs font-bold text-white transition-all"
                  >
                    Got it!
                  </button>
                </div>
              )}

              {modalType === "heatmap-day" && selectedDay && (
                <div className="p-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4 border-b border-[#2A3242] pb-3">
                    <Calendar className="h-5 w-5 text-[#7C3AED]" /> 
                    {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-[#0B0D12] border border-[#2A3242] rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-[#22C55E]">{selectedDay.data.count}</p>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">Problems Solved</p>
                    </div>
                    <div className="bg-[#0B0D12] border border-[#2A3242] rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-[#A78BFA]">+{selectedDay.data.xp}</p>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">XP Earned</p>
                    </div>
                  </div>
                  <div className="bg-[#0B0D12] border border-[#2A3242] rounded-xl p-4">
                    <p className="text-xs font-bold text-white mb-2">Languages Used</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDay.data.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-[#1C2230] rounded-md text-[10px] font-mono text-[#94A3B8] uppercase">
                          {lang}
                        </span>
                      ))}
                      {selectedDay.data.languages.length === 0 && (
                        <span className="text-[10px] text-[#64748B]">No languages recorded.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalType === "all-activity" && (
                <div className="p-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                    📜 Full Submissions Log
                  </h3>
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                    {profile.recentActivity.map((item) => {
                      const stat = getStatusDisplay(item.status);
                      const Icon = stat.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-[#0B0D12] border border-[#2A3242]/50 px-4 py-3 hover:bg-[#1C2230]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`p-2 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <Link
                                href={`/problems/${item.problemSlug}`}
                                onClick={() => setModalType(null)}
                                className="text-xs font-bold text-white truncate hover:text-[#A78BFA] transition-colors block mb-0.5"
                              >
                                {item.problemTitle}
                              </Link>
                              <div className="flex items-center gap-2 text-[10px] font-mono">
                                <span className="text-[#64748B] uppercase bg-[#1C2230] px-1.5 py-0.5 rounded-sm">{item.language}</span>
                                {item.difficulty && (
                                  <span className={`px-1.5 py-0.5 rounded-sm bg-opacity-10 font-bold ${item.difficulty === 'Easy' ? 'text-[#22C55E] bg-[#22C55E]' : item.difficulty === 'Medium' ? 'text-[#F59E0B] bg-[#F59E0B]' : 'text-[#EF4444] bg-[#EF4444]'}`}>
                                    {item.difficulty}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[11px] font-black block mb-0.5 ${item.status === "Accepted" ? "text-[#22C55E]" : "text-[#94A3B8]"}`}>
                              +{item.xpEarned} XP
                            </span>
                            <p className="text-[9px] text-[#64748B] font-mono">
                              {new Date(item.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
