"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { useApp } from "@/context/AppContext";
import { BookOpen, Flame, Coins, ShieldAlert, Award, Menu, X, Trophy, Gift, CalendarDays, UserRound, IndianRupee } from "lucide-react";
import { useState } from "react";

const AVATAR_GRADIENTS = [
  "from-[#F97316] via-[#FB7185] to-[#8B5CF6]",
  "from-[#8B5CF6] via-[#06B6D4] to-[#22C55E]",
  "from-[#0EA5E9] via-[#6366F1] to-[#A78BFA]",
  "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
  "from-[#22C55E] via-[#14B8A6] to-[#38BDF8]",
  "from-[#EC4899] via-[#8B5CF6] to-[#06B6D4]",
];

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "?";
}

function getThemeById(themeId?: string) {
  const themes: Record<string, string> = {
    violet: AVATAR_GRADIENTS[0],
    aurora: AVATAR_GRADIENTS[1],
    sky: AVATAR_GRADIENTS[2],
    sunset: AVATAR_GRADIENTS[3],
    mint: AVATAR_GRADIENTS[4],
    rose: AVATAR_GRADIENTS[5],
  };
  return themes[themeId || "violet"] || AVATAR_GRADIENTS[0];
}

export default function Header() {
  const pathname = usePathname();
  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { user, isAuthenticated, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayUsername =
    clerkUser?.username ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    user.username;
  const displayAvatar = user.avatarUrl && !user.avatarUrl.includes("dicebear.com") ? user.avatarUrl : "/default-avatar.svg";
  
  const showInitials = user.avatarMode === "initials";
  const initialsText = getInitials(user.fullName || (clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "") || displayUsername);
  const initialsTheme = getThemeById(user.avatarTheme);

  // The unique DB username must be used for routing, not the display name (which might have spaces)
  const profileHref = isSignedIn && user?.username && user.username !== "guest" 
    ? `/profile/${user.username}` 
    : `/profile/${clerkUser?.username || user?.username || "guest"}`;


  const navItems = [
    { name: "Problems", href: "/problems", icon: BookOpen },
    { name: "Contests", href: "/contests", icon: CalendarDays },
    { name: "Rankings", href: "/rankings", icon: Trophy },
    { name: "Rewards", href: "/rewards", icon: Gift },
    { name: "Profile", href: profileHref, icon: UserRound },
  ];

  const isActive = (path: string) => pathname === path;

  // We don't render this main header on the general landing page (which has its own marketing layout)
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-white">
              NEXO<span className="text-primary">RITHM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 transition-colors ${
                    active
                      ? "border-primary0 text-white"
                      : "border-transparent hover:text-white hover:bg-hover"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Coder Gamified Stats & Profile */}
        <div className="flex items-center gap-3">
          {/* Gamified Widgets (Desktop Only) */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono border-r border-border pr-4">
            {/* Streak */}
            <div className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-primary">
              <Flame className="w-3.5 h-3.5 fill-primary0 stroke-primary animate-pulse" />
              <span className="font-bold">{user.currentStreak}d</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 rounded-md border border-reward/20 bg-reward/10 px-2 py-1 text-reward">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-bold">{user.coins}</span>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-2 py-1 text-success">
              <IndianRupee className="h-3.5 w-3.5" />
              <span className="font-bold">{Math.max(0, user.moneyEarnedInr).toLocaleString()}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-hover px-2 py-1 text-secondary-text">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold">{user.xp.toLocaleString()} XP</span>
            </div>
            
            {/* Shields */}
            {user.streakShields > 0 && (
              <div className="flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-2 py-1 text-success" title="Streak Shields Active">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-bold">{user.streakShields} Shield</span>
              </div>
            )}
          </div>

          {/* User Profile Access */}
          {!isAuthenticated ? (
            <SignInButton mode="modal">
              <button className="btn-primary text-xs px-3 py-1.5 rounded-md font-bold cursor-pointer transition-all hover:scale-105 active:scale-95">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  signOut();
                  await clerkSignOut({ redirectUrl: "/" });
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-bold text-secondary-text transition-colors hover:bg-hover hover:text-white"
              >
                Logout
              </button>
              <Link
                href={profileHref}
                className="flex items-center gap-2 pl-1 group"
                aria-label="Open user profile"
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-hover shadow-sm transition-colors group-hover:border-primary/40">
                  {showInitials ? (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${initialsTheme} text-white text-[10px] font-black leading-none`}>
                      {initialsText}
                    </div>
                  ) : (
                    <Image
                      src={displayAvatar}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  )}
                </span>
                <span className="hidden lg:block text-xs font-medium text-secondary-text group-hover:text-white transition-colors">
                  {displayUsername}
                </span>
              </Link>
            </div>
          )}

          {/* Mobile Navigation Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-secondary-text hover:bg-hover hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 px-4 py-4 space-y-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
            <div className="flex flex-col items-center justify-center rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
              <Flame className="w-4 h-4 mb-1 fill-primary0 stroke-primary" />
              <span className="font-bold">{user.currentStreak} Days</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-reward/20 bg-reward/10 p-2 text-reward">
              <Coins className="w-4 h-4 mb-1" />
              <span className="font-bold">{user.coins} Coins</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-success/20 bg-success/10 p-2 text-success">
              <IndianRupee className="mb-1 h-4 w-4" />
              <span className="font-bold">{Math.max(0, user.moneyEarnedInr).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-border bg-hover p-2 text-secondary-text">
              <Award className="w-4 h-4 mb-1 text-primary" />
              <span className="font-bold">{user.xp.toLocaleString()} XP</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary0 bg-hover text-white"
                      : "border-transparent text-muted-foreground hover:text-white hover:bg-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
