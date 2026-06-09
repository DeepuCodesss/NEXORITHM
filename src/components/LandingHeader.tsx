"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, LogIn } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function LandingHeader() {
  const { user, isAuthenticated } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-mono text-lg font-black tracking-tight text-white">
          NEXO<span className="text-primary">RITHM</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/problems" className="rounded-md px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
            Problems
          </Link>
          <Link href="/rankings" className="rounded-md px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
            Rankings
          </Link>
          <Link href="/pro" className="rounded-md px-3 py-2 text-xs font-bold text-zinc-400 transition-colors hover:text-white">
            Membership
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
                className="h-5 w-5 rounded-full object-cover"
              />
              {user.fullName.split(" ")[0]}
            </Link>
          ) : (
            <a href="#join" className="btn-primary h-9 gap-1.5 px-3 text-xs">
              <LogIn className="h-3.5 w-3.5" />
              Sign Up
            </a>
          )}
          <Link href="/problems" className="btn-secondary hidden h-9 px-3 text-xs sm:inline-flex">
            Problems
          </Link>
          <Link href="/pro" className="btn-secondary h-9 gap-1.5 px-3 text-xs">
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Membership</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
