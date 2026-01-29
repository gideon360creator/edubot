import { Context } from "hono";

const successCodes = new Set([200, 201, 202, 204]);

export const respond = (
  c: Context,
  status: number,
  message: string,
  data: any = {}
) => {
  const body = {
    status: successCodes.has(status) ? "success" : "error",
    message,
    data,
  };
  return c.json(body, status as any);
};

export default respond;
