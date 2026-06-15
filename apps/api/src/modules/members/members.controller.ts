import type { Request, Response } from "express";

import { db } from "../../data/mock-db.js";

export function listMembersController(request: Request, response: Response) {
  const organizationId = request.auth!.organization.id;

  const members = db.memberships
    .filter((membership) => membership.organizationId === organizationId)
    .map((membership) => {
      const user = db.users.find((userItem) => userItem.id === membership.userId);

      return {
        id: membership.id,
        name: user?.name ?? "Unknown user",
        email: user?.email ?? "unknown@example.com",
        title: user?.title ?? "Unknown title",
        role: membership.role,
        status: membership.status,
        permissions: membership.permissions,
      };
    });

  response.status(200).json({
    success: true,
    data: members,
  });
}
