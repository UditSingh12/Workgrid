import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.js";
import { requirePermission } from "../../middlewares/permission.js";
import { getBillingController } from "./billing.controller.js";

const billingRouter = Router();

billingRouter.use(requireAuth);
billingRouter.get("/", requirePermission("billing:view"), getBillingController);

export { billingRouter };
