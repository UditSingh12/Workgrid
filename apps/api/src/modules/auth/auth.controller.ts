import type { Request, Response } from "express";

import {
  REFRESH_COOKIE_NAME,
  REFRESH_TTL_MS,
  login,
  logout,
  refreshSession,
  register,
} from "./auth.service.js";

function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_TTL_MS,
  });
}

export function registerController(request: Request, response: Response) {
  const result = register(request.body);
  setRefreshCookie(response, result.refreshToken);

  response.status(201).json({
    success: true,
    message: "Workspace created successfully",
    data: result.session,
  });
}

export function loginController(request: Request, response: Response) {
  const result = login(request.body);
  setRefreshCookie(response, result.refreshToken);

  response.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: result.session,
  });
}

export function refreshController(request: Request, response: Response) {
  const refreshToken = request.cookies[REFRESH_COOKIE_NAME] as string | undefined;
  const result = refreshSession(refreshToken ?? "");
  setRefreshCookie(response, result.refreshToken);

  response.status(200).json({
    success: true,
    message: "Session refreshed successfully",
    data: result.session,
  });
}

export function logoutController(request: Request, response: Response) {
  const refreshToken = request.cookies[REFRESH_COOKIE_NAME] as string | undefined;
  logout(refreshToken);
  response.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });

  response.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: null,
  });
}
