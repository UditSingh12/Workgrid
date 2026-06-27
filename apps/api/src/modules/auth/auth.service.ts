import { compareSync, hashSync } from "bcryptjs";

import {
  createAuthSessionRecord,
  createMembershipRecord,
  createOrganizationRecord,
  createUserRecord,
  db,
  findAuthSessionById,
  findSessionByEmail,
  removeAuthSessionRecord,
  updateAuthSessionRecord,
} from "../../data/mock-db.js";
import { HttpError } from "../../lib/http-error.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/auth-token.js";
import type { SessionPayload } from "../../shared/types.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

const REFRESH_COOKIE_NAME = "saas_admin_refresh_token";
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function getSessionByEmail(email: string) {
  const session = findSessionByEmail(email);
  if (!session) {
    throw new HttpError(500, "Session could not be created");
  }

  return session;
}

function buildAccessSession(session: ReturnType<typeof getSessionByEmail>): SessionPayload {
  return {
    token: signAccessToken({
      userId: session.user.id,
      organizationId: session.organization.id,
      membershipId: session.membership.id,
    }),
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      title: session.user.title,
    },
    organization: session.organization,
    membership: session.membership,
  };
}

function buildAuthResponse(email: string) {
  const session = getSessionByEmail(email);
  const authSession = createAuthSessionRecord({
    userId: session.user.id,
    organizationId: session.organization.id,
    membershipId: session.membership.id,
    refreshTokenHash: "",
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });

  const refreshToken = signRefreshToken({
    sessionId: authSession.id,
    userId: session.user.id,
    organizationId: session.organization.id,
    membershipId: session.membership.id,
    type: "refresh",
  });

  updateAuthSessionRecord(authSession.id, {
    refreshTokenHash: hashSync(refreshToken, 10),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });

  return {
    session: buildAccessSession(session),
    refreshToken,
  };
}

export function register(input: unknown) {
  const payload = registerSchema.parse(input);

  const existingUser = db.users.find((user) => user.email === payload.email.toLowerCase());
  if (existingUser) {
    throw new HttpError(400, "A user with this email already exists");
  }

  const organization = createOrganizationRecord({
    name: payload.organizationName,
    industry: payload.industry,
    timezone: payload.timezone,
    currency: payload.currency.toUpperCase(),
    plan: payload.plan,
  });

  const user = createUserRecord({
    name: payload.name,
    email: payload.email,
    title: payload.title,
    password: hashSync(payload.password, 10),
  });

  createMembershipRecord({
    userId: user.id,
    organizationId: organization.id,
    role: payload.role,
  });

  return buildAuthResponse(payload.email);
}

export function login(input: unknown) {
  const payload = loginSchema.parse(input);

  const session = findSessionByEmail(payload.email);
  if (!session || !compareSync(payload.password, session.user.password)) {
    throw new HttpError(400, "Invalid email or password");
  }

  return buildAuthResponse(payload.email);
}

export function refreshSession(refreshToken: string) {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  const authSession = findAuthSessionById(payload.sessionId);
  if (!authSession) {
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  if (new Date(authSession.expiresAt).getTime() < Date.now()) {
    removeAuthSessionRecord(authSession.id);
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  if (!compareSync(refreshToken, authSession.refreshTokenHash)) {
    removeAuthSessionRecord(authSession.id);
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  const email = db.users.find((item) => item.id === authSession.userId)?.email;
  if (!email) {
    removeAuthSessionRecord(authSession.id);
    throw new HttpError(401, "Refresh session is invalid or expired");
  }

  const session = getSessionByEmail(email);
  const rotatedRefreshToken = signRefreshToken({
    sessionId: authSession.id,
    userId: authSession.userId,
    organizationId: authSession.organizationId,
    membershipId: authSession.membershipId,
    type: "refresh",
  });

  updateAuthSessionRecord(authSession.id, {
    refreshTokenHash: hashSync(rotatedRefreshToken, 10),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });

  return {
    session: buildAccessSession(session),
    refreshToken: rotatedRefreshToken,
  };
}

export function logout(refreshToken: string | undefined) {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    removeAuthSessionRecord(payload.sessionId);
  } catch {
    return;
  }
}

export { REFRESH_COOKIE_NAME, REFRESH_TTL_MS };
