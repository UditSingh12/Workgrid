import type { Request, Response } from "express";

import { env } from "../../config/env.js";

export function getHealth(_request: Request, response: Response) {
  response.status(200).json({
    success: true,
    message: `${env.APP_NAME} is running`,
    data: {
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}
