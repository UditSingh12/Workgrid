import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../src/app.js";

describe("health endpoint", () => {
  it("returns service health details", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.environment).toBeDefined();
    expect(response.body.data.timestamp).toBeDefined();
  });

  it("returns liveness, readiness, and metrics endpoints", async () => {
    const liveResponse = await request(app).get("/api/health/live");
    const readyResponse = await request(app).get("/api/health/ready");
    const metricsResponse = await request(app).get("/api/health/metrics");

    expect(liveResponse.status).toBe(200);
    expect(liveResponse.body.data.alive).toBe(true);
    expect([200, 503]).toContain(readyResponse.status);
    expect(readyResponse.body.data.checks.api).toBe("ready");
    expect(metricsResponse.status).toBe(200);
    expect(metricsResponse.body.data.requestCount).toBeGreaterThanOrEqual(0);
  });
});
