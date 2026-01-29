import { Hono } from "hono";
import { authMiddleware } from "@/api/v1/app/middlewares/auth.middleware";
import { subscribe } from "@/api/v1/notifications/sse";

const router = new Hono();

router.get("/stream", authMiddleware, (c) => {
  const { readable } = subscribe(c.req.raw.signal);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
});

export default router;
