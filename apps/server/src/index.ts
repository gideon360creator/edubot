import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import mongoose from "mongoose";
import apiRouter from "@/api/v1/app/routes";
import { connectMongo } from "@/api/v1/models";
import { respond } from "@/api/v1/utils/respond";
import { CustomError, initKeepAlive } from "@/api/v1/utils";

const app = new Hono();

// initialize keep-alive cron job
initKeepAlive();

// initialize db (fail fast if not reachable)
await connectMongo().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
  throw err;
});

app.use(
  "/api/v1/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true,
  }),
);

app.use("*", logger());

app.route("/api/v1", apiRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => {
  const state = mongoose.connection.readyState;
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const payload = {
    status: state === 1 ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      state: stateMap[state] || "unknown",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    },
  };

  return respond(c, state === 1 ? 200 : 503, "health check", payload);
});

app.onError((err, c) => {
  if (err instanceof CustomError) {
    return respond(c, err.statusCode, err.message, err.error);
  }
  return respond(c, 500, err?.message || "Internal Server Error");
});

export default app;
