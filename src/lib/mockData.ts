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
  discussions: {
    id: string;
    author: string;
    role: string;
    postedAgo: string;
    title: string;
    body: string;
    upvotes: number;
    replies: number;
  }[];
  editorial: {
    overview: string;
    approach: string[];
    complexity: {
      time: string;
      space: string;
    };
  };
  optimizedSolutions: {
    language: JudgeLanguage;
    label: string;
    code: string;
    explanation: string;
  }[];
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

const formatHtmlBlock = (value: string) => value.trim().replace(/\n/g, "<br />");

const problemGuides: Record<
  JudgeKind,
  {
    statement: string;
    inputFormat: string[];
    outputFormat: string;
    constraints: string[];
    explanation: (testCase: Problem["testCases"][number]) => string[];
  }
> = {
  sum: {
    statement:
      "You are given a list of integers. Your task is to compute the total sum of all values in the list.",
    inputFormat: [
      "The first line contains an integer n, the number of values.",
      "The second line contains n space-separated integers.",
    ],
    outputFormat: "Return one integer: the sum of the given values.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      return [
        `The values are ${nums.slice(1).join(", ")}.`,
        `Adding them gives ${testCase.expected}.`,
      ];
    },
  },
  max: {
    statement:
      "You are given a list of integers. Find the largest value present in the list.",
    inputFormat: [
      "The first line contains an integer n, the number of values.",
      "The second line contains n space-separated integers.",
    ],
    outputFormat: "Return one integer: the maximum value in the list.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => [
      `Scanning all values, the largest one is ${testCase.expected}.`,
      "No other value in the list is greater than it.",
    ],
  },
  "count-even": {
    statement:
      "You are given a list of integers. Count how many of them are even.",
    inputFormat: [
      "The first line contains an integer n, the number of values.",
      "The second line contains n space-separated integers.",
    ],
    outputFormat: "Return one integer: the number of even values.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number).slice(1) ?? [];
      const evens = nums.filter((value) => value % 2 === 0);
      return [
        `The even values are ${evens.join(", ")}.`,
        `There are ${testCase.expected} even values, so the answer is ${testCase.expected}.`,
      ];
    },
  },
  "reverse-words": {
    statement:
      "You are given a sequence of words. Return the same words in reverse order, separated by a single space.",
    inputFormat: [
      "The first line contains an integer n, the number of words.",
      "The remaining input contains n lowercase words.",
    ],
    outputFormat: "Return one line containing the words in reverse order.",
    constraints: ["1 <= n <= 10^5", "Each word contains only lowercase English letters."],
    explanation: (testCase) => {
      const words = testCase.input.trim().split(/\s+/).slice(1);
      return [
        `The original order is ${words.join(" -> ")}.`,
        `After reversing, the order becomes ${testCase.expected}.`,
      ];
    },
  },
  gcd: {
    statement:
      "You are given two positive integers. Find their greatest common divisor, the largest integer that divides both numbers.",
    inputFormat: ["The input contains two positive integers a and b."],
    outputFormat: "Return one integer: gcd(a, b).",
    constraints: ["1 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      return [
        `For ${nums[0]} and ${nums[1]}, the largest shared divisor is ${testCase.expected}.`,
        `Therefore, gcd(${nums[0]}, ${nums[1]}) = ${testCase.expected}.`,
      ];
    },
  },
  "range-sum": {
    statement:
      "You are given an array and one inclusive 1-indexed range. Compute the sum of the values inside that range.",
    inputFormat: [
      "The first line contains an integer n, the number of values.",
      "The second line contains n space-separated integers.",
      "The third line contains two integers l and r, the inclusive 1-indexed range.",
    ],
    outputFormat: "Return one integer: the sum of values from index l through index r.",
    constraints: ["1 <= n <= 10^5", "1 <= l <= r <= n", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      const n = nums[0];
      const values = nums.slice(1, n + 1);
      const left = nums[n + 1];
      const right = nums[n + 2];
      return [
        `The requested range is from position ${left} to ${right}.`,
        `The selected values are ${values.slice(left - 1, right).join(", ")}, and their sum is ${testCase.expected}.`,
      ];
    },
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

const buildDescription = (
  kind: JudgeKind,
  difficulty: Difficulty,
  topic: string,
  pattern: string,
  testCases: Problem["testCases"],
) => {
  const guide = problemGuides[kind];
  const sample = testCases[0];
  const sampleExplanation = guide.explanation(sample);

  return `
<p>${guide.statement}</p>
<p>This problem is part of <strong>${topic}</strong> practice and is designed to strengthen the <strong>${pattern}</strong> pattern.</p>

<h3 class="mt-7 text-base font-bold text-white">Input Format</h3>
<ul class="mt-3 list-disc space-y-1 pl-5 text-zinc-300">
  ${guide.inputFormat.map((line) => `<li>${line}</li>`).join("")}
</ul>

<h3 class="mt-7 text-base font-bold text-white">Output Format</h3>
<p>${guide.outputFormat}</p>

<h3 class="mt-7 text-base font-bold text-white">Example 1</h3>
<div class="mt-3 border-l-2 border-zinc-700 pl-4">
  <p class="font-semibold text-zinc-200">Input:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-white/10 bg-white/[0.04] p-3 font-mono text-xs leading-5 text-zinc-200">${formatHtmlBlock(sample.input)}</pre>
  <p class="mt-4 font-semibold text-zinc-200">Output:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-white/10 bg-white/[0.04] p-3 font-mono text-xs leading-5 text-zinc-200">${sample.expected}</pre>
  <p class="mt-4 font-semibold text-zinc-200">Explanation:</p>
  <ul class="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
    ${sampleExplanation.map((line) => `<li>${line}</li>`).join("")}
  </ul>
</div>

<h3 class="mt-7 text-base font-bold text-white">Constraints</h3>
<ul class="mt-3 list-disc space-y-1 pl-5 text-zinc-300">
  ${guide.constraints.map((line) => `<li><code>${line}</code></li>`).join("")}
</ul>

<h3 class="mt-7 text-base font-bold text-white">Return Requirement</h3>
<p>Implement the starter function for this <strong>${difficulty}</strong> problem. Read from the raw input string and return only the required answer, with no labels or debug text.</p>

<h3 class="mt-7 text-base font-bold text-white">Judge Behavior</h3>
<p><strong>Run Code</strong> checks the visible sample cases. <strong>Submit</strong> checks those samples plus additional hidden cases that follow the same input format and constraints.</p>
  `;
};

const buildEditorial = (
  kind: JudgeKind,
  difficulty: Difficulty,
  topic: string,
  pattern: string,
): Problem["editorial"] => {
  const approachByKind: Record<JudgeKind, string[]> = {
    sum: [
      "Parse the count and values from the raw input.",
      "Accumulate every value after the first number in one running total.",
      "Return the total as the exact output string.",
    ],
    max: [
      "Parse the count and values from the raw input.",
      "Track the largest value while scanning the array once.",
      "Return the maximum value as the exact output string.",
    ],
    "count-even": [
      "Parse the count and values from the raw input.",
      "Scan every value once and increment the answer when value % 2 equals 0.",
      "Return the final counter as the exact output string.",
    ],
    "reverse-words": [
      "Ignore the first line count after using it to understand the input format.",
      "Split the remaining text into words, reverse their order, and join with one space.",
      "Return the joined sentence without extra leading or trailing spaces.",
    ],
    gcd: [
      "Parse the two positive integers from the input.",
      "Apply Euclid's algorithm: repeatedly replace a, b with b, a % b.",
      "When b becomes zero, a is the greatest common divisor.",
    ],
    "range-sum": [
      "Parse n, the n values, and the 1-indexed inclusive range l r.",
      "For one query, slice the requested range and add the values.",
      "Return the range total as the exact output string.",
    ],
  };

  return {
    overview: `This ${difficulty.toLowerCase()} ${topic} problem is a direct practice round for the ${pattern} pattern. The key is to keep input parsing predictable, then solve with one small deterministic pass.`,
    approach: approachByKind[kind],
    complexity: {
      time: kind === "gcd" ? "O(log min(a, b))" : "O(n)",
      space: kind === "reverse-words" ? "O(n)" : "O(1) extra space",
    },
  };
};

const buildOptimizedSolutions = (kind: JudgeKind): Problem["optimizedSolutions"] => {
  const javascript: Record<JudgeKind, string> = {
    sum: `function solve(input) {
  const nums = input.match(/-?\\d+/g).map(Number);
  return String(nums.slice(1).reduce((sum, value) => sum + value, 0));
}`,
    max: `function solve(input) {
  const nums = input.match(/-?\\d+/g).map(Number);
  return String(Math.max(...nums.slice(1)));
}`,
    "count-even": `function solve(input) {
  const nums = input.match(/-?\\d+/g).map(Number);
  return String(nums.slice(1).filter((value) => value % 2 === 0).length);
}`,
    "reverse-words": `function solve(input) {
  return input
    .trim()
    .split(/\\r?\\n/)
    .slice(1)
    .join(" ")
    .trim()
    .split(/\\s+/)
    .reverse()
    .join(" ");
}`,
    gcd: `function solve(input) {
  let [a, b] = input.match(/-?\\d+/g).map(Number);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return String(Math.abs(a));
}`,
    "range-sum": `function solve(input) {
  const nums = input.match(/-?\\d+/g).map(Number);
  const n = nums[0];
  const values = nums.slice(1, n + 1);
  const left = nums[n + 1];
  const right = nums[n + 2];
  return String(values.slice(left - 1, right).reduce((sum, value) => sum + value, 0));
}`,
  };

  const python: Record<JudgeKind, string> = {
    sum: `def solve(input):
    nums = list(map(int, input.split()))
    return str(sum(nums[1:]))`,
    max: `def solve(input):
    nums = list(map(int, input.split()))
    return str(max(nums[1:]))`,
    "count-even": `def solve(input):
    nums = list(map(int, input.split()))
    return str(sum(1 for value in nums[1:] if value % 2 == 0))`,
    "reverse-words": `def solve(input):
    lines = input.strip().splitlines()
    return " ".join(" ".join(lines[1:]).split()[::-1])`,
    gcd: `def solve(input):
    a, b = map(int, input.split())
    while b:
        a, b = b, a % b
    return str(abs(a))`,
    "range-sum": `def solve(input):
    nums = list(map(int, input.split()))
    n = nums[0]
    values = nums[1:n + 1]
    left, right = nums[n + 1], nums[n + 2]
    return str(sum(values[left - 1:right]))`,
  };

  return [
    {
      language: "javascript",
      label: "JavaScript",
      code: javascript[kind],
      explanation: "Uses the same raw-input function style as the editor starter and keeps parsing close to the computation.",
    },
    {
      language: "python",
      label: "Python",
      code: python[kind],
      explanation: "Compact reference solution focused on the core pattern without extra framework code.",
    },
  ];
};

const buildDiscussions = (level: number, kind: JudgeKind, topic: string, pattern: string): Problem["discussions"] => [
  {
    id: `d-${level}-1`,
    author: "mira_codes",
    role: "Level Mentor",
    postedAgo: "2h ago",
    title: `Clean way to think about ${pattern}`,
    body: `For this ${topic} exercise, separate parsing from the actual ${pattern.toLowerCase()} idea. Once the values are shaped correctly, the solution is usually just one pass.`,
    upvotes: 18 + (level % 40),
    replies: 4 + (level % 7),
  },
  {
    id: `d-${level}-2`,
    author: "devranker",
    role: "Contest Solver",
    postedAgo: "1d ago",
    title: "Common wrong answer trap",
    body: kind === "reverse-words"
      ? "Watch for extra spaces and newlines. Joining all lines after the count before splitting avoids most formatting mistakes."
      : "The judge compares exact output, so return only the answer. Extra labels, logs, or whitespace can turn a correct idea into a wrong answer.",
    upvotes: 11 + (level % 25),
    replies: 2 + (level % 5),
  },
];

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
    description: buildDescription(kind, difficulty, track.topic, pattern, testCases),
    discussions: buildDiscussions(level, kind, track.topic, pattern),
    editorial: buildEditorial(kind, difficulty, track.topic, pattern),
    optimizedSolutions: buildOptimizedSolutions(kind),
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
