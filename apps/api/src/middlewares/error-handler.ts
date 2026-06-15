import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { HttpError } from "../lib/http-error.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Validation failed",
    });
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : message === "Invalid email or password" || message.includes("already exists")
        ? 400
        : 500;

  response.status(statusCode).json({
    success: false,
    message,
  });
}
