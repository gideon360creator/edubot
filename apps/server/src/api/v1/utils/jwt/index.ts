import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/api/v1/utils/env";

const DEFAULT_EXP = "2h";
const ALG = "HS256";

const getSecret = (): Uint8Array => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
};

export interface AppJwtPayload extends JWTPayload {
  sub: string; // username
  role?: string;
}

export const signToken = async (
  payload: Omit<AppJwtPayload, "exp" | "iat">,
  expiresIn: string = DEFAULT_EXP
): Promise<string> => {
  const secret = getSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secret);
};

export const verifyToken = async (
  token: string
): Promise<AppJwtPayload & { sub: string }> => {
  const secret = getSecret();
  const { payload } = await jwtVerify<AppJwtPayload>(token, secret, {
    algorithms: [ALG],
  });
  if (!payload.sub) {
    throw new Error("Token missing subject");
  }
  return payload as AppJwtPayload & { sub: string };
};
