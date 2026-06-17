import "server-only";

type LogLevel = "info" | "warn" | "error";

const writeLog = (level: LogLevel, event: string, details: Record<string, unknown> = {}) => {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
};

export const logger = {
  info: (event: string, details?: Record<string, unknown>) => writeLog("info", event, details),
  warn: (event: string, details?: Record<string, unknown>) => writeLog("warn", event, details),
  error: (event: string, details?: Record<string, unknown>) => writeLog("error", event, details),
};
