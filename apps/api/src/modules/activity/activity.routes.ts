import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import { listActivityController } from "./activity.controller.js";

const activityRouter = Router();

activityRouter.use(requireAuth);
activityRouter.get("/", requirePermission("workspace:view"), listActivityController);

export { activityRouter };
