"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  Code2,
  Flame,
  Gift,
  IndianRupee,
  LockKeyhole,
  Play,
  Rocket,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import { useApp } from "@/context/AppContext";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const featurePills = [
  { label: "Instant UPI Withdrawals", icon: Zap },
  { label: "Daily Coding Challenges", icon: Flame },
  { label: "Streak Rewards", icon: Trophy },
  { label: "Recruiter Friendly Profiles", icon: BriefcaseBusiness },
];

const timeline = [
  { title: "Daily Reward", amount: "₹5", icon: Check, tone: "success" },
  { title: "7-Day Streak", amount: "₹5", icon: Flame, tone: "primary" },
  { title: "15-Day Streak", amount: "₹10", icon: Target, tone: "primary" },
  { title: "30-Day Streak", amount: "₹25", icon: Trophy, tone: "primary" },
  { title: "40 Easy Problems", amount: "₹5", icon: BookOpen, tone: "primary" },
  { title: "100 Problems Solved", amount: "₹25", icon: Rocket, tone: "primary" },
];

const steps = [
  { title: "Sign Up", short: "Sign Up", copy: "Create account in seconds.", icon: UsersRound },
  { title: "Solve Problems", short: "Solve", copy: "Practice coding daily.", icon: Code2 },
  { title: "Earn Rewards", short: "Earn", copy: "Unlock milestones.", icon: Gift },
  { title: "Climb Rankings", short: "Rank", copy: "Compete globally.", icon: Trophy },
];

const comingSoon = [
  { title: "Recruiter Marketplace", icon: "🏢" },
  { title: "Team Contests", icon: "⚔" },
  { title: "Skill Certificates", icon: "📜" },
  { title: "More Reward Milestones", icon: "🎁" },
];

const trustBadges = [
  { label: "Real Rewards", icon: IndianRupee },
  { label: "No Fake Points", icon: ShieldCheck },
  { label: "Built for Coders", icon: Code2 },
  { label: "Transparent Rules", icon: BadgeCheck },
  { label: "UPI Withdrawals", icon: WalletCards },
  { label: "Secure & Verified", icon: LockKeyhole },
];

const codeLines = [
  "function twoSum(nums, target) {",
  "  const seen = new Map();",
  "  for (let i = 0; i < nums.length; i++) {",
  "    const diff = target - nums[i];",
  "    if (seen.has(diff)) {",
  "      return [seen.get(diff), i];",
  "    }",
  "    seen.set(nums[i], i);",
  "  }",
  "  return [];",
  "}",
];

