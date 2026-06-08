import Database from "better-sqlite3";

const db = new Database("dev.db");

db.exec(`
CREATE TABLE IF NOT EXISTS Problem (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  pattern TEXT NOT NULL,
  judgeKind TEXT NOT NULL,
  xpReward INTEGER NOT NULL,
  coinReward INTEGER NOT NULL,
  prizeMoneyInr INTEGER,
  description TEXT NOT NULL,
  starterCode TEXT NOT NULL,
  testCases TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Submission (
  id TEXT PRIMARY KEY NOT NULL,
  problemId TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL,
  passedCount INTEGER NOT NULL,
  totalCount INTEGER NOT NULL,
  runtimeMs INTEGER NOT NULL,
  output TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (problemId) REFERENCES Problem(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS Submission_problemId_idx ON Submission(problemId);
CREATE INDEX IF NOT EXISTS Submission_createdAt_idx ON Submission(createdAt);
`);

db.close();
console.log("dev.db ready");
