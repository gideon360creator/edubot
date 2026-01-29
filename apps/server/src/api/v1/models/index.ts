import mongoose from "mongoose";
import { env } from "@/api/v1/utils/env";
import log from "../utils/logger";

const DB_URL = env.DB_URL;

export const connectMongo = async () => {
  try {
    await mongoose.connect(DB_URL);
    log.info("✅ Connected to MongoDB");
  } catch (err) {
    if (err instanceof Error) {
      log.error("❌ MongoDB connection failed:", {
        message: err.message,
        stack: err.stack,
      });
    } else {
      log.error("❌ MongoDB connection failed:", { error: err });
    }
    process.exit(1);
  }
};
