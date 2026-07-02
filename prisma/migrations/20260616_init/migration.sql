CREATE TABLE "Problem" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "topic" TEXT NOT NULL,
  "pattern" TEXT NOT NULL,
  "judgeKind" TEXT NOT NULL,
  "xpReward" INTEGER NOT NULL,
  "coinReward" INTEGER NOT NULL,
  "prizeMoneyInr" INTEGER,
  "description" TEXT NOT NULL,
  "starterCode" JSONB NOT NULL,
  "testCases" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
CREATE UNIQUE INDEX "Problem_level_key" ON "Problem"("level");

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "avatarUrl" TEXT NOT NULL,
  "avatarMode" TEXT NOT NULL DEFAULT 'image',
  "avatarTheme" TEXT NOT NULL DEFAULT 'violet',
  "college" TEXT NOT NULL DEFAULT 'Connect authentication to set college',
  "authProvider" TEXT NOT NULL,
  "bio" TEXT NOT NULL DEFAULT '',
  "graduationYear" TEXT NOT NULL DEFAULT '',
  "country" TEXT NOT NULL DEFAULT '',
  "preferredLanguage" TEXT NOT NULL DEFAULT 'C++',
  "publicProfile" BOOLEAN NOT NULL DEFAULT true,
  "showCollege" BOOLEAN NOT NULL DEFAULT true,
  "showStats" BOOLEAN NOT NULL DEFAULT true,
  "website" TEXT NOT NULL DEFAULT '',
  "github" TEXT NOT NULL DEFAULT '',
  "linkedin" TEXT NOT NULL DEFAULT '',
  "twitter" TEXT NOT NULL DEFAULT '',
  "xp" INTEGER NOT NULL DEFAULT 0,
  "coins" INTEGER NOT NULL DEFAULT 0,
  "moneyEarnedInr" INTEGER NOT NULL DEFAULT 0,
  "reputation" INTEGER NOT NULL DEFAULT 0,
  "devRank" INTEGER NOT NULL DEFAULT 0,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "streakShields" INTEGER NOT NULL DEFAULT 0,
  "isPro" BOOLEAN NOT NULL DEFAULT false,
  "solvedProblemIds" JSONB NOT NULL,
  "showcaseBadges" TEXT NOT NULL DEFAULT '',
  "lastSolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_xp_currentStreak_lastSolvedAt_idx" ON "User"("xp", "currentStreak", "lastSolvedAt");
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");
CREATE INDEX "User_username_updatedAt_idx" ON "User"("username", "updatedAt");

CREATE TABLE "ProblemBoardConfig" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "showUpcomingRewards" BOOLEAN NOT NULL DEFAULT true,
  "upcomingRewardItems" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProblemBoardConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "userId" TEXT,
  "language" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "passedCount" INTEGER NOT NULL,
  "totalCount" INTEGER NOT NULL,
  "runtimeMs" INTEGER NOT NULL,
  "output" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SolutionReplay" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "replayData" JSONB NOT NULL,
  "solveTimeSeconds" INTEGER NOT NULL,
  "pasteCount" INTEGER NOT NULL DEFAULT 0,
  "pastedCharacters" INTEGER NOT NULL DEFAULT 0,
  "runCount" INTEGER NOT NULL DEFAULT 0,
  "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SolutionReplay_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ProblemBoardConfig"
(
    "id",
    "showUpcomingRewards",
    "upcomingRewardItems",
    "createdAt",
    "updatedAt"
)
VALUES
(
    '__MIGRATION_MARKER__',
    true,
    '[]'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

CREATE INDEX "Submission_problemId_createdAt_idx" ON "Submission"("problemId", "createdAt");
CREATE INDEX "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

CREATE UNIQUE INDEX "SolutionReplay_submissionId_key" ON "SolutionReplay"("submissionId");
CREATE UNIQUE INDEX "SolutionReplay_userId_problemId_key" ON "SolutionReplay"("userId", "problemId");
CREATE INDEX "SolutionReplay_problemId_createdAt_idx" ON "SolutionReplay"("problemId", "createdAt");
CREATE INDEX "SolutionReplay_solveTimeSeconds_createdAt_idx" ON "SolutionReplay"("solveTimeSeconds", "createdAt");

CREATE TABLE "WithdrawalRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "upiId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WithdrawalRequest_userId_createdAt_idx" ON "WithdrawalRequest"("userId", "createdAt");
CREATE INDEX "WithdrawalRequest_status_createdAt_idx" ON "WithdrawalRequest"("status", "createdAt");

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_problemId_fkey"
  FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "SolutionReplay"
  ADD CONSTRAINT "SolutionReplay_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SolutionReplay"
  ADD CONSTRAINT "SolutionReplay_problemId_fkey"
  FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WithdrawalRequest"
  ADD CONSTRAINT "WithdrawalRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
