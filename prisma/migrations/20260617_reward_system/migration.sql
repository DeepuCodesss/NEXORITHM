CREATE TABLE IF NOT EXISTS "RewardTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "metadata" JSON,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RewardTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "RewardTransaction_userId_createdAt_idx" ON "RewardTransaction"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "Withdrawal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "coins" INTEGER NOT NULL,
  "cashAmount" REAL NOT NULL,
  "upiId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Withdrawal_userId_createdAt_idx" ON "Withdrawal"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Withdrawal_status_createdAt_idx" ON "Withdrawal"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "LiveReward" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "problemId" TEXT NOT NULL UNIQUE,
  "rewardMoney" REAL NOT NULL,
  "startsAt" DATETIME NOT NULL,
  "endsAt" DATETIME NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "winnerUserId" TEXT,
  "winnerSubmissionId" TEXT,
  "paidAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "LiveReward_isActive_startsAt_endsAt_idx" ON "LiveReward"("isActive", "startsAt", "endsAt");
