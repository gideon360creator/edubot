import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@/api/v1/app/middlewares/auth.middleware";
import {
  chatOnce,
  streamChat,
} from "@/api/v1/app/controllers/chat.controller";
import { chatRequestSchema } from "@/api/v1/utils/validators/chat.validator";

const router = new Hono();

router.use(authMiddleware);

router.post("/", zValidator("json", chatRequestSchema), chatOnce);
router.post("/stream", zValidator("json", chatRequestSchema), streamChat);

export default router;
