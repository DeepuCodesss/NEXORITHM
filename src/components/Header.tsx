"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SignInButton } from "@clerk/nextjs";
import { BookOpen, Flame, Coins, ShieldAlert, Award, Menu, X, Clock, Trophy, UserRound } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navItems = [
    { name: "Problems", href: "/problems", icon: BookOpen },
    { name: "Profile", href: "/profile/guest", icon: UserRound },
    { name: "Rankings", href: "/rankings", icon: Trophy },
    { name: "Membership Soon", href: "/pro", icon: Clock },
  ];

  const isActive = (path: string) => pathname === path;

  // We don't render this main header on the general landing page (which has its own marketing layout)
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "hover:text-white hover:bg-white/5"
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
            <div className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-amber-600 animate-pulse" />
              <span className="font-bold">{user.currentStreak}d</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 rounded-md border border-yellow-300/20 bg-yellow-300/10 px-2 py-1 text-yellow-300">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-bold">{user.coins}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-zinc-300">
              <Award className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold">{user.xp.toLocaleString()} XP</span>
            </div>
            
            {/* Shields */}
            {user.streakShields > 0 && (
              <div className="flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-emerald-300" title="Streak Shields Active">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-bold">{user.streakShields} Shield</span>
              </div>
            )}
          </div>

          {/* User Profile Access */}
          {!isAuthenticated ? (
            <SignInButton mode="modal" forceRedirectUrl="/problems">
              <button className="btn-primary text-xs px-3 py-1.5 rounded-md font-bold cursor-pointer transition-all hover:scale-105 active:scale-95">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <Link
              href="/settings"
              className="flex items-center gap-2 pl-1 group"
            >
              <svg
                className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m0 14v1m8-8h1M3 12h1m15.364 6.364l.707.707M5.636 5.636l.707.707m12.728 0l.707-.707M5.636 18.364l.707-.707"
                />
              </svg>
              <span className="hidden lg:block text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                Settings
              </span>
            </Link>
          )}

          {/* Mobile Navigation Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 px-4 py-4 space-y-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
            <div className="flex flex-col items-center justify-center rounded-md border border-amber-400/20 bg-amber-400/10 p-2 text-amber-300">
              <Flame className="w-4 h-4 mb-1 fill-amber-500 stroke-amber-600" />
              <span className="font-bold">{user.currentStreak} Days</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-yellow-300/20 bg-yellow-300/10 p-2 text-yellow-300">
              <Coins className="w-4 h-4 mb-1" />
              <span className="font-bold">{user.coins} Coins</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 p-2 text-zinc-300">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/[0.08] text-white border border-white/10"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
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
