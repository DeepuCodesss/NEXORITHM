"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
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
  User,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import { useApp } from "@/context/AppContext";

const featurePills = [
  { label: "Daily Reward Challenges", icon: Flame },
  { label: "Instant UPI Withdrawals", icon: Zap },
  { label: "Daily Giveaway", icon: Gift },
  { label: "Completely Free to Start", icon: Rocket },
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

function RewardCountdown({ active }: { active: boolean }) {
  const [remainingSeconds, setRemainingSeconds] = useState(42 * 60);

  useEffect(() => {
    if (!active) return;
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [active]);

  return <span>{`${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`}</span>;
}

function DashboardPreview() {
  const { problems, liveReward, solveProblem } = useApp();
  const [consoleMessage, setConsoleMessage] = useState("Ready to test sample cases.");
  const [submitMessage, setSubmitMessage] = useState("");
  const [runCount, setRunCount] = useState(0);
  const [isMobile, setIsMobile] = useState(isMobileWidth);
  const [isEditorHovered, setIsEditorHovered] = useState(false);

  const heroProblemId = liveReward?.problemId || problems[0]?.id;
  const typedCode = codeText;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileWidth());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
    <div
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
                <RewardCountdown active={Boolean(liveReward?.isActive)} />
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
              const lineText = typedCode.slice(lineStart, lineEnd);
              const lineSegments = highlightCode(lineText);

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
              <Image
                src="/trophy-cropped.png"
                alt="trophy"
                width={420}
                height={420}
                loading="lazy"
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
    </div>
  );
}

const videoSteps = [
  { icon: User, title: 'Sign Up', subtitle: 'Create your account in seconds.' },
  { icon: Code2, title: 'Solve Problems', subtitle: 'Practice coding and sharpen your skills.' },
  { icon: Gift, title: 'Earn Rewards', subtitle: 'Complete goals and unlock exciting prizes.' },
  { icon: Trophy, title: 'Climb Rankings', subtitle: 'Compete, improve, and become the best.' },
];

function VideoGuideSection() {
  return (
    <section
      style={{
        padding: '80px 5%',
        position: 'relative',
        backgroundImage: 'url(/laptop-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5,5,15,0.80)',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* 3-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '20% 55% 25%',
            gap: '32px',
            alignItems: 'start',
          }}
          className="video-guide-grid"
        >
          {/* LEFT COLUMN — Step Tracker */}
          <div style={{ position: 'relative', paddingTop: '8px' }}>
            {videoSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Vertical line + circle */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(139,111,255,0.15)',
                        border: '2px solid rgba(139,111,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: '18px', height: '18px', color: '#8b6fff' }} />
                    </div>
                    {index < videoSteps.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          height: '48px',
                          borderLeft: '2px dashed rgba(139,111,255,0.4)',
                        }}
                      />
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ paddingTop: '6px', paddingBottom: index < videoSteps.length - 1 ? '28px' : '0' }}>
                    <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>
                      {index + 1}. {step.title}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER COLUMN — Video */}
          <div>
            {/* Pill badge */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(139,111,255,0.4)',
                  background: 'rgba(139,111,255,0.1)',
                  color: '#c084fc',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                ▶ VIDEO GUIDE
              </span>
            </div>

            {/* Heading */}
            <h2
              style={{
                textAlign: 'center',
                color: '#fff',
                fontSize: '28px',
                fontWeight: 800,
                margin: '0 0 8px',
                lineHeight: 1.3,
              }}
            >
              How to Get Started on{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #8b6fff, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                NEXORITHM
              </span>
            </h2>

            {/* Subtitle */}
            <p
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                margin: '0 auto 28px',
                maxWidth: '480px',
                lineHeight: 1.6,
              }}
            >
              Watch this step-by-step guide to solve your first problem and start{' '}
              <span style={{ color: '#c9a227' }}>earning</span> rewards.
            </p>

            {/* Video iframe */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="NEXORITHM Video Guide"
              />
            </div>
          </div>

          {/* RIGHT COLUMN — Cards */}
          <div>
            {/* Card 1 — What You'll Learn */}
            <div
              style={{
                background: 'rgba(139,111,255,0.08)',
                border: '1px solid rgba(139,111,255,0.25)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '12px', marginTop: 0 }}>
                What You&apos;ll Learn
              </h3>
              {[
                'Navigating the platform',
                'Solving your first problem',
                'Submitting code',
                'Earning rewards',
                'Tracking your progress',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#8b6fff', fontSize: '14px' }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Card 2 — CTA */}
            <div
              style={{
                background: 'rgba(201,162,39,0.08)',
                border: '1px solid rgba(201,162,39,0.25)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', margin: '0 0 4px' }}>
                Start your journey.
              </p>
              <p style={{ color: '#c9a227', fontSize: '13px', margin: 0 }}>
                Code. Earn. Conquer.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA BAR */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,111,255,0.15)',
            borderRadius: '12px',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '48px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🚀</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: '0 0 4px' }}>
                Ready to start your coding journey?
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                Watch the complete guide and take your first step towards becoming a NEXORITHM champion.
              </p>
            </div>
          </div>
          <a
            href="/problems"
            style={{
              background: '#8b6fff',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '15px',
              whiteSpace: 'nowrap',
            }}
          >
            Start Solving Now →
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="landing-shell home-landing-shell flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        <section className="relative overflow-clip pt-8 pb-10 lg:pt-12 lg:pb-14 min-h-[100vh]">
          <div className="hero-section-bg" />
          <div className="landing-grid-bg" />
          <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] items-center relative z-10">
            <div
              className="flex flex-col justify-center"
            >
              <div className="badge-soft mb-5 w-fit flex items-center gap-2"><svg width="20" height="14" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="200" fill="#FF9933"/><rect y="200" width="900" height="200" fill="#fff"/><rect y="400" width="900" height="200" fill="#138808"/><circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="4"/><circle cx="450" cy="300" r="6" fill="#000080"/>{[...Array(24)].map((_, i) => <line key={i} x1="450" y1="300" x2={450 + 55 * Math.cos((i * 15 * Math.PI) / 180)} y2={300 + 55 * Math.sin((i * 15 * Math.PI) / 180)} stroke="#000080" strokeWidth="2" />)}</svg> India&apos;s First Skill-Reward Coding Platform</div>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-5xl">
                Become the Best.
                <br />
                Earn Real Money.
                <br />
                <span className="reward-gradient">Compete Internationally.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-secondary-text">
                Practice coding every day, climb the rankings, build powerful streaks, and earn real money based entirely on your programming skills. Every reward on Nexorithm is won through skill—not luck.
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
            </div>

            <div className="w-full">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Video Guide Section */}
        <VideoGuideSection />

        <div className="sections-bg">
        {/* Reward Timeline */}
        <section id="rewards" className="relative z-10 mx-auto max-w-[1400px] px-6 py-6">
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
        <section className="relative z-10 mx-auto max-w-[1400px] px-6 py-4">
          <div className="landing-panel p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-white text-center">How NEXORITHM Works</h2>
            <p className="mt-1.5 text-xs text-secondary-text text-center max-w-md mx-auto">
              Build your development consistency daily and unlock prizes.
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.title} 
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What is Coming Next */}
        <section className="relative z-10 mx-auto max-w-[1400px] px-6 py-4">
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
        <section className="relative z-10 mx-auto max-w-[1400px] px-6 py-6">
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
        </div>
      </main>
    </div>
  );
}
