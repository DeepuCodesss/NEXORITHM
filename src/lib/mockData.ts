import type { JudgeLanguage } from "@/lib/languages";

export type Difficulty = "Very Easy" | "Easy" | "Medium" | "Hard" | "Very Hard";

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

export type ProblemSummary = Pick<Problem, "id" | "title" | "slug" | "difficulty" | "level" | "topic" | "pattern" | "xpReward" | "coinReward">;

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
  moneyEarnedInr: number;
  reputation: number;
  devRank: number;
  currentStreak: number;
  longestStreak: number;
  lastSolvedAt?: string | null;
  streakShields: number;
  isPro: boolean;
  college: string;
  solvedProblemIds: string[];
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
  avatarMode?: string;
  avatarTheme?: string;
  showcaseBadges?: string;
}

export interface SolveRewardResult {
  awarded: boolean;
  alreadySolved: boolean;
  xpGained: number;
  coinsGained: number;
  moneyGainedInr: number;
  reputationGained: number;
  currentStreak?: number;
  previousStreak?: number;
  levelBefore?: number;
  levelAfter?: number;
  unlockedTitle?: string;
}

const starterCode = (): Record<JudgeLanguage, string> => ({
  javascript: `function solve(input) {\n  // Write your solution here\n}\n`,
  python: `def solve(input):\n    # Write your solution here\n    pass\n`,
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
  if (level <= 200) return "Very Easy";
  if (level <= 1200) return "Easy";
  if (level <= 2700) return "Medium";
  if (level <= 3900) return "Hard";
  return "Very Hard";
};

const rewardForDifficulty = (difficulty: Difficulty) => {
  if (difficulty === "Very Easy") return { xpReward: 20, coinReward: 2 };
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

type VeryEasyTemplate = {
  title: string;
  topic: string;
  pattern: string;
  description: string;
  inputFormat: string[];
  outputFormat: string;
  constraints: string[];
  explanation: (testCase: Problem["testCases"][number]) => string[];
  generateInput: (seed: number) => string;
  solve: (input: string) => string;
  editorial: Problem["editorial"];
  optimized: Problem["optimizedSolutions"];
};

type EasyTemplate = {
  title: string;
  topic: string;
  pattern: string;
  judge: JudgeKind;
  description: string;
  inputFormat: string[];
  outputFormat: string;
  constraints: string[];
  explanation: (testCase: Problem["testCases"][number]) => string[];
  generateInput: (seed: number) => string;
  solve: (input: string) => string;
  editorial: Problem["editorial"];
  optimized: Problem["optimizedSolutions"];
};

const parseInts = (input: string) => input.match(/-?\d+/g)?.map(Number) ?? [];

type CompactVeryEasyTemplate = {
  title: string;
  topic: string;
  pattern: string;
  description: string;
  inputFormat: string[];
  outputFormat: string;
  constraints?: string[];
  generateInput: (seed: number) => string;
  solve: (input: string) => string;
};

const buildCompactVeryEasyTemplate = (template: CompactVeryEasyTemplate): VeryEasyTemplate => ({
  title: template.title,
  topic: template.topic,
  pattern: template.pattern,
  description: template.description,
  inputFormat: template.inputFormat,
  outputFormat: template.outputFormat,
  constraints: template.constraints ?? ["-10^9 <= value <= 10^9"],
  explanation: (testCase) => {
    const compactInput = testCase.input.trim().replace(/\s+/g, " ");
    return [`For input ${compactInput}, the required output is ${testCase.expected}.`];
  },
  generateInput: template.generateInput,
  solve: template.solve,
  editorial: {
    overview: template.description,
    approach: ["Read the input values.", "Apply the direct beginner rule from the statement.", "Return only the required answer."],
    complexity: { time: "O(1)", space: "O(1) extra space" },
  },
  optimized: [
    {
      language: "javascript",
      label: "JavaScript",
      code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g)?.map(Number) ?? [];\n  // Apply the direct beginner rule from the statement.\n  return String(nums[0] ?? 0);\n}`,
      explanation: "Parse the small input and return the required value from the statement.",
    },
    {
      language: "python",
      label: "Python",
      code: `def solve(input):\n    nums = list(map(int, input.split()))\n    # Apply the direct beginner rule from the statement.\n    return str(nums[0] if nums else 0)`,
      explanation: "Parse the small input and return the required value from the statement.",
    },
  ],
});

const baseVeryEasyTemplates: VeryEasyTemplate[] = [
  {
    title: "Add Two Integers",
    topic: "Programming Basics",
    pattern: "Input Parsing",
    description: "Given two integers a and b, return their sum.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: a + b.",
    constraints: ["-10^9 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const [a, b] = parseInts(testCase.input);
      return [`The numbers are ${a} and ${b}.`, `Their sum is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed - 97} ${97 - seed}`,
    solve: (input) => String(parseInts(input).slice(0, 2).reduce((sum, value) => sum + value, 0)),
    editorial: {
      overview: "Parse two integers, add them, and return the result.",
      approach: ["Read the two integers from input.", "Add them together.", "Return the sum as a string."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(nums[0] + nums[1]);\n}`,
        explanation: "Direct integer addition with the same raw-input style used by the judge.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b = map(int, input.split())\n    return str(a + b)`,
        explanation: "Direct integer addition with minimal parsing.",
      },
    ],
  },
  {
    title: "Sum Three Numbers",
    topic: "Programming Basics",
    pattern: "Input Parsing",
    description: "Given three integers, return their sum.",
    inputFormat: ["The input contains three integers a, b, and c."],
    outputFormat: "Return one integer: a + b + c.",
    constraints: ["-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const [a, b, c] = parseInts(testCase.input);
      return [`The numbers are ${a}, ${b}, and ${c}.`, `Their sum is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed} ${seed + 1} ${seed + 2}`,
    solve: (input) => String(parseInts(input).slice(0, 3).reduce((sum, value) => sum + value, 0)),
    editorial: {
      overview: "Read three integers and return their sum.",
      approach: ["Read the three integers.", "Add them in one pass.", "Return the total as a string."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(nums[0] + nums[1] + nums[2]);\n}`,
        explanation: "Direct addition of three integers.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b, c = map(int, input.split())\n    return str(a + b + c)`,
        explanation: "Simple integer addition.",
      },
    ],
  },
  {
    title: "Subtract Two Integers",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given two integers a and b, return a - b.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: a - b.",
    constraints: ["-10^9 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const [a, b] = parseInts(testCase.input);
      return [`The numbers are ${a} and ${b}.`, `Their difference is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed + 10} ${seed}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return String((a ?? 0) - (b ?? 0));
    },
    editorial: {
      overview: "Read two integers and subtract the second from the first.",
      approach: ["Parse both values.", "Compute a - b.", "Return the result as text."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(nums[0] - nums[1]);\n}`,
        explanation: "Direct subtraction with no extra state.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b = map(int, input.split())\n    return str(a - b)`,
        explanation: "Direct subtraction with minimal parsing.",
      },
    ],
  },
  {
    title: "Multiply Two Numbers",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given two integers, return their product.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: a * b.",
    constraints: ["-10^9 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const [a, b] = parseInts(testCase.input);
      return [`The numbers are ${a} and ${b}.`, `Their product is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed % 11} ${(seed % 7) + 2}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return String((a ?? 0) * (b ?? 0));
    },
    editorial: {
      overview: "Read two integers and multiply them.",
      approach: ["Parse the two values.", "Multiply them.", "Return the product as a string."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(nums[0] * nums[1]);\n}`,
        explanation: "Direct multiplication with the same raw-input style used by the judge.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b = map(int, input.split())\n    return str(a * b)`,
        explanation: "Direct multiplication with minimal parsing.",
      },
    ],
  },
  {
    title: "Compare Two Numbers",
    topic: "Math Foundations",
    pattern: "Conditionals",
    description: "Given two integers, return the larger one.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: max(a, b).",
    constraints: ["-10^9 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const [a, b] = parseInts(testCase.input);
      return [`The numbers are ${a} and ${b}.`, `The larger one is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed - 5} ${seed + 5}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return String(Math.max(a ?? 0, b ?? 0));
    },
    editorial: {
      overview: "Read two integers and return the larger one.",
      approach: ["Parse both values.", "Compare them.", "Return the greater value as a string."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(Math.max(nums[0], nums[1]));\n}`,
        explanation: "Direct maximum of two integers.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b = map(int, input.split())\n    return str(max(a, b))`,
        explanation: "Direct maximum of two integers.",
      },
    ],
  },
  {
    title: "Even or Odd",
    topic: "Math Foundations",
    pattern: "Parity",
    description: "Given one integer, determine whether it is even.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES if n is even, otherwise NO.",
    constraints: ["-10^9 <= n <= 10^9"],
    explanation: (testCase) => {
      const [n] = parseInts(testCase.input);
      return [`The number is ${n}.`, `The answer is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed}`,
    solve: (input) => {
      const [n] = parseInts(input);
      return String((n ?? 0) % 2 === 0 ? "YES" : "NO");
    },
    editorial: {
      overview: "Check the number modulo 2 and return YES or NO.",
      approach: ["Read one integer.", "Check whether it is divisible by 2.", "Return YES for even and NO for odd."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const n = Number(input.trim());\n  return n % 2 === 0 ? "YES" : "NO";\n}`,
        explanation: "Uses one parity check.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    n = int(input.strip())\n    return "YES" if n % 2 == 0 else "NO"`,
        explanation: "Uses one parity check.",
      },
    ],
  },
  {
    title: "Absolute Difference",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given two integers, return their absolute difference.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: |a - b|.",
    constraints: ["-10^9 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const [a, b] = parseInts(testCase.input);
      return [`The numbers are ${a} and ${b}.`, `Their absolute difference is ${testCase.expected}.`];
    },
    generateInput: (seed) => `${seed + 9} ${seed - 3}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return String(Math.abs((a ?? 0) - (b ?? 0)));
    },
    editorial: {
      overview: "Read two integers and return the absolute difference.",
      approach: ["Parse both values.", "Subtract and take the absolute value.", "Return the result as a string."],
      complexity: { time: "O(1)", space: "O(1) extra space" },
    },
    optimized: [
      {
        language: "javascript",
        label: "JavaScript",
        code: `function solve(input) {\n  const nums = input.match(/-?\\d+/g).map(Number);\n  return String(Math.abs(nums[0] - nums[1]));\n}`,
        explanation: "Uses one subtraction and Math.abs.",
      },
      {
        language: "python",
        label: "Python",
        code: `def solve(input):\n    a, b = map(int, input.split())\n    return str(abs(a - b))`,
        explanation: "Uses one subtraction and abs.",
      },
    ],
  },
];

const extraVeryEasyTemplateConfigs: CompactVeryEasyTemplate[] = [
  {
    title: "Add One",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return n + 1.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n + 1.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) + 1),
  },
  {
    title: "Subtract One",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return n - 1.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n - 1.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) - 1),
  },
  {
    title: "Double the Number",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return 2 * n.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: 2 * n.",
    generateInput: (seed) => `${seed % 100}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 2),
  },
  {
    title: "Triple the Number",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return 3 * n.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: 3 * n.",
    generateInput: (seed) => `${seed % 100}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 3),
  },
  {
    title: "Square a Number",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given one integer n, return n squared.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n * n.",
    constraints: ["-1000 <= n <= 1000"],
    generateInput: (seed) => `${(seed % 41) - 20}`,
    solve: (input) => {
      const n = parseInts(input)[0] ?? 0;
      return String(n * n);
    },
  },
  {
    title: "Last Digit",
    topic: "Math Foundations",
    pattern: "Modulo",
    description: "Given one non-negative integer n, return its last digit.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n % 10.",
    constraints: ["0 <= n <= 10^9"],
    generateInput: (seed) => `${seed * 37}`,
    solve: (input) => String(Math.abs(parseInts(input)[0] ?? 0) % 10),
  },
  {
    title: "Remainder by Two",
    topic: "Math Foundations",
    pattern: "Modulo",
    description: "Given one integer n, return n % 2.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: the remainder after dividing n by 2.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => String(Math.abs(parseInts(input)[0] ?? 0) % 2),
  },
  {
    title: "Remainder by Five",
    topic: "Math Foundations",
    pattern: "Modulo",
    description: "Given one integer n, return n % 5.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: the remainder after dividing n by 5.",
    generateInput: (seed) => `${seed * 9}`,
    solve: (input) => String(Math.abs(parseInts(input)[0] ?? 0) % 5),
  },
  {
    title: "Quotient by Two",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given an even integer n, return n / 2.",
    inputFormat: ["The input contains one even integer n."],
    outputFormat: "Return one integer: n / 2.",
    generateInput: (seed) => `${seed * 2}`,
    solve: (input) => String(Math.trunc((parseInts(input)[0] ?? 0) / 2)),
  },
  {
    title: "Quotient by Ten",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given an integer n that is divisible by 10, return n / 10.",
    inputFormat: ["The input contains one integer n divisible by 10."],
    outputFormat: "Return one integer: n / 10.",
    generateInput: (seed) => `${seed * 10}`,
    solve: (input) => String(Math.trunc((parseInts(input)[0] ?? 0) / 10)),
  },
  {
    title: "Minimum of Two",
    topic: "Math Foundations",
    pattern: "Conditionals",
    description: "Given two integers, return the smaller one.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: min(a, b).",
    generateInput: (seed) => `${seed + 4} ${seed - 6}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return String(Math.min(a ?? 0, b ?? 0));
    },
  },
  {
    title: "Equal Numbers",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given two integers, return YES if they are equal, otherwise NO.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return YES if a equals b, otherwise NO.",
    generateInput: (seed) => `${seed} ${seed + (seed % 2)}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return a === b ? "YES" : "NO";
    },
  },
  {
    title: "Positive Number",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given one integer n, return POSITIVE if n is greater than 0, otherwise NOT POSITIVE.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return POSITIVE or NOT POSITIVE.",
    generateInput: (seed) => `${seed % 2 === 0 ? seed : -seed}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) > 0 ? "POSITIVE" : "NOT POSITIVE"),
  },
  {
    title: "Negative Number",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given one integer n, return NEGATIVE if n is less than 0, otherwise NOT NEGATIVE.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return NEGATIVE or NOT NEGATIVE.",
    generateInput: (seed) => `${seed % 2 === 0 ? -seed : seed}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) < 0 ? "NEGATIVE" : "NOT NEGATIVE"),
  },
  {
    title: "Zero Check",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given one integer n, return ZERO if n is 0, otherwise NONZERO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return ZERO or NONZERO.",
    generateInput: (seed) => `${seed % 3 === 0 ? 0 : seed}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) === 0 ? "ZERO" : "NONZERO"),
  },
  {
    title: "Pass or Fail",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given marks m, return PASS if m is at least 35, otherwise FAIL.",
    inputFormat: ["The input contains one integer m."],
    outputFormat: "Return PASS or FAIL.",
    constraints: ["0 <= m <= 100"],
    generateInput: (seed) => `${seed % 101}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) >= 35 ? "PASS" : "FAIL"),
  },
  {
    title: "Adult Check",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given age, return ADULT if age is at least 18, otherwise CHILD.",
    inputFormat: ["The input contains one integer age."],
    outputFormat: "Return ADULT or CHILD.",
    constraints: ["0 <= age <= 120"],
    generateInput: (seed) => `${seed % 80}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) >= 18 ? "ADULT" : "CHILD"),
  },
  {
    title: "Greater Than Ten",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given one integer n, return YES if n is greater than 10, otherwise NO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed % 25}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) > 10 ? "YES" : "NO"),
  },
  {
    title: "Less Than Hundred",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given one integer n, return YES if n is less than 100, otherwise NO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed * 3}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) < 100 ? "YES" : "NO"),
  },
  {
    title: "Divisible by Three",
    topic: "Math Foundations",
    pattern: "Divisibility",
    description: "Given one integer n, return YES if n is divisible by 3, otherwise NO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) % 3 === 0 ? "YES" : "NO"),
  },
  {
    title: "Divisible by Five",
    topic: "Math Foundations",
    pattern: "Divisibility",
    description: "Given one integer n, return YES if n is divisible by 5, otherwise NO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) % 5 === 0 ? "YES" : "NO"),
  },
  {
    title: "Divisible by Ten",
    topic: "Math Foundations",
    pattern: "Divisibility",
    description: "Given one integer n, return YES if n is divisible by 10, otherwise NO.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed * 2}`,
    solve: (input) => ((parseInts(input)[0] ?? 0) % 10 === 0 ? "YES" : "NO"),
  },
  {
    title: "Smallest of Three",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given three integers, return the smallest one.",
    inputFormat: ["The input contains three integers a, b, and c."],
    outputFormat: "Return one integer: min(a, b, c).",
    generateInput: (seed) => `${seed + 3} ${seed - 5} ${seed + 9}`,
    solve: (input) => String(Math.min(...parseInts(input).slice(0, 3))),
  },
  {
    title: "Largest of Three",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given three integers, return the largest one.",
    inputFormat: ["The input contains three integers a, b, and c."],
    outputFormat: "Return one integer: max(a, b, c).",
    generateInput: (seed) => `${seed + 3} ${seed - 5} ${seed + 9}`,
    solve: (input) => String(Math.max(...parseInts(input).slice(0, 3))),
  },
  {
    title: "Middle Number",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given three integers, return the middle value after sorting them.",
    inputFormat: ["The input contains three integers a, b, and c."],
    outputFormat: "Return the middle integer.",
    generateInput: (seed) => `${seed + 3} ${seed - 5} ${seed + 9}`,
    solve: (input) => String(parseInts(input).slice(0, 3).sort((a, b) => a - b)[1] ?? 0),
  },
  {
    title: "Perimeter of Square",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given the side length of a square, return its perimeter.",
    inputFormat: ["The input contains one integer side."],
    outputFormat: "Return one integer: 4 * side.",
    constraints: ["1 <= side <= 10^9"],
    generateInput: (seed) => `${(seed % 100) + 1}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 4),
  },
  {
    title: "Area of Rectangle",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given length and width, return the area of the rectangle.",
    inputFormat: ["The input contains two integers length and width."],
    outputFormat: "Return one integer: length * width.",
    constraints: ["1 <= length, width <= 10^9"],
    generateInput: (seed) => `${(seed % 50) + 1} ${(seed % 30) + 1}`,
    solve: (input) => {
      const [length, width] = parseInts(input);
      return String((length ?? 0) * (width ?? 0));
    },
  },
  {
    title: "Perimeter of Rectangle",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given length and width, return the perimeter of the rectangle.",
    inputFormat: ["The input contains two integers length and width."],
    outputFormat: "Return one integer: 2 * (length + width).",
    constraints: ["1 <= length, width <= 10^9"],
    generateInput: (seed) => `${(seed % 50) + 1} ${(seed % 30) + 1}`,
    solve: (input) => {
      const [length, width] = parseInts(input);
      return String(2 * ((length ?? 0) + (width ?? 0)));
    },
  },
  {
    title: "Celsius to Fahrenheit",
    topic: "Math Foundations",
    pattern: "Formula",
    description: "Given Celsius c, return Fahrenheit using c * 9 / 5 + 32. Inputs always make an integer answer.",
    inputFormat: ["The input contains one integer c."],
    outputFormat: "Return one integer Fahrenheit value.",
    generateInput: (seed) => `${((seed % 20) - 10) * 5}`,
    solve: (input) => String(((parseInts(input)[0] ?? 0) * 9) / 5 + 32),
  },
  {
    title: "Minutes to Seconds",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given minutes m, return the number of seconds.",
    inputFormat: ["The input contains one integer m."],
    outputFormat: "Return one integer: m * 60.",
    constraints: ["0 <= m <= 10^9"],
    generateInput: (seed) => `${seed % 1000}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 60),
  },
  {
    title: "Hours to Minutes",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given hours h, return the number of minutes.",
    inputFormat: ["The input contains one integer h."],
    outputFormat: "Return one integer: h * 60.",
    constraints: ["0 <= h <= 10^9"],
    generateInput: (seed) => `${seed % 1000}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 60),
  },
  {
    title: "Days to Hours",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given days d, return the number of hours.",
    inputFormat: ["The input contains one integer d."],
    outputFormat: "Return one integer: d * 24.",
    constraints: ["0 <= d <= 10^9"],
    generateInput: (seed) => `${seed % 1000}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) * 24),
  },
  {
    title: "First Number",
    topic: "Programming Basics",
    pattern: "Input Parsing",
    description: "Given two integers, return the first one.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: a.",
    generateInput: (seed) => `${seed} ${seed + 10}`,
    solve: (input) => String(parseInts(input)[0] ?? 0),
  },
  {
    title: "Second Number",
    topic: "Programming Basics",
    pattern: "Input Parsing",
    description: "Given two integers, return the second one.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return one integer: b.",
    generateInput: (seed) => `${seed} ${seed + 10}`,
    solve: (input) => String(parseInts(input)[1] ?? 0),
  },
  {
    title: "Swap Two Numbers",
    topic: "Programming Basics",
    pattern: "Print and Input",
    description: "Given two integers a and b, return b and a separated by one space.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return b followed by a.",
    generateInput: (seed) => `${seed} ${seed + 10}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return `${b ?? 0} ${a ?? 0}`;
    },
  },
  {
    title: "Repeat Number Twice",
    topic: "Programming Basics",
    pattern: "Print and Input",
    description: "Given one integer n, return it twice separated by one space.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return n n.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => {
      const n = parseInts(input)[0] ?? 0;
      return `${n} ${n}`;
    },
  },
  {
    title: "Sum of Digits Two",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given a two-digit number n, return the sum of its digits.",
    inputFormat: ["The input contains one two-digit integer n."],
    outputFormat: "Return one integer: tens digit + ones digit.",
    constraints: ["10 <= n <= 99"],
    generateInput: (seed) => `${10 + (seed % 90)}`,
    solve: (input) => {
      const n = Math.abs(parseInts(input)[0] ?? 0);
      return String(Math.floor(n / 10) + (n % 10));
    },
  },
  {
    title: "Reverse Two Digits",
    topic: "Math Foundations",
    pattern: "Arithmetic",
    description: "Given a two-digit number n, return the number with its digits reversed.",
    inputFormat: ["The input contains one two-digit integer n."],
    outputFormat: "Return the reversed two-digit number.",
    constraints: ["10 <= n <= 99"],
    generateInput: (seed) => `${10 + (seed % 90)}`,
    solve: (input) => {
      const n = Math.abs(parseInts(input)[0] ?? 0);
      return String((n % 10) * 10 + Math.floor(n / 10));
    },
  },
  {
    title: "Count Two Evens",
    topic: "Math Foundations",
    pattern: "Parity",
    description: "Given two integers, return how many of them are even.",
    inputFormat: ["The input contains two integers a and b."],
    outputFormat: "Return 0, 1, or 2.",
    generateInput: (seed) => `${seed} ${seed + 1}`,
    solve: (input) => String(parseInts(input).slice(0, 2).filter((value) => value % 2 === 0).length),
  },
  {
    title: "Count Three Positives",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given three integers, return how many are positive.",
    inputFormat: ["The input contains three integers a, b, and c."],
    outputFormat: "Return 0, 1, 2, or 3.",
    generateInput: (seed) => `${seed - 50} ${seed % 7} ${50 - seed}`,
    solve: (input) => String(parseInts(input).slice(0, 3).filter((value) => value > 0).length),
  },
  {
    title: "Traffic Light",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given 1, 2, or 3, return RED for 1, YELLOW for 2, and GREEN for 3.",
    inputFormat: ["The input contains one integer x."],
    outputFormat: "Return RED, YELLOW, or GREEN.",
    constraints: ["1 <= x <= 3"],
    generateInput: (seed) => `${(seed % 3) + 1}`,
    solve: (input) => ["RED", "YELLOW", "GREEN"][(parseInts(input)[0] ?? 1) - 1] ?? "RED",
  },
  {
    title: "Day Type",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given a day number from 1 to 7, return WEEKEND for 6 or 7, otherwise WEEKDAY.",
    inputFormat: ["The input contains one integer day."],
    outputFormat: "Return WEEKDAY or WEEKEND.",
    constraints: ["1 <= day <= 7"],
    generateInput: (seed) => `${(seed % 7) + 1}`,
    solve: (input) => {
      const day = parseInts(input)[0] ?? 1;
      return day >= 6 ? "WEEKEND" : "WEEKDAY";
    },
  },
  {
    title: "Character Is A",
    topic: "Strings",
    pattern: "Conditionals",
    description: "Given one lowercase character, return YES if it is a, otherwise NO.",
    inputFormat: ["The input contains one lowercase character."],
    outputFormat: "Return YES or NO.",
    constraints: ["The character is a lowercase English letter."],
    generateInput: (seed) => String.fromCharCode(97 + (seed % 26)),
    solve: (input) => (input.trim() === "a" ? "YES" : "NO"),
  },
  {
    title: "Word Length",
    topic: "Strings",
    pattern: "Input Parsing",
    description: "Given one lowercase word, return its length.",
    inputFormat: ["The input contains one lowercase word."],
    outputFormat: "Return one integer: the word length.",
    constraints: ["1 <= word length <= 20"],
    generateInput: (seed) => ["code", "hi", "nexo", "logic", "admin"][seed % 5],
    solve: (input) => String(input.trim().length),
  },
  {
    title: "First Character",
    topic: "Strings",
    pattern: "Input Parsing",
    description: "Given one lowercase word, return its first character.",
    inputFormat: ["The input contains one lowercase word."],
    outputFormat: "Return one lowercase character.",
    constraints: ["1 <= word length <= 20"],
    generateInput: (seed) => ["code", "hi", "nexo", "logic", "admin"][seed % 5],
    solve: (input) => input.trim()[0] ?? "",
  },
  {
    title: "Last Character",
    topic: "Strings",
    pattern: "Input Parsing",
    description: "Given one lowercase word, return its last character.",
    inputFormat: ["The input contains one lowercase word."],
    outputFormat: "Return one lowercase character.",
    constraints: ["1 <= word length <= 20"],
    generateInput: (seed) => ["code", "hi", "nexo", "logic", "admin"][seed % 5],
    solve: (input) => {
      const word = input.trim();
      return word[word.length - 1] ?? "";
    },
  },
  {
    title: "Add Ten",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return n + 10.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n + 10.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) + 10),
  },
  {
    title: "Minus Ten",
    topic: "Programming Basics",
    pattern: "Arithmetic",
    description: "Given one integer n, return n - 10.",
    inputFormat: ["The input contains one integer n."],
    outputFormat: "Return one integer: n - 10.",
    generateInput: (seed) => `${seed}`,
    solve: (input) => String((parseInts(input)[0] ?? 0) - 10),
  },
  {
    title: "Same Sign",
    topic: "Programming Basics",
    pattern: "Conditionals",
    description: "Given two non-zero integers, return YES if both have the same sign, otherwise NO.",
    inputFormat: ["The input contains two non-zero integers a and b."],
    outputFormat: "Return YES or NO.",
    generateInput: (seed) => `${seed + 1} ${seed % 2 === 0 ? seed + 2 : -seed - 2}`,
    solve: (input) => {
      const [a, b] = parseInts(input);
      return ((a ?? 0) > 0) === ((b ?? 0) > 0) ? "YES" : "NO";
    },
  },
  {
    title: "Vowel A Check",
    topic: "Strings",
    pattern: "Conditionals",
    description: "Given one lowercase character, return VOWEL if it is a, otherwise CONSONANT.",
    inputFormat: ["The input contains one lowercase character."],
    outputFormat: "Return VOWEL or CONSONANT.",
    constraints: ["The character is a lowercase English letter."],
    generateInput: (seed) => String.fromCharCode(97 + (seed % 26)),
    solve: (input) => (input.trim() === "a" ? "VOWEL" : "CONSONANT"),
  },
];

const extraVeryEasyTemplates: VeryEasyTemplate[] = extraVeryEasyTemplateConfigs.map(buildCompactVeryEasyTemplate);

const veryEasyTemplates: VeryEasyTemplate[] = [...baseVeryEasyTemplates, ...extraVeryEasyTemplates];

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

const veryEasyTemplateForLevel = (level: number) => veryEasyTemplates[(level - 1) % veryEasyTemplates.length];

const buildTestCases = (kind: JudgeKind, level: number) =>
  [level, level + 137, level + 911].map((seed, index) => {
    const input = buildInput(kind, seed);
    return {
      id: index + 1,
      input,
      expected: solveReference(kind, input),
    };
  });

const buildVeryEasyTestCases = (level: number) => {
  const template = veryEasyTemplateForLevel(level);
  return [level, level + 137, level + 911].map((seed, index) => {
    const input = template.generateInput(seed + index * 17);
    return {
      id: index + 1,
      input,
      expected: template.solve(input),
    };
  });
};

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
<ul class="mt-3 list-disc space-y-1 pl-5 text-secondary-text">
  ${guide.inputFormat.map((line) => `<li>${line}</li>`).join("")}
</ul>

<h3 class="mt-7 text-base font-bold text-white">Output Format</h3>
<p>${guide.outputFormat}</p>

<h3 class="mt-7 text-base font-bold text-white">Example 1</h3>
<div class="mt-3 border-l-2 border-border pl-4">
  <p class="font-semibold text-foreground">Input:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-border bg-hover p-3 font-mono text-xs leading-5 text-foreground">${formatHtmlBlock(sample.input)}</pre>
  <p class="mt-4 font-semibold text-foreground">Output:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-border bg-hover p-3 font-mono text-xs leading-5 text-foreground">${sample.expected}</pre>
  <p class="mt-4 font-semibold text-foreground">Explanation:</p>
  <ul class="mt-2 list-disc space-y-1 pl-5 text-secondary-text">
    ${sampleExplanation.map((line) => `<li>${line}</li>`).join("")}
  </ul>
</div>

<h3 class="mt-7 text-base font-bold text-white">Constraints</h3>
<ul class="mt-3 list-disc space-y-1 pl-5 text-secondary-text">
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

const buildVeryEasyDescription = (template: VeryEasyTemplate, testCases: Problem["testCases"], difficulty: Difficulty) => {
  const sample = testCases[0];
  const sampleExplanation = template.explanation(sample);
  return `
<p>${template.description}</p>
<p>This starter problem is part of <strong>Very Easy</strong> practice and focuses on the <strong>${template.pattern}</strong> pattern.</p>

<h3 class="mt-7 text-base font-bold text-white">Input Format</h3>
<ul class="mt-3 list-disc space-y-1 pl-5 text-secondary-text">
  ${template.inputFormat.map((line) => `<li>${line}</li>`).join("")}
</ul>

<h3 class="mt-7 text-base font-bold text-white">Output Format</h3>
<p>${template.outputFormat}</p>

<h3 class="mt-7 text-base font-bold text-white">Example 1</h3>
<div class="mt-3 border-l-2 border-border pl-4">
  <p class="font-semibold text-foreground">Input:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-border bg-hover p-3 font-mono text-xs leading-5 text-foreground">${formatHtmlBlock(sample.input)}</pre>
  <p class="mt-4 font-semibold text-foreground">Output:</p>
  <pre class="mt-2 overflow-x-auto rounded border border-border bg-hover p-3 font-mono text-xs leading-5 text-foreground">${sample.expected}</pre>
  <p class="mt-4 font-semibold text-foreground">Explanation:</p>
  <ul class="mt-2 list-disc space-y-1 pl-5 text-secondary-text">
    ${sampleExplanation.map((line) => `<li>${line}</li>`).join("")}
  </ul>
</div>

<h3 class="mt-7 text-base font-bold text-white">Constraints</h3>
<ul class="mt-3 list-disc space-y-1 pl-5 text-secondary-text">
  ${template.constraints.map((line) => `<li><code>${line}</code></li>`).join("")}
</ul>

<h3 class="mt-7 text-base font-bold text-white">Return Requirement</h3>
<p>Implement the starter function for this <strong>${difficulty}</strong> problem. Return only the required answer.</p>
  `;
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

const easyTemplates: EasyTemplate[] = [
  {
    title: "Print and Input: Array Total",
    topic: "Programming Basics",
    pattern: "Print and Input",
    judge: "sum",
    description: "Given a list of integers, return their total sum.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers."],
    outputFormat: "Return one integer: the sum of the given values.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      return [`The values are ${nums.slice(1).join(", ")}.`, `Adding them gives ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      return `${count}\n${buildNumbers(seed, count).join(" ")}`;
    },
    solve: (input) => String((input.match(/-?\d+/g)?.map(Number).slice(1) ?? []).reduce((sum, value) => sum + value, 0)),
    editorial: {
      overview: "Read the numbers and add them in one pass.",
      approach: ["Parse the count and list of values.", "Accumulate the total.", "Return the sum as text."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("sum"),
  },
  {
    title: "Parity: Largest Value",
    topic: "Math Foundations",
    pattern: "Parity",
    judge: "max",
    description: "Given a list of integers, return the largest value present in the list.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers."],
    outputFormat: "Return one integer: the maximum value in the list.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      return [`Scanning all values, the largest one is ${testCase.expected}.`, "No other value in the list is greater than it."];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      return `${count}\n${buildNumbers(seed + 3, count).join(" ")}`;
    },
    solve: (input) => String(Math.max(...(input.match(/-?\d+/g)?.map(Number).slice(1) ?? [0]))),
    editorial: {
      overview: "Read the values and track the largest one while scanning once.",
      approach: ["Parse the values.", "Track the current maximum.", "Return the maximum as text."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("max"),
  },
  {
    title: "Traversal: Even Counter",
    topic: "Arrays",
    pattern: "Traversal",
    judge: "count-even",
    description: "Given a list of integers, count how many of them are even.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers."],
    outputFormat: "Return one integer: the number of even values.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number).slice(1) ?? [];
      const evens = nums.filter((value) => value % 2 === 0);
      return [`The even values are ${evens.join(", ")}.`, `There are ${testCase.expected} even values, so the answer is ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      return `${count}\n${buildNumbers(seed + 7, count).join(" ")}`;
    },
    solve: (input) => String((input.match(/-?\d+/g)?.map(Number).slice(1) ?? []).filter((value) => value % 2 === 0).length),
    editorial: {
      overview: "Scan the values once and count the even ones.",
      approach: ["Parse the values.", "Increment a counter whenever value % 2 === 0.", "Return the final count as text."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("count-even"),
  },
  {
    title: "Character Counting: Reverse Words",
    topic: "Strings",
    pattern: "Character Counting",
    judge: "reverse-words",
    description: "Given a sequence of words, return the same words in reverse order.",
    inputFormat: ["The first line contains an integer n, the number of words.", "The remaining input contains n lowercase words."],
    outputFormat: "Return one line containing the words in reverse order.",
    constraints: ["1 <= n <= 10^5", "Each word contains only lowercase English letters."],
    explanation: (testCase) => {
      const words = testCase.input.trim().split(/\s+/).slice(1);
      return [`The original order is ${words.join(" -> ")}.`, `After reversing, the order becomes ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const words = ["alpha", "bravo", "code", "delta", "logic", "matrix", "nexo", "query"];
      const count = 3 + (seed % 4);
      return `${count}\n${Array.from({ length: count }, (_, index) => words[(seed + index * 2) % words.length]).join(" ")}`;
    },
    solve: (input) => input.trim().split(/\r?\n/).slice(1).join(" ").trim().split(/\s+/).reverse().join(" "),
    editorial: {
      overview: "Read the words, reverse their order, and join them with a single space.",
      approach: ["Skip the count line after parsing the input.", "Split the remaining text into words.", "Reverse and join with one space."],
      complexity: { time: "O(n)", space: "O(n)" },
    },
    optimized: buildOptimizedSolutions("reverse-words"),
  },
  {
    title: "Frequency Map: Common Divisor",
    topic: "Hashing",
    pattern: "Frequency Map",
    judge: "gcd",
    description: "Given two positive integers, return their greatest common divisor.",
    inputFormat: ["The input contains two positive integers a and b."],
    outputFormat: "Return one integer: gcd(a, b).",
    constraints: ["1 <= a, b <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      return [`For ${nums[0]} and ${nums[1]}, the largest shared divisor is ${testCase.expected}.`, `Therefore, gcd(${nums[0]}, ${nums[1]}) = ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const first = 24 + (seed % 23) * 6;
      const second = 36 + (seed % 19) * 9;
      return `${first} ${second}`;
    },
    solve: (input) => {
      let [a, b] = input.match(/-?\d+/g)?.map(Number) ?? [0, 0];
      while (b !== 0) {
        [a, b] = [b, a % b];
      }
      return String(Math.abs(a));
    },
    editorial: {
      overview: "Use Euclid's algorithm to find the greatest common divisor.",
      approach: ["Parse the two numbers.", "Repeatedly replace a, b with b, a % b.", "Return the final non-zero value."],
      complexity: { time: "O(log min(a, b))", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("gcd"),
  },
  {
    title: "Custom Sort: Range Sum",
    topic: "Sorting and Searching",
    pattern: "Custom Sort",
    judge: "range-sum",
    description: "Given an array and one inclusive 1-indexed range, compute the sum of the values inside that range.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers.", "The third line contains two integers l and r, the inclusive 1-indexed range."],
    outputFormat: "Return one integer: the sum of values from index l through index r.",
    constraints: ["1 <= n <= 10^5", "1 <= l <= r <= n", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      const n = nums[0];
      const values = nums.slice(1, n + 1);
      const left = nums[n + 1];
      const right = nums[n + 2];
      return [`The requested range is from position ${left} to ${right}.`, `The selected values are ${values.slice(left - 1, right).join(", ")}, and their sum is ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      const values = buildNumbers(seed + 11, count);
      const left = 1 + (seed % Math.max(1, count - 2));
      const right = Math.min(count, left + 2 + (seed % 2));
      return `${count}\n${values.join(" ")}\n${left} ${right}`;
    },
    solve: (input) => {
      const nums = input.match(/-?\d+/g)?.map(Number) ?? [];
      const n = nums[0] ?? 0;
      const values = nums.slice(1, n + 1);
      const left = nums[n + 1] ?? 1;
      const right = nums[n + 2] ?? n;
      return String(values.slice(left - 1, right).reduce((sum, value) => sum + value, 0));
    },
    editorial: {
      overview: "Read the array and sum the values inside the requested range.",
      approach: ["Parse n, the values, and l r.", "Slice the requested range.", "Return the sum of the slice."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("range-sum"),
  },
  {
    title: "Monotonic Stack: Array Total",
    topic: "Stacks and Queues",
    pattern: "Monotonic Stack",
    judge: "sum",
    description: "Given a list of integers, return their total sum.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers."],
    outputFormat: "Return one integer: the sum of the given values.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      const nums = testCase.input.match(/-?\d+/g)?.map(Number) ?? [];
      return [`The values are ${nums.slice(1).join(", ")}.`, `Adding them gives ${testCase.expected}.`];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      return `${count}\n${buildNumbers(seed + 13, count).join(" ")}`;
    },
    solve: (input) => String((input.match(/-?\d+/g)?.map(Number).slice(1) ?? []).reduce((sum, value) => sum + value, 0)),
    editorial: {
      overview: "Read the numbers and sum them in one pass.",
      approach: ["Parse the values.", "Accumulate the total.", "Return the sum as text."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("sum"),
  },
  {
    title: "Pointer Basics: Largest Value",
    topic: "Linked Lists",
    pattern: "Pointer Basics",
    judge: "max",
    description: "Given a list of integers, return the largest value present in the list.",
    inputFormat: ["The first line contains an integer n, the number of values.", "The second line contains n space-separated integers."],
    outputFormat: "Return one integer: the maximum value in the list.",
    constraints: ["1 <= n <= 10^5", "-10^9 <= value <= 10^9"],
    explanation: (testCase) => {
      return [`Scanning all values, the largest one is ${testCase.expected}.`, "No other value in the list is greater than it."];
    },
    generateInput: (seed) => {
      const count = 5 + (seed % 5);
      return `${count}\n${buildNumbers(seed + 17, count).join(" ")}`;
    },
    solve: (input) => String(Math.max(...(input.match(/-?\d+/g)?.map(Number).slice(1) ?? [0]))),
    editorial: {
      overview: "Read the list and keep the largest number seen so far.",
      approach: ["Parse the values.", "Track the current maximum.", "Return the largest value as text."],
      complexity: { time: "O(n)", space: "O(1) extra space" },
    },
    optimized: buildOptimizedSolutions("max"),
  },
];

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
  const veryEasyKind: JudgeKind = "sum";
  const slug = slugify(`${track.topic}-${pattern}-${level}`);

  if (level <= 200) {
    const template = veryEasyTemplateForLevel(level);
    const testCases = buildVeryEasyTestCases(level);
    return {
      id: slug,
      title: template.title,
      slug,
      difficulty,
      level,
      topic: template.topic,
      pattern: template.pattern,
      ...rewardForDifficulty(difficulty),
      prizeMoneyInr: undefined,
      description: buildVeryEasyDescription(template, testCases, difficulty),
      discussions: buildDiscussions(level, veryEasyKind, template.topic, template.pattern),
      editorial: template.editorial,
      optimizedSolutions: template.optimized,
      judge: { kind: veryEasyKind },
      starterCode: starterCode(),
      testCases,
    };
  }

  if (level <= 1200) {
    const template = easyTemplates[(level - 201) % easyTemplates.length];
    const kind = template.judge;
    const testCases = buildTestCases(kind, level);
    return {
      id: slug,
      title: template.title,
      slug,
      difficulty,
      level,
      topic: template.topic,
      pattern: template.pattern,
      ...rewardForDifficulty(difficulty),
      prizeMoneyInr: undefined,
      description: buildDescription(kind, difficulty, template.topic, template.pattern, testCases),
      discussions: buildDiscussions(level, kind, template.topic, template.pattern),
      editorial: template.editorial,
      optimizedSolutions: template.optimized,
      judge: { kind },
      starterCode: starterCode(),
      testCases,
    };
  }

  const kind = judgeKinds[(level - 1) % judgeKinds.length];
  const testCases = buildTestCases(kind, level);

  return {
    id: slug,
    title: `${pattern}: ${taskCopy[kind].title}`,
    slug,
    difficulty,
    level,
    topic: track.topic,
    pattern,
    ...rewardForDifficulty(difficulty),
    prizeMoneyInr: undefined,
    description: buildDescription(kind, difficulty, track.topic, pattern, testCases),
    discussions: buildDiscussions(level, kind, track.topic, pattern),
    editorial: buildEditorial(kind, difficulty, track.topic, pattern),
    optimizedSolutions: buildOptimizedSolutions(kind),
    judge: { kind },
    starterCode: starterCode(),
    testCases,
  };
};

export const QUESTION_COUNT = 4500;
export const MOCK_PROBLEMS: Problem[] = Array.from({ length: QUESTION_COUNT }, (_, index) => generateProblem(index + 1));

export const DAILY_PRIZE_PROBLEMS = MOCK_PROBLEMS.slice(0, 3).map((problem, index) => ({
  ...problem,
  title: ["Easy Challenge", "Medium Challenge", "Hard Challenge"][index],
  difficulty: (["Easy", "Medium", "Hard"] as const)[index],
  prizeMoneyInr: undefined,
}));
