"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Code2, Gift, Moon, UserRound } from "lucide-react";

function UserAvatar({ src, name }: { src?: string; name: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || imageFailed) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary0/30 bg-primary0/10 text-[9px] font-black text-primary">
        {initials || <UserRound className="h-3 w-3" />}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={20}
      height={20}
      onError={() => setImageFailed(true)}
      className="h-5 w-5 rounded-full border border-border object-cover"
    />
  );
}

export default function LandingHeader() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const displayUsername =
    clerkUser?.username ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Log in";
  const profileHref = isSignedIn && clerkUser ? `/profile/${clerkUser.username || displayUsername}` : "/problems";

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

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/problems" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Problems
          </Link>
          <Link href="/contests" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Contests
          </Link>
          <Link href="/#rewards" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Rewards
          </Link>
          <Link href="/rankings" className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Rankings
          </Link>
          <Link href={profileHref} className="text-sm font-medium text-secondary-text transition-colors hover:text-white">
            Profile
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

          {!isLoaded ? (
            <span className="btn-secondary hidden h-9 px-4 text-xs sm:inline-flex">Loading...</span>
          ) : isSignedIn && clerkUser ? (
            <Link
              href={`/profile/${clerkUser.username || displayUsername}`}
              className="btn-secondary h-9 gap-2 px-3 text-xs"
            >
              <UserAvatar src={clerkUser.imageUrl} name={displayUsername} />
              <span className="hidden sm:inline">{displayUsername}</span>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="btn-secondary hidden h-9 px-4 text-xs sm:inline-flex">
                Log in
              </button>
            </SignInButton>
          )}

          <SignInButton mode="modal">
            <button type="button" className="btn-gradient h-9 gap-2 px-4 text-xs">
            <Gift className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Sign up</span>
            <span className="sm:hidden">Start</span>
            </button>
          </SignInButton>
        </div>
      </div>
    </header>
  );
}
