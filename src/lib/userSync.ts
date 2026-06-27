import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { getPrisma } from "@/lib/db";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

const usernameFromEmail = (email: string) =>
  email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "coder";

export const buildUserProfile = (clerkUser: ClerkUser) => {
  const fallbackEmail = `${clerkUser.id}@clerk.local`;
  const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || fallbackEmail;
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || clerkUser.username || "Nexorithm Coder";
  const username = clerkUser.username || `${usernameFromEmail(email)}-${clerkUser.id.slice(0, 6)}`;
  const avatarUrl = clerkUser.imageUrl && !clerkUser.imageUrl.includes("dicebear.com") ? clerkUser.imageUrl : "/default-avatar.svg";

  return {
    id: clerkUser.id,
    clerkId: clerkUser.id,
    username,
    fullName,
    email,
    avatarUrl,
    authProvider: clerkUser.externalAccounts[0]?.provider || "email",
    college: "Connect authentication to set college",
  };
};

export const upsertClerkUser = async (clerkUser: ClerkUser) => {
  const prisma = getPrisma();
  const profile = buildUserProfile(clerkUser);

  return prisma.user.upsert({
    where: { clerkId: profile.clerkId },
    update: {
      username: profile.username,
      fullName: profile.fullName,
      email: profile.email,
      authProvider: profile.authProvider,
    },
    create: {
      ...profile,
      xp: 0,
      coins: 0,
      moneyEarnedInr: 0,
      reputation: 0,
      devRank: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakShields: 0,
      solvedProblemIds: [],
    },
  });
};
