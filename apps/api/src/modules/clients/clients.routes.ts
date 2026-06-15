import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import {
  archiveClientController,
  createClientController,
  listArchivedClientsController,
  listClientsController,
  restoreClientController,
  updateClientController,
} from "./clients.controller.js";

const clientsRouter = Router();

clientsRouter.use(requireAuth);
clientsRouter.get("/", requirePermission("clients:view"), listClientsController);
clientsRouter.get("/archived", requirePermission("clients:view"), listArchivedClientsController);
clientsRouter.post("/", requirePermission("clients:create"), createClientController);
clientsRouter.patch("/:id", requirePermission("clients:create"), updateClientController);
clientsRouter.post("/:id/archive", requirePermission("clients:create"), archiveClientController);
clientsRouter.post("/:id/restore", requirePermission("clients:create"), restoreClientController);

export { clientsRouter };
