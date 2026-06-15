import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import { getWorkspaceController } from "./workspace.controller.js";

const workspaceRouter = Router();

workspaceRouter.use(requireAuth);
workspaceRouter.get("/", requirePermission("workspace:view"), getWorkspaceController);

export { workspaceRouter };
