import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger.js";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();

  response.on("finish", () => {
    logger.info("HTTP request completed", {
      requestId: response.locals.requestId as string | undefined,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
      ip: request.ip,
      userAgent: request.get("user-agent"),
      organizationId: request.auth?.organization.id,
      userId: request.auth?.user.id,
    });
  });

  next();
}
