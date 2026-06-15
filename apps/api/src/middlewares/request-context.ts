import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

export function attachRequestContext(request: Request, response: Response, next: NextFunction) {
  const requestId = request.headers["x-request-id"];
  const resolvedRequestId =
    typeof requestId === "string" && requestId.trim().length > 0 ? requestId : nanoid(12);

  response.locals.requestId = resolvedRequestId;
  response.setHeader("x-request-id", resolvedRequestId);
  next();
}
