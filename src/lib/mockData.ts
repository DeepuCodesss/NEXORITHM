import type { JudgeLanguage } from "@/lib/languages";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Very Hard";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  level: number;
  topic: string;
  pattern: string;
  xpReward: number;
  coinReward: number;
  prizeMoneyInr?: number;
  description: string;
  judge: {
    kind: "sum" | "max" | "count-even" | "reverse-words" | "gcd" | "range-sum";
  };
  starterCode: Record<JudgeLanguage, string>;
  testCases: {
    id: number;
    input: string;
    expected: string;
  }[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  targetCount: number;
  currentCount: number;
  type: "Daily" | "Weekly" | "Monthly";
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  college: string;
  streak: number;
  solvedCount: number;
  isPro: boolean;
  devRank: number;
}

export type AuthProvider = "guest" | "google" | "github" | "email";

export interface UserState {
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string;
  authProvider: AuthProvider;
  xp: number;
  coins: number;
  reputation: number;
  devRank: number;
  currentStreak: number;
  longestStreak: number;
  streakShields: number;
  isPro: boolean;
  college: string;
  solvedProblemIds: string[];
}

export interface SolveRewardResult {
  awarded: boolean;
  alreadySolved: boolean;
  xpGained: number;
  coinsGained: number;
  reputationGained: number;
}

