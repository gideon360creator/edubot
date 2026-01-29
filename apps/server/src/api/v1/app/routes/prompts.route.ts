import { Hono } from "hono";
import { authMiddleware } from "@/api/v1/app/middlewares/auth.middleware";
import { getPrompts } from "@/api/v1/app/controllers/prompts.controller";

const router = new Hono();

// Available to any authenticated user (students and lecturers)
router.get("/", authMiddleware, getPrompts);

export default router;
