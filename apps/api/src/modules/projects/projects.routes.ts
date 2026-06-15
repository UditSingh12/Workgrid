import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import {
  archiveProjectController,
  createProjectController,
  listArchivedProjectsController,
  listProjectsController,
  restoreProjectController,
  updateProjectController,
} from "./projects.controller.js";

const projectsRouter = Router();

projectsRouter.use(requireAuth);
projectsRouter.get("/", requirePermission("projects:view"), listProjectsController);
projectsRouter.get("/archived", requirePermission("projects:view"), listArchivedProjectsController);
projectsRouter.post("/", requirePermission("projects:create"), createProjectController);
projectsRouter.patch("/:id", requirePermission("projects:create"), updateProjectController);
projectsRouter.post("/:id/archive", requirePermission("projects:create"), archiveProjectController);
projectsRouter.post("/:id/restore", requirePermission("projects:create"), restoreProjectController);

export { projectsRouter };
