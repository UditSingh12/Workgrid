import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import {
  archiveTaskController,
  createTaskController,
  listArchivedTasksController,
  listTasksController,
  restoreTaskController,
  updateTaskController,
} from "./tasks.controller.js";

const tasksRouter = Router();

tasksRouter.use(requireAuth);
tasksRouter.get("/", requirePermission("tasks:manage"), listTasksController);
tasksRouter.get("/archived", requirePermission("tasks:manage"), listArchivedTasksController);
tasksRouter.post("/", requirePermission("tasks:manage"), createTaskController);
tasksRouter.patch("/:id", requirePermission("tasks:manage"), updateTaskController);
tasksRouter.post("/:id/archive", requirePermission("tasks:manage"), archiveTaskController);
tasksRouter.post("/:id/restore", requirePermission("tasks:manage"), restoreTaskController);

export { tasksRouter };