const starterCode = (functionName: string): Record<JudgeLanguage, string> => ({
  javascript: `function ${functionName}(input) {\n  // Write your solution here\n}\n`,
  python: `def ${functionName}(input):\n    # Write your solution here\n    pass\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n\n  // Read from stdin and print the answer.\n  return 0;\n}\n`,
  c: `#include <stdio.h>\n\nint main(void) {\n  // Read from stdin and print the answer.\n  return 0;\n}\n`,
  java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    // Read from stdin and print the answer.\n  }\n}\n`,
  go: `package main\n\nimport (\n  "bufio"\n  "fmt"\n  "os"\n)\n\nfunc main() {\n  in := bufio.NewReader(os.Stdin)\n  _ = in\n  // Read from stdin and print the answer.\n  fmt.Print("")\n}\n`,
  rust: `use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    // Read from input and print the answer.\n}\n`,
  php: `<?php\n$input = stream_get_contents(STDIN);\n// Read from $input and print the answer.\n`,
  ruby: `input = STDIN.read\n# Read from input and print the answer.\n`,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const tracks = [
  {
    topic: "Programming Basics",
    patterns: ["Print and Input", "Variables", "Arithmetic", "Conditionals", "Loops", "Functions"],
  },
  {
    topic: "Math Foundations",
    patterns: ["Parity", "Divisibility", "GCD", "Prime Numbers", "Modular Arithmetic", "Combinatorics"],
  },
  {
    topic: "Arrays",
    patterns: ["Traversal", "Prefix Sums", "Two Pointers", "Sliding Window", "Kadane", "Partitioning"],
  },
  {
    topic: "Strings",
    patterns: ["Character Counting", "Substrings", "Palindromes", "Pattern Matching", "Anagrams", "Parsing"],
  },
  {
    topic: "Hashing",
    patterns: ["Frequency Map", "Set Membership", "Pair Lookup", "Grouping", "Rolling Hash", "Deduplication"],
  },
  {
    topic: "Sorting and Searching",
    patterns: ["Custom Sort", "Binary Search", "Lower Bound", "Search on Answer", "Intervals", "Sweep Line"],
  },
  {
    topic: "Stacks and Queues",
    patterns: ["Monotonic Stack", "Expression Evaluation", "Next Greater Element", "Deque Window", "BFS Queue", "Min Stack"],
  },
  {
    topic: "Linked Lists",
    patterns: ["Pointer Basics", "Fast Slow Pointers", "Reverse List", "Merge Lists", "Cycle Detection", "LRU Design"],
  },
  {
    topic: "Trees",
    patterns: ["Traversal", "Depth", "BST", "Lowest Common Ancestor", "Serialization", "Tree DP"],
  },
  {
    topic: "Graphs",
    patterns: ["DFS", "BFS", "Topological Sort", "Shortest Path", "Union Find", "Minimum Spanning Tree"],
  },
  {
    topic: "Dynamic Programming",
    patterns: ["1D DP", "2D DP", "Knapsack", "LIS", "Digit DP", "Bitmask DP"],
  },
  {
    topic: "Advanced Algorithms",
    patterns: ["Segment Tree", "Fenwick Tree", "Trie", "KMP", "Max Flow", "Heavy Light Decomposition"],
  },
];

const difficultyForLevel = (level: number): Difficulty => {
  if (level <= 1200) return "Easy";
  if (level <= 2700) return "Medium";
  if (level <= 3900) return "Hard";
  return "Very Hard";
};

const rewardForDifficulty = (difficulty: Difficulty) => {
  if (difficulty === "Easy") return { xpReward: 50, coinReward: 5 };
  if (difficulty === "Medium") return { xpReward: 150, coinReward: 15 };
  if (difficulty === "Hard") return { xpReward: 300, coinReward: 30 };
  return { xpReward: 500, coinReward: 50 };
};

type JudgeKind = Problem["judge"]["kind"];

const judgeKinds: JudgeKind[] = ["sum", "max", "count-even", "reverse-words", "gcd", "range-sum"];

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
};

const buildNumbers = (seed: number, count: number) =>
  Array.from({ length: count }, (_, index) => ((seed * (index + 3) + index * 11) % 97) - 32);

export const solveReference = (kind: JudgeKind, input: string): string => {
  const lines = input.trim().split(/\r?\n/);
  const numbers = input.match(/-?\d+/g)?.map(Number) ?? [];

  if (kind === "sum") return String(numbers.slice(1).reduce((total, value) => total + value, 0));
  if (kind === "max") return String(Math.max(...numbers.slice(1)));
  if (kind === "count-even") return String(numbers.slice(1).filter((value) => value % 2 === 0).length);
  if (kind === "reverse-words") return lines.slice(1).join(" ").trim().split(/\s+/).reverse().join(" ");
  if (kind === "gcd") return String(gcd(numbers[0] ?? 0, numbers[1] ?? 0));

  const n = numbers[0] ?? 0;
  const values = numbers.slice(1, n + 1);
  const left = numbers[n + 1] ?? 1;
  const right = numbers[n + 2] ?? n;
  return String(values.slice(left - 1, right).reduce((total, value) => total + value, 0));
};

const taskCopy: Record<JudgeKind, { title: string; body: string }> = {
  sum: {
    title: "Array Total",
    body: "Given n integers, return the sum of all values.",
  },
  max: {
    title: "Largest Value",
    body: "Given n integers, return the largest value.",
  },
  "count-even": {
    title: "Even Counter",
    body: "Given n integers, return how many values are even.",
  },
  "reverse-words": {
    title: "Reverse Words",
    body: "Given a line of words, return the words in reverse order separated by one space.",
  },
  gcd: {
    title: "Common Divisor",
    body: "Given two positive integers, return their greatest common divisor.",
  },
  "range-sum": {
    title: "Range Sum",
    body: "Given n integers and one 1-indexed inclusive range l r, return the sum from l through r.",
  },
};

const buildInput = (kind: JudgeKind, seed: number) => {
  if (kind === "reverse-words") {
    const words = ["alpha", "bravo", "code", "delta", "logic", "matrix", "nexo", "query"];
    const count = 3 + (seed % 4);
    return `${count}\n${Array.from({ length: count }, (_, index) => words[(seed + index * 2) % words.length]).join(" ")}`;
  }

  if (kind === "gcd") {
    const first = 24 + (seed % 23) * 6;
    const second = 36 + (seed % 19) * 9;
    return `${first} ${second}`;
  }

  const count = 5 + (seed % 5);
  const values = buildNumbers(seed, count);
  if (kind === "range-sum") {
    const left = 1 + (seed % Math.max(1, count - 2));
    const right = Math.min(count, left + 2 + (seed % 2));
    return `${count}\n${values.join(" ")}\n${left} ${right}`;
  }

  return `${count}\n${values.join(" ")}`;
};

const buildTestCases = (kind: JudgeKind, level: number) =>
  [level, level + 137, level + 911].map((seed, index) => {
    const input = buildInput(kind, seed);
    return {
      id: index + 1,
      input,
      expected: solveReference(kind, input),
    };
  });

const generateProblem = (level: number): Problem => {
  const track = tracks[(level - 1) % tracks.length];
  const pattern = track.patterns[Math.floor((level - 1) / tracks.length) % track.patterns.length];
  const difficulty = difficultyForLevel(level);
  const kind = judgeKinds[(level - 1) % judgeKinds.length];
  const title = `${pattern}: ${taskCopy[kind].title}`;
  const slug = slugify(`${track.topic}-${pattern}-${level}`);
  const functionName = `solve${level}`;
  const rewards = rewardForDifficulty(difficulty);
  const testCases = buildTestCases(kind, level);

  return {
    id: slug,
    title,
    slug,
    difficulty,
    level,
    topic: track.topic,
    pattern,
    ...rewards,
    prizeMoneyInr: level <= 3 ? [1000, 2500, 5000][level - 1] : undefined,
    description: `
<p>Solve a <strong>${difficulty}</strong> problem from <strong>${track.topic}</strong>, focused on <strong>${pattern}</strong>.</p>
<p>${taskCopy[kind].body}</p>
<h4 class="text-sm font-semibold mt-4 text-zinc-300">Task</h4>
<p>Implement the function so it accepts the raw input string and returns the exact expected output as a string or number.</p>
<h4 class="text-sm font-semibold mt-4 text-zinc-300">Note</h4>
<p>The backend judge runs every sample for Run Code and all generated cases for Submit.</p>
    `,
    judge: { kind },
    starterCode: starterCode(functionName),
    testCases,
  };
};

export const QUESTION_COUNT = 4500;
export const MOCK_PROBLEMS: Problem[] = Array.from({ length: QUESTION_COUNT }, (_, index) => generateProblem(index + 1));

export const DAILY_PRIZE_PROBLEMS = MOCK_PROBLEMS.slice(0, 3).map((problem, index) => ({
  ...problem,
  title: ["Beginner Cash Sprint", "Logic Builder Prize Round", "Very Hard Grand Challenge"][index],
  prizeMoneyInr: [1000, 2500, 5000][index],
}));

export const INITIAL_USER: UserState = {
  fullName: "Guest Developer",
  username: "guest",
  email: "",
  avatarUrl: "/next.svg",
  authProvider: "guest",
  xp: 0,
  coins: 0,
  reputation: 0,
  devRank: 0,
  currentStreak: 0,
  longestStreak: 0,
  streakShields: 0,
  isPro: false,
  college: "Connect authentication to set college",
  solvedProblemIds: [],
};

export const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "First Real Submission",
    description: "Connect the judge API, then complete your first verified submission.",
    xpReward: 100,
    coinReward: 20,
    targetCount: 1,
    currentCount: 0,
    type: "Daily",
  },
  {
    id: "m2",
    title: "Profile Setup",
    description: "Connect Clerk and complete the developer profile fields.",
    xpReward: 50,
    coinReward: 10,
    targetCount: 1,
    currentCount: 0,
    type: "Weekly",
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [];
