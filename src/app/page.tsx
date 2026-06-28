"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const codeText = codeLines.join("\n");
const keywordPattern = /\b(function|const|for|let|if|return|new)\b/g;
const bluePattern = /\b(twoSum|Map|has|get|set|length)\b/g;

function isMobileWidth() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth < 768;
}

function highlightCode(text: string) {
  const tokenPattern = /\b(function|const|for|let|if|return|new|twoSum|Map|has|get|set|length|0)\b/g;
  const segments: Array<{ key: number; text: string; className?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ key: key++, text: text.slice(lastIndex, match.index) });
    }

    const token = match[0];
    let className = "text-primary";

    if (token === "0") {
      className = "text-amber-400";
    } else if (keywordPattern.test(token)) {
      className = "text-violet-400";
    } else if (bluePattern.test(token)) {
      className = "text-sky-400";
    }

    keywordPattern.lastIndex = 0;
    bluePattern.lastIndex = 0;
    segments.push({ key: key++, text: token, className });
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ key: key++, text: text.slice(lastIndex) });
  }

  return segments;
}

function DashboardPreview() {
  const { problems, liveReward, solveProblem } = useApp();
  const [consoleMessage, setConsoleMessage] = useState("Ready to test sample cases.");
  const [submitMessage, setSubmitMessage] = useState("");
  const [runCount, setRunCount] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditorHovered, setIsEditorHovered] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(42 * 60);

  const heroProblemId = liveReward?.problemId || problems[0]?.id;
  const typedCode = useMemo(() => codeText.slice(0, typedLength), [typedLength]);
  const highlightedCode = useMemo(() => highlightCode(typedCode), [typedCode]);

  useEffect(() => {
    setIsMobile(isMobileWidth());

    const handleResize = () => {
      setIsMobile(isMobileWidth());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setTypedLength(codeText.length);
      return;
    }

    let timeoutId: number | undefined;
    let intervalId: number | undefined;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setTypedLength((current) => {
          if (current >= codeText.length) {
            if (intervalId !== undefined) {
              window.clearInterval(intervalId);
            }
            return current;
          }

          const nextLength = current + 1;
          if (nextLength >= codeText.length && intervalId !== undefined) {
            window.clearInterval(intervalId);
          }
          return nextLength;
        });
      }, 30);
    }, 400);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
    setConsoleMessage("All hidden tests passed. Submission accepted.");
    const cashReward = result?.moneyGainedInr ?? 0;
    setSubmitMessage(
      cashReward > 0
        ? `You topped the leaderboard at #1. Claim your ₹${cashReward} reward.`
        : "You topped the leaderboard at #1. No cash reward is active right now.",
    );
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.55, delay: 0.15 }}
      className="dashboard-preview flex min-w-0 flex-1 flex-row"
      style={
        isMobile
          ? { transform: "none" }
          : {
              transform: isEditorHovered
                ? "perspective(1400px) rotateY(-2deg) rotateX(1deg)"
                : "perspective(1400px) rotateY(-5deg) rotateX(2deg)",
              transformOrigin: "left center",
              transition: "transform 0.5s ease",
              backfaceVisibility: "hidden" as const,
              WebkitBackfaceVisibility: "hidden" as React.CSSProperties['WebkitBackfaceVisibility'],
              willChange: "transform",
              overflow: "visible",
              imageRendering: "-webkit-optimize-contrast" as React.CSSProperties['imageRendering'],
              WebkitFontSmoothing: "antialiased",
            }
      }
      onMouseEnter={() => setIsEditorHovered(true)}
      onMouseLeave={() => setIsEditorHovered(false)}
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
              <div className="text-lg font-black text-primary">{liveReward?.isActive ? `₹${liveReward.rewardMoneyInr} Prize Pool` : "No Live Reward"}</div>
              <div className="text-[10px] font-medium text-secondary-text">
                {`${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', minHeight: '280px', borderBottom: 'none' }}>
          <div style={{ width: isMobile ? '100%' : '65%', overflow: 'hidden' }} className="code-window w-full min-w-0 p-4 overflow-x-auto">
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
              .cursor {
                display: inline-block;
                width: 2px;
                height: 1em;
                background: #8b6fff;
                margin-left: 1px;
                vertical-align: text-bottom;
                animation: blink 1s step-end infinite;
              }
            `}</style>
            {codeLines.map((_, index) => {
              const lineStart = codeLines.slice(0, index).reduce((count, line) => count + line.length + 1, 0);
              const lineEnd = lineStart + codeLines[index].length;
              const lineText = typedCode.slice(lineStart, Math.min(lineEnd, typedCode.length));
              const lineSegments = highlightCode(lineText);
              const showCursor = !isMobile && typedLength >= codeText.length && index === codeLines.length - 1;

              return (
                <div key={`${index}-${codeLines[index]}`} className="grid grid-cols-[2rem_1fr] gap-3 font-mono text-xs leading-6">
                <span className="select-none text-right text-muted-foreground">{index + 1}</span>
                <code className="text-primary whitespace-pre">
                  {lineSegments.length > 0
                    ? lineSegments.map((segment) => (
                        <span key={segment.key} className={segment.className}>
                          {segment.text}
                        </span>
                      ))
                    : null}
                  {showCursor ? <span className="cursor" aria-hidden="true" /> : null}
                </code>
              </div>
              );
            })}
          </div>
          {!isMobile && (
            <div style={{
              width: '38%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '300px',
              overflow: 'visible'
            }}>
              <img
                src="/trophy-cropped.png"
                alt="trophy"
                style={{
                  width: '420px',
                  height: '420px',
                  objectFit: 'contain',
                  margin: '-60px',
                  filter: 'drop-shadow(0 0 40px rgba(255,160,0,0.6)) drop-shadow(0 0 80px rgba(139,111,255,0.4))'
                }}
              />
            </div>
          )}
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
    <div className="landing-shell home-landing-shell flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        <section className="relative overflow-clip pt-8 pb-10 lg:pt-12 lg:pb-14">
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
