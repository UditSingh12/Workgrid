import type { Request, Response } from "express";

import { getMetricsSnapshot } from "../../config/observability.js";
import { env } from "../../config/env.js";
import { getHealthPayload, getLivenessPayload, getReadinessPayload } from "./health.service.js";

export function getHealth(_request: Request, response: Response) {
  response.status(200).json({
    success: true,
    message: `${env.APP_NAME} is running`,
    data: getHealthPayload(),
  });
}

export function getLiveness(_request: Request, response: Response) {
  response.status(200).json({
    success: true,
    message: `${env.APP_NAME} is alive`,
    data: getLivenessPayload(),
  });
}

export function getReadiness(_request: Request, response: Response) {
  const data = getReadinessPayload();

  response.status(data.ready ? 200 : 503).json({
    success: data.ready,
    message: data.ready ? `${env.APP_NAME} is ready` : `${env.APP_NAME} is not ready`,
    data,
  });
}

export function getMetrics(_request: Request, response: Response) {
  response.status(200).json({
    success: true,
    message: `${env.APP_NAME} metrics snapshot`,
    data: getMetricsSnapshot(),
  });
}
