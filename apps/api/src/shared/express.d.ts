import type { AuthenticatedRequestContext } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequestContext;
    }
  }
}

export {};
