export type TenantPlan = "starter" | "growth" | "enterprise";

export type MemberRole = "owner" | "admin" | "manager" | "viewer";

export type ProjectStatus = "planned" | "active" | "review" | "completed";

export type TaskStatus = "backlog" | "in_progress" | "review" | "completed";

export type Permission =
  | "workspace:view"
  | "workspace:edit"
  | "members:invite"
  | "members:manage"
  | "clients:view"
  | "clients:create"
  | "projects:view"
  | "projects:create"
  | "tasks:manage"
  | "billing:view";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  industry: string;
  timezone: string;
  currency: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  password: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  permissions: Permission[];
  status: "active" | "invited";
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  status: "active" | "lead";
  accountManager: string;
  deletedAt?: string;
}

export interface Project {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  ownerId: string;
  health: "good" | "risk";
  deletedAt?: string;
}

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  assigneeId: string;
  dueDate: string;
  deletedAt?: string;
}

export interface Subscription {
  organizationId: string;
  plan: TenantPlan;
  seats: number;
  status: "trialing" | "active";
  renewalDate: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  clientId: string;
  projectId?: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  issuedAt: string;
  dueAt: string;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  actorName: string;
  action: string;
  entityType: "client" | "project" | "task" | "billing" | "workspace";
  entityName: string;
  createdAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  organizationId: string;
  membershipId: string;
  refreshTokenHash: string;
  createdAt: string;
  expiresAt: string;
}

export interface SessionPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  organization: Organization;
  membership: Membership;
}

export interface AuthenticatedRequestContext {
  token: string;
  user: User;
  membership: Membership;
  organization: Organization;
}
