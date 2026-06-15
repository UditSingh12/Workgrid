import { env } from "../../config/env.js";
import { getMetricsSnapshot } from "../../config/observability.js";

export function getHealthPayload() {
  return {
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

export function getReadinessPayload() {
  const metrics = getMetricsSnapshot();

  return {
    ready: metrics.database.connected,
    checks: {
      database: metrics.database.connected ? "connected" : "disconnected",
      api: "ready",
    },
    timestamp: new Date().toISOString(),
  };
}

export function getLivenessPayload() {
  return {
    alive: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
