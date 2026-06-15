import mongoose from "mongoose";

type MetricsState = {
  startedAt: string;
  requestCount: number;
  errorCount: number;
  statusCodes: Record<string, number>;
  routeCounts: Record<string, number>;
  lastErrorMessage: string | null;
};

const metricsState: MetricsState = {
  startedAt: new Date().toISOString(),
  requestCount: 0,
  errorCount: 0,
  statusCodes: {},
  routeCounts: {},
  lastErrorMessage: null,
};

export function recordRequest(path: string, statusCode: number) {
  metricsState.requestCount += 1;
  metricsState.statusCodes[String(statusCode)] = (metricsState.statusCodes[String(statusCode)] ?? 0) + 1;
  metricsState.routeCounts[path] = (metricsState.routeCounts[path] ?? 0) + 1;
}

export function recordError(message: string) {
  metricsState.errorCount += 1;
  metricsState.lastErrorMessage = message;
}

export function getMetricsSnapshot() {
  return {
    ...metricsState,
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsage: process.memoryUsage(),
    database: {
      readyState: mongoose.connection.readyState,
      connected: mongoose.connection.readyState === 1,
    },
  };
}
