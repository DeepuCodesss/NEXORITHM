"use client";

import { SignInButton } from "@clerk/nextjs";

export default function GuestProfileSignIn({ className = "" }: { className?: string }) {
  return (
    <SignInButton mode="modal">
      <button type="button" className={className}>
        Login to create your own profile
      </button>
    </SignInButton>
  );
}