function DashboardPreview() {
  const { problems, liveReward, solveProblem } = useApp();
  const [consoleMessage, setConsoleMessage] = useState("Ready to test sample cases.");
  const [submitMessage, setSubmitMessage] = useState("");
  const [runCount, setRunCount] = useState(0);

  const heroProblemId = liveReward.problemId || problems[0]?.id;

  const handleRunCode = () => {
    const result = heroProblemId ? solveProblem(heroProblemId) : null;
    setRunCount((current) => current + 1);
    setSubmitMessage("");
    setConsoleMessage(
      result?.awarded
        ? `Accepted on samples. +${result.xpGained} XP, +${result.coinsGained} coins added.`
        : "Accepted on samples. XP already claimed for this demo problem.",
    );
  };

  const handleSubmit = () => {
    const result = heroProblemId ? solveProblem(heroProblemId) : null;
    const reward = result?.moneyGainedInr || liveReward.rewardMoneyInr || 5;
    setConsoleMessage("All hidden tests passed. Submission accepted.");
    setSubmitMessage(`You topped the leaderboard at #1. Claim your ₹${reward} reward.`);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.55, delay: 0.15 }}
      className="dashboard-preview flex flex-col md:flex-row min-w-0 flex-1 overflow-hidden"
    >
      <div className="dashboard-sidebar hidden md:flex w-16 shrink-0 flex-col items-center gap-5 border-r border-border pt-5 text-muted-foreground" aria-hidden="true">
        {[Code2, BookOpen, Trophy, Gift, UsersRound].map((Icon, index) => (
          <span key={index} className={`flex h-9 w-9 items-center justify-center rounded-lg ${index === 0 ? "bg-primary0/10 text-primary" : "hover:text-white transition-colors"}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CalendarCheck2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-secondary-text">Problem of the Day</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">Two Sum</h2>
              <span className="rounded-full border border-success0/20 bg-success0/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                Easy
              </span>
            </div>
          </div>
          <div className="live-reward-card border border-primary0/10 bg-primary0/[0.02] p-3 rounded-xl min-w-[180px]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <span className="live-dot" />
              Live Reward Problem
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4">
              <div className="text-lg font-black text-primary">₹5 Prize Pool</div>
              <div className="text-[10px] font-medium text-secondary-text">42 min remaining</div>
            </div>
          </div>
        </div>

        <div className="grid min-h-[280px] grid-cols-1 lg:grid-cols-[1fr_240px]">
          <div className="code-window p-4 overflow-x-auto">
            {codeLines.map((line, index) => (
              <div key={`${index}-${line}`} className="grid grid-cols-[2rem_1fr] gap-3 font-mono text-xs leading-6">
                <span className="select-none text-right text-muted-foreground">{index + 1}</span>
                <code className="text-primary">{line}</code>
              </div>
            ))}
          </div>
          <div className="trophy-panel flex items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-border bg-gradient-to-b lg:bg-gradient-to-r from-transparent to-reward/[0.04]">
            <div className="trophy-illustration relative flex flex-col items-center" aria-hidden="true">
              <div className="trophy-cup flex h-24 w-28 items-center justify-center rounded-b-3xl border border-border bg-gradient-to-br from-reward to-amber-500 shadow-inner">
                <Code2 className="h-10 w-10 text-white/90" />
              </div>
              <div className="trophy-stem h-6 w-5 bg-gradient-to-b from-reward to-card" />
              <div className="trophy-base h-3 w-24 rounded bg-card border border-border" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between bg-black/10">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex gap-2">
            <button className="tab-button h-8 px-3 text-xs font-semibold text-white border border-border bg-hover rounded-lg" type="button">
              Testcase
            </button>
            <button className="tab-button h-8 px-3 text-xs font-semibold text-secondary-text hover:text-white transition-colors" type="button">
              Console
            </button>
            </div>
            <div className="min-h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs leading-5 text-secondary-text">
              <span className="font-semibold text-success">{runCount > 0 ? "Passed" : "Idle"}</span>
              <span className="ml-2">{consoleMessage}</span>
              {submitMessage && <div className="mt-1 font-bold text-primary">{submitMessage}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button onClick={handleRunCode} className="btn-gradient h-9 gap-1.5 px-4 text-xs font-bold" type="button">
              <Play className="h-3.5 w-3.5 fill-white" />
              Run Code
            </button>
            <button onClick={handleSubmit} className="btn-secondary h-9 px-4 text-xs font-bold" type="button">
              Submit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="landing-shell flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-8 pb-10 lg:pt-12 lg:pb-14">
          <div className="landing-grid-bg" />
          <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] items-center relative z-10">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center"
            >
              <div className="badge-soft mb-5 w-fit">💰 Earn rewards for real skills</div>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Solve Code.
                <br />
                Build Streaks.
                <br />
                <span className="reward-gradient">Earn Rewards.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-secondary-text">
                Practice coding daily, improve skills, maintain streaks, and earn real rewards directly to your wallet.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/problems" className="btn-gradient h-11 gap-1.5 px-5 text-xs font-bold">
                  Start Solving
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a href="#rewards" className="btn-secondary h-11 gap-1.5 px-5 text-xs font-bold">
                  View Rewards
                  <Gift className="h-3.5 w-3.5 text-secondary-text" />
                </a>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {featurePills.map((pill) => {
                  const Icon = pill.icon;
                  return (
                    <div key={pill.label} className="feature-pill flex items-center gap-3 border border-border bg-card p-3.5 rounded-xl text-secondary-text hover:border-border hover:bg-card">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                      <span className="text-xs font-bold">{pill.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <div className="w-full">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Reward Timeline */}
        <section id="rewards" className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="reward-timeline p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex flex-col gap-2 text-center lg:text-left lg:w-64 shrink-0">
              <h2 className="text-lg font-bold tracking-tight text-white">Reward Timeline</h2>
              <p className="text-xs leading-relaxed text-secondary-text">
                Solve daily, keep streaks alive, and unlock real milestones. UPI transfers.
              </p>
            </div>
            
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6 relative">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex flex-col items-center text-center relative group">
                      {index < timeline.length - 1 && (
                        <div className="hidden lg:block absolute top-6 left-[50%] right-[-50%] h-[1px] border-t border-dashed border-border z-0" />
                      )}
                      
                      <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-secondary-text transition-all duration-200 group-hover:scale-105 group-hover:border-primary0/20 group-hover:bg-primary0/5 tone-${item.tone}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      
                      <p className="mt-3 text-xs font-bold text-secondary-text group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                      
                      <span className="mt-1.5 rounded-full border border-success0/15 bg-success0/5 px-2.5 py-0.5 text-[10px] font-bold text-success">
                        {item.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How Nexorithm Works */}
        <section className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="landing-panel p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-white text-center">How NEXORITHM Works</h2>
            <p className="mt-1.5 text-xs text-secondary-text text-center max-w-md mx-auto">
              Build your development consistency daily and unlock prizes.
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div 
                    key={step.title} 
                    whileHover={{ y: -4 }} 
                    className="premium-card flex flex-col justify-between h-full p-5 border border-border bg-card hover:border-border hover:bg-card transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary0/10 bg-primary0/5 text-primary">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="mt-3.5 text-xs leading-relaxed text-secondary-text">{step.copy}</p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-3.5">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">STEP 0{index + 1}</span>
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What is Coming Next */}
        <section className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="landing-panel overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-xl">
                <div className="mb-2.5 w-fit rounded-full border border-primary0/20 bg-primary0/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  Roadmap
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">What is Coming Next</h2>
                <p className="mt-1 text-xs text-secondary-text">
                  Building in public. Your feedback shapes Nexorithm.
                </p>
                
                <div className="mt-5 space-y-2">
                  {comingSoon.map((item) => (
                    <div key={item.title} className="coming-soon-row flex items-center justify-between border border-border bg-card p-3 rounded-lg hover:border-border hover:bg-hover transition-all duration-200">
                      <span className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                        <span className="text-base" aria-hidden="true">{item.icon}</span>
                        {item.title}
                      </span>
                      <span className="rounded-full border border-primary0/10 bg-primary0/5 px-2 py-0.5 text-[9px] font-bold text-primary">
                        Coming Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-center md:pr-12">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/10 text-primary border border-border" aria-hidden="true">
                  <Rocket className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.label} 
                  className="flex flex-col items-center justify-center text-center p-4 border border-border bg-card rounded-xl hover:border-primary0/20 hover:bg-primary0/[0.02] transition-all duration-200 h-24 group"
                >
                  <Icon className="h-4.5 w-4.5 text-primary group-hover:scale-105 transition-transform duration-200" />
                  <span className="mt-2.5 text-xs font-bold text-secondary-text group-hover:text-white transition-colors">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
