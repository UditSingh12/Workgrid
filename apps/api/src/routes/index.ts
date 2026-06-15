import { Router } from "express";

import { activityRouter } from "../modules/activity/activity.routes.js";
import { clientsRouter } from "../modules/clients/clients.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { billingRouter } from "../modules/billing/billing.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { membersRouter } from "../modules/members/members.routes.js";
import { projectsRouter } from "../modules/projects/projects.routes.js";
import { tasksRouter } from "../modules/tasks/tasks.routes.js";
import { workspaceRouter } from "../modules/workspace/workspace.routes.js";

const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.json({
    success: true,
    message: "Welcome to the Workgrid API",
    modules: [
      "auth",
      "organizations",
      "users",
      "roles",
      "clients",
      "projects",
      "tasks",
      "billing",
      "notifications",
      "reports",
      "audit",
    ],
  });
});

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/clients", clientsRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/members", membersRouter);
apiRouter.use("/workspace", workspaceRouter);
apiRouter.use("/activity", activityRouter);

export { apiRouter };
