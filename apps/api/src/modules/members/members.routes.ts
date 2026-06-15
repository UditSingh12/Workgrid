import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import { listMembersController } from "./members.controller.js";

const membersRouter = Router();

membersRouter.use(requireAuth);
membersRouter.get("/", requirePermission("members:manage"), listMembersController);

export { membersRouter };
