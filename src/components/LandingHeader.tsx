"use client";

import Link from "next/link";
import Image from "next/image";
import { Code2, Gift, Moon } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LandingHeader() {
  const { user, isAuthenticated } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary0/20 bg-primary0/10 text-primary">
            <Code2 className="h-4.5 w-4.5" />
          </span>
          <span className="font-mono text-lg font-black tracking-tight">
            NEXO<span className="text-primary">RITHM</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/problems" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Problems
          </Link>
          <Link href="/#rewards" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Rewards
          </Link>
          <Link href="/rankings" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Rankings
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Theme preview"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-secondary-text transition-colors hover:border-border hover:text-white sm:inline-flex"
          >
            <Moon className="h-4 w-4" />
          </button>

          {isAuthenticated ? (
            <Link
              href={`/profile/${user.username}`}
              className="btn-secondary h-9 gap-2 px-3 text-xs"
            >
              <Image
                src={user.avatarUrl}
                alt={user.fullName}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover border border-border"
              />
              <span className="hidden sm:inline">{user.fullName.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/problems" className="btn-secondary hidden h-9 px-4 text-xs sm:inline-flex">
              Log in
            </Link>
          )}

          <Link href="/problems" className="btn-gradient h-9 gap-2 px-4 text-xs">
            <Gift className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Sign up</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
