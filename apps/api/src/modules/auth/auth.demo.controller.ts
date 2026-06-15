import type { Request, Response } from "express";

import { env } from "../../config/env.js";

export function getDemoAccessController(_request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: {
      enabled: env.DEMO_MODE,
      workspaceName: env.DEMO_MODE ? env.DEMO_WORKSPACE_NAME : null,
      email: env.DEMO_MODE ? env.DEMO_OWNER_EMAIL : null,
      password: env.DEMO_MODE ? env.DEMO_OWNER_PASSWORD : null,
    },
  });
}
