import { logger as honoLogger } from "hono/logger";

type Level = "info" | "warn" | "error" | "fatal";

const colors: Record<Level, string> = {
  info: "\x1b[34m", // blue
  warn: "\x1b[33m", // amber/yellow
  error: "\x1b[31m", // red
  fatal: "\x1b[91m", // bright red
};
const reset = "\x1b[0m";
const dim = "\x1b[2m";

const emit = (level: Level, message: string, meta: Record<string, any> = {}) => {
  const ts = new Date().toISOString();
  const color = colors[level] || "";
  const metaString =
    meta && Object.keys(meta).length > 0
      ? ` ${dim}${JSON.stringify(meta)}${reset}`
      : "";
  const line = `${color}[${ts}] ${message}${reset}${metaString}`;

  switch (level) {
    case "error":
    case "fatal":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
};

export const log = {
  info: (msg: string, meta?: Record<string, any>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, any>) => emit("error", msg, meta),
  fatal: (msg: string, meta?: Record<string, any>) => emit("fatal", msg, meta),
};

// Request logger middleware using hono/logger but emitting through our logger
export const requestLogger = honoLogger((data) => {
  if (typeof data === "string") {
    log.info("request", { raw: data });
    return;
  }
  const d: any = data;
  log.info("request", {
    method: d.method,
    path: d.path,
    status: d.status,
    duration: d.elapsed,
    reqId: d.requestId,
  });
});

export default log;
