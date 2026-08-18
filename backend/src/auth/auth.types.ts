import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  cookies?: Record<string, string | undefined>;
  user?: AuthUser;
};
