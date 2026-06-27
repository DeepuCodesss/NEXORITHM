import { getPrisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const {
      college,
      avatarUrl,
      avatarMode,
      avatarTheme,
      bio,
      graduationYear,
      country,
      preferredLanguage,
      publicProfile,
      showCollege,
      showStats,
      website,
      github,
      linkedin,
      twitter
    } = body as {
      college?: unknown;
      avatarUrl?: unknown;
      avatarMode?: unknown;
      avatarTheme?: unknown;
      bio?: unknown;
      graduationYear?: unknown;
      country?: unknown;
      preferredLanguage?: unknown;
      publicProfile?: unknown;
      showCollege?: unknown;
      showStats?: unknown;
      website?: unknown;
      github?: unknown;
      linkedin?: unknown;
      twitter?: unknown;
    };

    const updates: {
      college?: string;
      avatarUrl?: string;
      avatarMode?: string;
      avatarTheme?: string;
      bio?: string;
      graduationYear?: string;
      country?: string;
      preferredLanguage?: string;
      publicProfile?: boolean;
      showCollege?: boolean;
      showStats?: boolean;
      website?: string;
      github?: string;
      linkedin?: string;
      twitter?: string;
    } = {};

    if (college !== undefined) {
      if (typeof college !== "string") {
        return apiError("Invalid college name", 400);
      }
      updates.college = college.trim();
    }

    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== "string" || !avatarUrl.trim()) {
        return apiError("Invalid avatar image", 400);
      }
      updates.avatarUrl = avatarUrl.trim();
    }

    if (avatarMode !== undefined) {
      if (typeof avatarMode !== "string" || !["image", "initials"].includes(avatarMode)) {
        return apiError("Invalid avatar mode", 400);
      }
      updates.avatarMode = avatarMode;
    }

    if (avatarTheme !== undefined) {
      if (typeof avatarTheme !== "string" || !avatarTheme.trim()) {
        return apiError("Invalid avatar theme", 400);
      }
      updates.avatarTheme = avatarTheme.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return apiError("Invalid bio", 400);
      }
      updates.bio = bio.trim();
    }

    if (graduationYear !== undefined) {
      if (typeof graduationYear !== "string") {
        return apiError("Invalid graduation year", 400);
      }
      updates.graduationYear = graduationYear.trim();
    }

    if (country !== undefined) {
      if (typeof country !== "string") {
        return apiError("Invalid country", 400);
      }
      updates.country = country.trim();
    }

    if (preferredLanguage !== undefined) {
      if (typeof preferredLanguage !== "string") {
        return apiError("Invalid preferred language", 400);
      }
      updates.preferredLanguage = preferredLanguage.trim();
    }

    if (publicProfile !== undefined) {
      if (typeof publicProfile !== "boolean") {
        return apiError("Invalid public profile status", 400);
      }
      updates.publicProfile = publicProfile;
    }

    if (showCollege !== undefined) {
      if (typeof showCollege !== "boolean") {
        return apiError("Invalid show college status", 400);
      }
      updates.showCollege = showCollege;
    }

    if (showStats !== undefined) {
      if (typeof showStats !== "boolean") {
        return apiError("Invalid show stats status", 400);
      }
      updates.showStats = showStats;
    }

    if (website !== undefined) {
      if (typeof website !== "string") return apiError("Invalid website", 400);
      updates.website = website.trim().slice(0, 200);
    }

    if (github !== undefined) {
      if (typeof github !== "string") return apiError("Invalid github", 400);
      updates.github = github.trim().slice(0, 100);
    }

    if (linkedin !== undefined) {
      if (typeof linkedin !== "string") return apiError("Invalid linkedin", 400);
      updates.linkedin = linkedin.trim().slice(0, 100);
    }

    if (twitter !== undefined) {
      if (typeof twitter !== "string") return apiError("Invalid twitter", 400);
      updates.twitter = twitter.trim().slice(0, 100);
    }

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: updates,
    });

    return apiSuccess({ user });
  } catch (err: unknown) {
    console.error("Failed to update profile:", err);
    return apiError(err instanceof Error ? err.message : "Failed to update profile", 500);
  }
}
