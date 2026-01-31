import { Context } from "hono";
import ChatService from "@/api/v1/services/chat/chat.service";
import { respond } from "@/api/v1/utils/respond";
import { ChatRequestInput } from "@/api/v1/utils/validators/chat.validator";
import { CustomError } from "@/api/v1/utils";

const encoder = new TextEncoder();

export const chatOnce = async (c: Context) => {
  const body = (c.req as any).valid("json") as ChatRequestInput;
  const user = c.get("user");
  const { response, threadId } = (await ChatService.generate({
    user,
    message: body.message,
    threadId: body.threadId,
  })) as any;
  return respond(c, 200, "Chat response", { response, threadId });
};

export const getHistory = async (c: Context) => {
  const threadId = c.req.query("threadId");
  if (!threadId) {
    throw new CustomError("threadId is required", 400);
  }
  const history = await ChatService.getMessagesByThread(threadId);
  return respond(c, 200, "Chat history", { history });
};

export const getThreads = async (c: Context) => {
  const user = c.get("user");
  const threads = await ChatService.getThreads(user.id);
  return respond(c, 200, "Chat threads", { threads });
};

export const streamChat = async (c: Context) => {
  const body = (c.req as any).valid("json") as ChatRequestInput;
  const user = c.get("user");

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const write = async (data: string) => {
    await writer.write(encoder.encode(data));
  };

  const sendData = async (payload: any) => {
    try {
      await write(
        `data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`,
      );
    } catch (_err) {
      // Stream likely closed by client
    }
  };

  const close = async () => {
    try {
      await writer.close();
    } catch (_err) {
      // ignore
    }
  };

  const abortHandler = () => {
    void close();
  };

  const signal = c.req.raw.signal;
  if (signal) {
    signal.addEventListener("abort", abortHandler);
  }

  void (async () => {
    try {
      const { threadId } = (await ChatService.stream({
        user,
        message: body.message,
        threadId: body.threadId,
        onChunk: async (text) => {
          await sendData({ chunk: text });
        },
      })) as any;
      await sendData({ threadId, done: true });
    } catch (err: any) {
      const message =
        err instanceof CustomError ? err.message : "Chat service unavailable";
      await sendData({ error: message });
    } finally {
      if (signal) {
        signal.removeEventListener("abort", abortHandler);
      }
      await close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
