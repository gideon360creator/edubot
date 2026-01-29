import cron from "node-cron";
import { env } from "./env";

/**
 * Initializes a cron job that pings the server every 14 minutes to keep it alive.
 * Especially useful for platforms like Render or Fly.io that spin down on inactivity.
 */
export const initKeepAlive = () => {
  const serverUrl = env.SERVER_URL;

  // Schedule task to run every 14 minutes
  // cron expression: */14 * * * * (At every 14th minute)
  cron.schedule("*/14 * * * *", async () => {
    try {
      console.log(`[Keep-Alive] Pinging server at ${serverUrl}/api/v1/health`);

      const response = await fetch(`${serverUrl}/api/v1/health`);

      if (response.ok) {
        console.log("[Keep-Alive] Ping successful");
      } else {
        console.warn(
          `[Keep-Alive] Ping failed with status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error("[Keep-Alive] Error during ping:", error);
    }
  });

  console.log(
    `Keep-alive cron job initialized to ping ${serverUrl} every 14 minutes`,
  );
};
