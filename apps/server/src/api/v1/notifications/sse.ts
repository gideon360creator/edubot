const subscribers = new Set<{
  send: (payload: string) => Promise<void>;
  close: () => void;
}>();

const encoder = new TextEncoder();

export const subscribe = (signal?: AbortSignal) => {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const subscriber = {
    send: (payload: string) => writer.write(encoder.encode(payload)),
    close: () => {
      try {
        writer.close();
      } catch (_err) {
        // ignore
      }
      subscribers.delete(subscriber);
    },
  };

  subscribers.add(subscriber);

  // initial comment to establish stream
  void subscriber.send(": connected\n\n");

  if (signal) {
    signal.addEventListener("abort", () => subscriber.close());
  }

  return { readable: stream.readable, unsubscribe: subscriber.close };
};

export const publishEvent = async (data: any) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  const broken: Array<{
    send: (payload: string) => Promise<void>;
    close: () => void;
  }> = [];

  await Promise.all(
    Array.from(subscribers).map((subscriber) =>
      subscriber.send(payload).catch(() => broken.push(subscriber))
    )
  );

  if (broken.length) {
    broken.forEach((subscriber) => subscriber.close());
  }
};

export const publishGradeCreated = (studentNumber: string) => {
  return publishEvent({
    type: "grade_created",
    student_number: studentNumber,
  });
};
