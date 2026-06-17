import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, BookOpen, CircleDollarSign, Code2, Flame, Gift, Home, Medal, Trophy } from "lucide-react";
import { getPrisma } from "@/lib/db";

type ProfilePayload = {
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  coins: number;
  currentStreak: number;
  solvedCount: number;
  globalRank: number;
  college: string;
  joinedDate: string;
  recentActivity: Array<{ id: string; status: string; problemTitle: string; problemSlug: string; createdAt: string }>;
  badges: Array<{ id: string; label: string; active: boolean }>;
};

type PageProps = { params: Promise<{ username: string }> };

const buildProfile = async (username: string): Promise<ProfilePayload | null> => {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      xp: true,
      coins: true,
      currentStreak: true,
      solvedProblemIds: true,
      college: true,
      createdAt: true,
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          problem: { select: { title: true, slug: true } },
        },
      },
    },
  });

  if (!user) return null;

  const ranked = await prisma.user.findMany({
    select: {
      id: true,
      xp: true,
      currentStreak: true,
      solvedProblemIds: true,
      lastSolvedAt: true,
      updatedAt: true,
    },
  });

  const solvedProblemIds = Array.isArray(user.solvedProblemIds)
    ? user.solvedProblemIds.filter((value): value is string => typeof value === "string")
    : [];
  const globalRank =
    ranked
      .map((entry) => ({
        ...entry,
        solvedCount: Array.isArray(entry.solvedProblemIds) ? entry.solvedProblemIds.length : 0,
        lastSolvedTs: entry.lastSolvedAt ? new Date(entry.lastSolvedAt).getTime() : 0,
      }))
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
        if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
        if (a.lastSolvedTs !== b.lastSolvedTs) return a.lastSolvedTs - b.lastSolvedTs;
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      })
      .findIndex((entry) => entry.id === user.id) + 1;

  return {
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    coins: user.coins,
    currentStreak: user.currentStreak,
    solvedCount: solvedProblemIds.length,
    globalRank,
    college: user.college,
    joinedDate: user.createdAt.toISOString(),
    recentActivity: user.submissions.map((item) => ({
      id: item.id,
      status: item.status,
      problemTitle: item.problem.title,
      problemSlug: item.problem.slug,
      createdAt: item.createdAt.toISOString(),
    })),
    badges: [
      { id: "first-solve", label: "First Solve", active: solvedProblemIds.length > 0 },
      { id: "streak-7", label: "7 Day Streak", active: user.currentStreak >= 7 },
      { id: "xp-500", label: "500 XP", active: user.xp >= 500 },
    ],
  };
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const profile = await buildProfile(username);
  if (!profile) {
    return { title: "Profile not found | Nexorithm" };
  }

  return {
    title: `${profile.fullName} (@${profile.username}) | Nexorithm`,
    description: `View ${profile.fullName}'s Nexorithm profile, rank, XP, streak, and recent activity.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await buildProfile(username);
  if (!profile) notFound();

  const navItems = [
    { label: "Overview", href: `/profile/${profile.username}`, icon: Home },
    { label: "Problems", href: "/problems", icon: BookOpen },
    { label: "Rankings", href: "/rankings", icon: Trophy },
    { label: "Rewards", href: "/rewards", icon: Gift },
  ];

  const stats = [
    { label: "Current Streak", value: `${profile.currentStreak} Days`, icon: Flame },
    { label: "Global Rank", value: `#${profile.globalRank}`, icon: Medal },
    { label: "XP", value: profile.xp.toLocaleString(), icon: Award },
    { label: "Coins", value: profile.coins.toLocaleString(), icon: CircleDollarSign },
  ];

  return (
    <div className="app-shell min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-[1540px] gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="surface-panel hidden rounded-lg p-3 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)]">
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={`flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${index === 0 ? "bg-primary text-white" : "text-secondary-text hover:bg-hover hover:text-white"}`}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="surface-panel rounded-lg p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-primary bg-hover p-1">
                <Image src={profile.avatarUrl} alt="" width={112} height={112} unoptimized className="h-full w-full rounded-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black text-white">{profile.fullName}</h1>
                  <BadgeCheck className="h-5 w-5 fill-primary text-white" />
                </div>
                <p className="mt-1 font-mono text-sm text-secondary-text">@{profile.username}</p>
                <p className="mt-4 text-sm leading-6 text-secondary-text">Joined {new Date(profile.joinedDate).toLocaleDateString()}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-secondary-text">{profile.college}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="surface-card rounded-lg p-5">
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-4 text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold text-secondary-text">{stat.label}</p>
                </div>
              );
            })}
          </section>

          <section className="surface-card rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-black text-white">
                <Code2 className="h-4 w-4 text-primary" />
                Recent Activity
              </h2>
            </div>
            <div className="mt-4 divide-y divide-border">
              {profile.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-bold text-white">{item.problemTitle}</span>
                  <span className="text-secondary-text">{item.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white">Badges</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span key={badge.id} className={`rounded-lg border px-3 py-2 text-xs font-bold ${badge.active ? "border-success/20 bg-success/10 text-success" : "border-border bg-card text-secondary-text"}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
