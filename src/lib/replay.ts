export type ReplayEvent =
  | {
      type: "snapshot";
      timestamp: number;
      code: string;
    }
  | {
      type: "run" | "submit" | "paste" | "large_insert" | "tab_switch" | "tab_hidden" | "tab_visible" | "window_blur" | "window_focus";
      timestamp: number;
      charsPasted?: number;
      linesPasted?: number;
      charsInserted?: number;
      linesInserted?: number;
      label?: string;
      meta?: Record<string, unknown>;
    };

export type ReplayStats = {
  pasteCount: number;
  pastedCharacters: number;
  largeInsertCount: number;
  runCount: number;
  tabSwitchCount: number;
  solveTimeSeconds: number;
  trustScore: number;
};

export type ReplayPayload = {
  events: ReplayEvent[];
  stats: ReplayStats;
};

export const createReplayPayload = (events: ReplayEvent[], stats: ReplayStats): ReplayPayload => ({
  events,
  stats,
});

export const estimateReplaySize = (payload: ReplayPayload) => JSON.stringify(payload).length;

export const normalizeReplayEvents = (events: ReplayEvent[]) => {
  const compact: ReplayEvent[] = [];
  for (const event of events) {
    const prev = compact[compact.length - 1];
    if (event.type === "snapshot" && prev?.type === "snapshot" && prev.code === event.code) continue;
    compact.push(event);
  }
  return compact;
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export const calculateTrustScore = (
  stats: Pick<ReplayStats, "pasteCount" | "pastedCharacters" | "largeInsertCount" | "runCount" | "tabSwitchCount" | "solveTimeSeconds">,
  events: ReplayEvent[],
) => {
  let score = 100;
  const firstRun = events.findIndex((event) => event.type === "run");
  const firstPaste = events.findIndex((event) => event.type === "paste");
  const largeInserts = events.filter((event) => event.type === "large_insert");
  const submitEvent = events.find((event) => event.type === "submit");

  if (stats.pastedCharacters > 500) score -= 40;
  else if (stats.pastedCharacters > 100) score -= 20;
  if (stats.largeInsertCount > 2) score -= 25;
  else if (stats.largeInsertCount > 0) score -= 12;

  if (firstRun === -1) score -= 20;
  if (firstPaste !== -1 && (firstRun === -1 || events[firstPaste].timestamp <= events[firstRun]?.timestamp)) score -= 15;
  if (largeInserts.length && (firstRun === -1 || largeInserts[0].timestamp <= events[firstRun]?.timestamp)) score -= 18;
  if (largeInserts.length > 1) score -= 12;
  if (submitEvent && largeInserts.some((event) => event.timestamp >= submitEvent.timestamp - 2)) score -= 18;

  if (stats.tabSwitchCount > 10) score -= 30;
  else if (stats.tabSwitchCount > 5) score -= 15;

  if (stats.runCount >= 3) score += 5;

  const hasMultipleSnapshots = events.filter((event) => event.type === "snapshot").length >= 3;
  if (hasMultipleSnapshots) score += 5;

  if (submitEvent && stats.solveTimeSeconds > 0 && stats.solveTimeSeconds <= 5) score -= 40;

  return clampScore(score);
};

export const trustLevelForScore = (score: number) => {
  if (score >= 90) return "Very Trusted";
  if (score >= 70) return "Trusted";
  if (score >= 40) return "Suspicious";
  return "High Risk";
};

export const calculatePasteContribution = (pastedCharacters: number, finalCodeCharacters: number) => {
  if (finalCodeCharacters <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((pastedCharacters / finalCodeCharacters) * 100)));
};

export const pasteContributionLabel = (value: number) => {
  if (value <= 20) return "negligible";
  if (value <= 50) return "moderate";
  if (value <= 80) return "suspicious";
  return "highly suspicious";
};
