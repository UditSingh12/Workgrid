import { Router } from "express";

import { getHealth, getLiveness, getMetrics, getReadiness } from "./health.controller.js";

const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/live", getLiveness);
healthRouter.get("/ready", getReadiness);
healthRouter.get("/metrics", getMetrics);

export { healthRouter };
