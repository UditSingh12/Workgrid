import type { Request, Response } from "express";

import { db } from "../../data/mock-db.js";

export function listActivityController(request: Request, response: Response) {
  const organizationId = request.auth!.organization.id;

  response.status(200).json({
    success: true,
    data: db.activityLogs.filter((item) => item.organizationId === organizationId).slice(0, 12),
  });
}
