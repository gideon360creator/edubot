import { MiddlewareHandler } from "hono";
import { verifyToken } from "@/api/v1/utils/jwt";
import { respond } from "@/api/v1/utils/respond";
import { CustomError } from "@/api/v1/utils";
import UsersService from "@/api/v1/services/users/users.service";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  const [scheme, bearerToken] = authHeader.split(" ");
  const queryToken = c.req.query("token");
  const token =
    (scheme && scheme.toLowerCase() === "bearer" && bearerToken) ||
    queryToken ||
    "";
  if (!token) {
    return respond(c, 401, "Unauthorized");
  }

  try {
    const payload = await verifyToken(token);
    const user = await UsersService.findByUsername(payload.sub);
    if (!user) {
      throw new CustomError("Unauthorized", 401);
    }
    c.set("user", user);
    return next();
  } catch (err: any) {
    if (err instanceof CustomError) {
      return respond(c, err.statusCode, err.message, err.error);
    }
    return respond(c, 401, "Invalid or expired token");
  }
};

export const lecturerOnly: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return respond(c, 401, "Unauthorized");
  }
  if (user.role !== "lecturer") {
    const err = new CustomError("Forbidden: Lecturer only", 403);
    return respond(c, err.statusCode, err.message);
  }
  return next();
};

export const studentOnly: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return respond(c, 401, "Unauthorized");
  }
  if (user.role !== "student" || !user.studentNumber) {
    const err = new CustomError("Forbidden: Students only", 403);
    return respond(c, err.statusCode, err.message);
  }
  return next();
};
