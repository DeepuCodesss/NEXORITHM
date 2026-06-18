export type ReplayEvent =
  | {
      type: "snapshot";
      timestamp: number;
      code: string;
    }
  | {
      type: "run" | "submit" | "paste" | "tab";
      timestamp: number;
      label?: string;
      meta?: Record<string, unknown>;
    };

export type ReplayStats = {
  pasteCount: number;
  pastedCharacters: number;
  runCount: number;
  tabSwitchCount: number;
  solveTimeSeconds: number;
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
