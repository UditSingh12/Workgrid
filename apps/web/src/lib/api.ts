import type { SessionData } from "../shared/types";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const API_URL = "http://localhost:4000/api";
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

export type ClientRecord = {
  id: string;
  name: string;
  status: string;
  accountManager: string;
  deletedAt?: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  status: string;
  health: string;
  clientId: string;
  clientName: string;
  deletedAt?: string;
};

export type TaskRecord = {
  id: string;
  projectId: string;
  title: string;
  status: string;
  dueDate: string;
  projectName: string;
  deletedAt?: string;
};

export type DashboardPayload = {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    industry: string;
    timezone: string;
    currency: string;
  };
  summary: {
    members: number;
    clients: number;
    projects: number;
    tasks: number;
    activeProjects: number;
  };
  analytics: {
    projectStatusCounts: {
      planned: number;
      active: number;
      review: number;
      completed: number;
    };
    taskStatusCounts: {
      backlog: number;
      in_progress: number;
      review: number;
      completed: number;
    };
    archived: {
      clients: number;
      projects: number;
      tasks: number;
    };
    revenue: {
      paid: number;
      pending: number;
    };
  };
  subscription: {
    plan: string;
    seats: number;
    status: string;
    renewalDate: string;
  };
  clients: ClientRecord[];
  projects: Array<{ id: string; name: string; status: string; health: string }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate: string }>;
};

export type DemoAccessPayload = {
  enabled: boolean;
  workspaceName: string | null;
  email: string | null;
  password: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const payload = (await response.json()) as ApiEnvelope<T> | { message: string };

  if (!response.ok || !("data" in payload)) {
    throw new Error("message" in payload ? payload.message : "Request failed");
  }

  return payload.data;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  getDemoAccess: () =>
    request<DemoAccessPayload>("/auth/demo"),
  getDashboard: (token: string) =>
    request<DashboardPayload>("/dashboard", {
      headers: authHeaders(token),
    }),
  login: (body: { email: string; password: string }) =>
    request<SessionData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: {
    name: string;
    email: string;
    password: string;
    title: string;
    organizationName: string;
    industry: string;
    timezone: string;
    currency: string;
    role: "owner" | "admin" | "manager" | "viewer";
    plan: "starter" | "growth" | "enterprise";
  }) =>
    request<SessionData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refreshSession: () =>
    request<SessionData>("/auth/refresh", {
      method: "POST",
    }),
  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),
  getClients: (token: string) =>
    request<ClientRecord[]>("/clients", {
      headers: authHeaders(token),
    }),
  getArchivedClients: (token: string) =>
    request<ClientRecord[]>("/clients/archived", {
      headers: authHeaders(token),
    }),
  createClient: (
    token: string,
    body: { name: string; status: "active" | "lead"; accountManager: string },
  ) =>
    request<ClientRecord>("/clients", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  updateClient: (
    token: string,
    id: string,
    body: Partial<{ name: string; status: "active" | "lead"; accountManager: string }>,
  ) =>
    request<ClientRecord>(`/clients/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  archiveClient: (token: string, id: string) =>
    request<ClientRecord>(`/clients/${id}/archive`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  restoreClient: (token: string, id: string) =>
    request<ClientRecord>(`/clients/${id}/restore`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  getProjects: (token: string) =>
    request<ProjectRecord[]>("/projects", {
      headers: authHeaders(token),
    }),
  getArchivedProjects: (token: string) =>
    request<ProjectRecord[]>("/projects/archived", {
      headers: authHeaders(token),
    }),
  createProject: (
    token: string,
    body: {
      name: string;
      clientId: string;
      status: "planned" | "active" | "review" | "completed";
      health: "good" | "risk";
    },
  ) =>
    request<ProjectRecord>("/projects", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  updateProject: (
    token: string,
    id: string,
    body: Partial<{
      name: string;
      clientId: string;
      status: "planned" | "active" | "review" | "completed";
      health: "good" | "risk";
    }>,
  ) =>
    request<ProjectRecord>(`/projects/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  archiveProject: (token: string, id: string) =>
    request<ProjectRecord>(`/projects/${id}/archive`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  restoreProject: (token: string, id: string) =>
    request<ProjectRecord>(`/projects/${id}/restore`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  getMembers: (token: string) =>
    request<
      Array<{
        id: string;
        name: string;
        email: string;
        title: string;
        role: string;
        status: string;
        permissions: string[];
      }>
    >("/members", {
      headers: authHeaders(token),
    }),
  getWorkspace: (token: string) =>
    request<{
      organization: {
        name: string;
        slug: string;
        plan: string;
        industry: string;
        timezone: string;
        currency: string;
      };
      subscription: {
        plan: string;
        seats: number;
        status: string;
        renewalDate: string;
      };
      security: {
        twoFactorEnforced: boolean;
        domainAllowlist: string[];
        auditLogsEnabled: boolean;
      };
    }>("/workspace", {
      headers: authHeaders(token),
    }),
  getTasks: (token: string) =>
    request<TaskRecord[]>("/tasks", {
      headers: authHeaders(token),
    }),
  getArchivedTasks: (token: string) =>
    request<TaskRecord[]>("/tasks/archived", {
      headers: authHeaders(token),
    }),
  createTask: (
    token: string,
    body: {
      projectId: string;
      title: string;
      status: "backlog" | "in_progress" | "review" | "completed";
      dueDate: string;
    },
  ) =>
    request<TaskRecord>("/tasks", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  updateTask: (
    token: string,
    id: string,
    body: Partial<{
      title: string;
      status: "backlog" | "in_progress" | "review" | "completed";
      dueDate: string;
    }> & { projectId: string },
  ) =>
    request<TaskRecord>(`/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),
  archiveTask: (token: string, id: string) =>
    request<TaskRecord>(`/tasks/${id}/archive`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  restoreTask: (token: string, id: string) =>
    request<TaskRecord>(`/tasks/${id}/restore`, {
      method: "POST",
      headers: authHeaders(token),
    }),
  getBilling: (token: string) =>
    request<{
      subscription: {
        plan: string;
        seats: number;
        status: string;
        renewalDate: string;
      };
      invoices: Array<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        issuedAt: string;
        dueAt: string;
        clientName: string;
      }>;
      metrics: {
        totalRevenue: number;
        outstandingRevenue: number;
        paidInvoices: number;
      };
      activity: Array<{
        id: string;
        actorName: string;
        action: string;
        entityName: string;
        createdAt: string;
      }>;
    }>("/billing", {
      headers: authHeaders(token),
    }),
  getActivity: (token: string) =>
    request<
      Array<{
        id: string;
        actorName: string;
        action: string;
        entityType: string;
        entityName: string;
        createdAt: string;
      }>
    >("/activity", {
      headers: authHeaders(token),
    }),
};
