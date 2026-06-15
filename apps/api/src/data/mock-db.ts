import { nanoid } from "nanoid";
import { hashSync } from "bcryptjs";

import type {
  ActivityLog,
  AuthSession,
  AuthenticatedRequestContext,
  Client,
  Invoice,
  Membership,
  Organization,
  Permission,
  Project,
  Subscription,
  Task,
  User,
} from "../shared/types.js";
import {
  deleteAuthSession,
  persistActivityLog,
  persistAuthSession,
  persistClient,
  persistInvoice,
  persistMembership,
  persistOrganization,
  persistProject,
  persistSubscription,
  persistTask,
  persistUser,
} from "./database.js";

const rolePermissions: Record<Membership["role"], Permission[]> = {
  owner: [
    "workspace:view",
    "workspace:edit",
    "members:invite",
    "members:manage",
    "clients:view",
    "clients:create",
    "projects:view",
    "projects:create",
    "tasks:manage",
    "billing:view",
  ],
  admin: [
    "workspace:view",
    "members:invite",
    "members:manage",
    "clients:view",
    "clients:create",
    "projects:view",
    "projects:create",
    "tasks:manage",
    "billing:view",
  ],
  manager: ["workspace:view", "clients:view", "projects:view", "projects:create", "tasks:manage"],
  viewer: ["workspace:view", "clients:view", "projects:view"],
};

function makeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const db = {
  organizations: [] as Organization[],
  users: [] as User[],
  memberships: [] as Membership[],
  subscriptions: [] as Subscription[],
  clients: [] as Client[],
  projects: [] as Project[],
  tasks: [] as Task[],
  invoices: [] as Invoice[],
  activityLogs: [] as ActivityLog[],
  authSessions: [] as AuthSession[],
};

export function createOrganizationRecord(input: {
  name: string;
  industry: string;
  timezone: string;
  currency: string;
  plan: Organization["plan"];
}) {
  const createdAt = new Date().toISOString();

  const organization: Organization = {
    id: nanoid(),
    name: input.name,
    slug: makeSlug(input.name),
    plan: input.plan,
    industry: input.industry,
    timezone: input.timezone,
    currency: input.currency,
    createdAt,
  };

  db.organizations.push(organization);
  persistOrganization(organization);
  const subscription: Subscription = {
    organizationId: organization.id,
    plan: input.plan,
    seats: 5,
    status: "trialing",
    renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  };
  db.subscriptions.push(subscription);
  persistSubscription(subscription);

  return organization;
}

export function createUserRecord(input: {
  name: string;
  email: string;
  title: string;
  password: string;
}) {
  const user: User = {
    id: nanoid(),
    name: input.name,
    email: input.email.toLowerCase(),
    title: input.title,
    password: input.password || hashSync("temporary-password", 10),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  persistUser(user);
  return user;
}

export function createMembershipRecord(input: {
  userId: string;
  organizationId: string;
  role: Membership["role"];
}) {
  const membership: Membership = {
    id: nanoid(),
    userId: input.userId,
    organizationId: input.organizationId,
    role: input.role,
    permissions: rolePermissions[input.role],
    status: "active",
  };

  db.memberships.push(membership);
  persistMembership(membership);
  return membership;
}

export function findSessionByEmail(email: string) {
  const user = db.users.find((item) => item.email === email.toLowerCase());
  if (!user) {
    return null;
  }

  const membership = db.memberships.find((item) => item.userId === user.id);
  if (!membership) {
    return null;
  }

  const organization = db.organizations.find((item) => item.id === membership.organizationId);
  if (!organization) {
    return null;
  }

  return { user, membership, organization };
}

export function createClientRecord(input: {
  organizationId: string;
  name: string;
  status: "active" | "lead";
  accountManager: string;
}) {
  const client: Client = {
    id: nanoid(),
    organizationId: input.organizationId,
    name: input.name,
    status: input.status,
    accountManager: input.accountManager,
  };

  db.clients.push(client);
  persistClient(client);
  return client;
}

export function updateClientRecord(
  clientId: string,
  input: Partial<Pick<Client, "name" | "status" | "accountManager">>,
) {
  const client = db.clients.find((item) => item.id === clientId);
  if (!client) {
    return null;
  }

  Object.assign(client, input);
  persistClient(client);
  return client;
}

export function archiveClientRecord(clientId: string) {
  const client = db.clients.find((item) => item.id === clientId);
  if (!client) {
    return null;
  }

  client.deletedAt = new Date().toISOString();
  persistClient(client);
  return client;
}

export function restoreClientRecord(clientId: string) {
  const client = db.clients.find((item) => item.id === clientId);
  if (!client) {
    return null;
  }

  delete client.deletedAt;
  persistClient(client);
  return client;
}

export function createProjectRecord(input: {
  organizationId: string;
  clientId: string;
  name: string;
  status: Project["status"];
  ownerId: string;
  health: Project["health"];
}) {
  const project: Project = {
    id: nanoid(),
    organizationId: input.organizationId,
    clientId: input.clientId,
    name: input.name,
    status: input.status,
    ownerId: input.ownerId,
    health: input.health,
  };

  db.projects.push(project);
  persistProject(project);
  return project;
}

export function updateProjectRecord(
  projectId: string,
  input: Partial<Pick<Project, "name" | "status" | "health" | "clientId">>,
) {
  const project = db.projects.find((item) => item.id === projectId);
  if (!project) {
    return null;
  }

  Object.assign(project, input);
  persistProject(project);
  return project;
}

export function archiveProjectRecord(projectId: string) {
  const project = db.projects.find((item) => item.id === projectId);
  if (!project) {
    return null;
  }

  project.deletedAt = new Date().toISOString();
  persistProject(project);
  return project;
}

export function restoreProjectRecord(projectId: string) {
  const project = db.projects.find((item) => item.id === projectId);
  if (!project) {
    return null;
  }

  delete project.deletedAt;
  persistProject(project);
  return project;
}

export function createActivityLog(input: Omit<ActivityLog, "id" | "createdAt">) {
  const activity: ActivityLog = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  db.activityLogs.unshift(activity);
  persistActivityLog(activity);
  return activity;
}

export function createAuthSessionRecord(input: Omit<AuthSession, "id" | "createdAt">) {
  const authSession: AuthSession = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  db.authSessions.push(authSession);
  persistAuthSession(authSession);
  return authSession;
}

export function findAuthSessionById(sessionId: string) {
  return db.authSessions.find((item) => item.id === sessionId) ?? null;
}

export function updateAuthSessionRecord(
  sessionId: string,
  input: Partial<Pick<AuthSession, "refreshTokenHash" | "expiresAt">>,
) {
  const authSession = db.authSessions.find((item) => item.id === sessionId);
  if (!authSession) {
    return null;
  }

  Object.assign(authSession, input);
  persistAuthSession(authSession);
  return authSession;
}

export function removeAuthSessionRecord(sessionId: string) {
  const index = db.authSessions.findIndex((item) => item.id === sessionId);
  if (index === -1) {
    return;
  }

  db.authSessions.splice(index, 1);
  deleteAuthSession(sessionId);
}
