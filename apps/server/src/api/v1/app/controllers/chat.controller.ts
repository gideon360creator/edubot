import { Context } from "hono";
import ChatService from "@/api/v1/services/chat/chat.service";
import { respond } from "@/api/v1/utils/respond";
import { ChatRequestInput } from "@/api/v1/utils/validators/chat.validator";
import { CustomError } from "@/api/v1/utils";

const encoder = new TextEncoder();

export const chatOnce = async (c: Context) => {
  const body = (c.req as any).valid("json") as ChatRequestInput;
  const user = c.get("user");
  const response = await ChatService.generate({
    user,
    message: body.message,
  });
  return respond(c, 200, "Chat response", { response });
};

export const streamChat = async (c: Context) => {
  const body = (c.req as any).valid("json") as ChatRequestInput;
  const user = c.get("user");

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const write = async (data: string) => {
    await writer.write(encoder.encode(data));
  };

  const sendData = (payload: any) => {
    return write(`data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`);
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
      await ChatService.stream({
        user,
        message: body.message,
        onChunk: async (text) => {
          await sendData({ chunk: text });
        },
      });
      await sendData("[DONE]");
    } catch (err: any) {
      const message =
        err instanceof CustomError
          ? err.message
          : "Chat service unavailable";
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
