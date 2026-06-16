"use client";

import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useClerk } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AuthPanel() {
  const router = useRouter();
  const { signOut: clerkSignOut } = useClerk();
  const { isAuthenticated, user, signOut } = useApp();

  if (isAuthenticated) {
    return (
      <div className="auth-panel surface-panel rounded-xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-success/30 bg-success/10">
            <UserRound className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-success">Account ready</p>
            <h2 className="text-lg font-black text-white">Welcome, {user.fullName.split(" ")[0]}</h2>
          </div>
        </div>
        <p className="text-sm leading-6 text-secondary-text">
          Your account is connected through Clerk and synced with the Nexorithm database.
        </p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => router.push(`/profile/${user.username}`)}
            className="btn-primary h-11 w-full text-sm"
          >
            Go to Profile
          </button>
          <button
            type="button"
            onClick={async () => {
              signOut();
              await clerkSignOut({ redirectUrl: "/" });
            }}
            className="btn-secondary h-11 w-full text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-panel surface-panel rounded-xl p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Join Nexorithm</p>
        <h2 className="mt-2 text-xl font-black text-white">Create or access your account</h2>
        <p className="mt-2 text-sm leading-6 text-secondary-text">
          Use Clerk to sign up, sign in, and keep your submissions tied to one real user identity.
        </p>
      </div>

      <div className="space-y-3">
        <SignUpButton mode="modal">
          <button type="button" className="auth-provider-btn">
            <UserRound className="h-4 w-4" />
            Sign up
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button type="button" className="auth-provider-btn">
            <ArrowRight className="h-4 w-4" />
            Sign in
          </button>
        </SignInButton>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-secondary-text">
          <ShieldCheck className="h-4 w-4 text-success" />
          All authentication now goes through Clerk. No local demo login remains.
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
        By continuing, you agree to Nexorithm&apos;s contest rules and payout terms.
      </p>
    </div>
  );
}
