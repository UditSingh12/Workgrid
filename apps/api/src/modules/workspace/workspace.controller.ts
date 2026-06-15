import type { Request, Response } from "express";

import { db } from "../../data/mock-db.js";

export function getWorkspaceController(request: Request, response: Response) {
  const organization = request.auth!.organization;
  const subscription = db.subscriptions.find((item) => item.organizationId === organization.id);

  response.status(200).json({
    success: true,
    data: {
      organization,
      subscription,
      security: {
        twoFactorEnforced: false,
        domainAllowlist: [],
        auditLogsEnabled: true,
      },
    },
  });
}
