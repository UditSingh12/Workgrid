import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import { getDashboardData } from "./dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get("/", requirePermission("workspace:view"), getDashboardData);

export { dashboardRouter };
