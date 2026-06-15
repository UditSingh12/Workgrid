import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/http-error.js";
import type { Permission } from "../shared/types.js";

export function requirePermission(permission: Permission) {
  return function permissionMiddleware(request: Request, _response: Response, next: NextFunction) {
    const hasPermission = request.auth?.membership.permissions.includes(permission);
    if (!hasPermission) {
      return next(new HttpError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
}
