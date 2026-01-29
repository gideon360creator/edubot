export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  DB_URL: process.env.MONGODB_URI!,
  PROMPTS_PATH: process.env.PROMPTS_PATH || "",
  GROQ_API_KEY: process.env.GROQ_API_KEY!,
  SERVER_URL: process.env.SERVER_URL || "http://localhost:3000",
};
