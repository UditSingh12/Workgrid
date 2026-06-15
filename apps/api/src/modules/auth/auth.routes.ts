import { Router } from "express";

import { authRateLimiter } from "../../middlewares/rate-limit.js";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerController);
authRouter.post("/login", authRateLimiter, loginController);
authRouter.post("/refresh", authRateLimiter, refreshController);
authRouter.post("/logout", logoutController);

export { authRouter };
