import type { NextFunction, Request, Response } from "express";

import { db } from "../data/mock-db.js";
import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/auth-token.js";

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;
  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return next(new HttpError(401, "Authentication token is required"));
  }

  let payload: { userId: string; organizationId: string; membershipId: string };

  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(new HttpError(401, "Session is invalid or expired"));
  }

  const user = db.users.find((item) => item.id === payload.userId);
  const membership = db.memberships.find(
    (item) => item.id === payload.membershipId && item.organizationId === payload.organizationId,
  );
  const organization = db.organizations.find((item) => item.id === payload.organizationId);

  if (!user || !membership || !organization) {
    return next(new HttpError(401, "Session is invalid or expired"));
  }

  request.auth = {
    token,
    user,
    membership,
    organization,
  };
  return next();
}
