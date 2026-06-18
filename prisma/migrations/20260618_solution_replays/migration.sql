CREATE TABLE IF NOT EXISTS "SolutionReplay" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "SolutionReplay_submissionId_key" ON "SolutionReplay"("submissionId");
CREATE UNIQUE INDEX IF NOT EXISTS "SolutionReplay_userId_problemId_key" ON "SolutionReplay"("userId", "problemId");
CREATE INDEX IF NOT EXISTS "SolutionReplay_problemId_createdAt_idx" ON "SolutionReplay"("problemId", "createdAt");
CREATE INDEX IF NOT EXISTS "SolutionReplay_solveTimeSeconds_createdAt_idx" ON "SolutionReplay"("solveTimeSeconds", "createdAt");

ALTER TABLE "SolutionReplay"
  ADD CONSTRAINT "SolutionReplay_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SolutionReplay"
  ADD CONSTRAINT "SolutionReplay_problemId_fkey"
  FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
