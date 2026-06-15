import type { Request, Response } from "express";

import { db } from "../../data/mock-db.js";

export function getDashboardData(request: Request, response: Response) {
  const organization = request.auth!.organization;
  const membershipCount = db.memberships.filter((item) => item.organizationId === organization.id).length;
  const clients = db.clients.filter((item) => item.organizationId === organization.id && !item.deletedAt);
  const archivedClients = db.clients.filter((item) => item.organizationId === organization.id && item.deletedAt);
  const projects = db.projects.filter((item) => item.organizationId === organization.id && !item.deletedAt);
  const archivedProjects = db.projects.filter((item) => item.organizationId === organization.id && item.deletedAt);
  const tasks = db.tasks.filter((item) => item.organizationId === organization.id && !item.deletedAt);
  const archivedTasks = db.tasks.filter((item) => item.organizationId === organization.id && item.deletedAt);
  const subscription = db.subscriptions.find((item) => item.organizationId === organization.id);
  const invoices = db.invoices.filter((item) => item.organizationId === organization.id);

  const projectStatusCounts = {
    planned: projects.filter((item) => item.status === "planned").length,
    active: projects.filter((item) => item.status === "active").length,
    review: projects.filter((item) => item.status === "review").length,
    completed: projects.filter((item) => item.status === "completed").length,
  };

  const taskStatusCounts = {
    backlog: tasks.filter((item) => item.status === "backlog").length,
    in_progress: tasks.filter((item) => item.status === "in_progress").length,
    review: tasks.filter((item) => item.status === "review").length,
    completed: tasks.filter((item) => item.status === "completed").length,
  };

  response.status(200).json({
    success: true,
    data: {
      organization,
      summary: {
        members: membershipCount,
        clients: clients.length,
        projects: projects.length,
        tasks: tasks.length,
        activeProjects: projects.filter((item) => item.status === "active").length,
      },
      analytics: {
        projectStatusCounts,
        taskStatusCounts,
        archived: {
          clients: archivedClients.length,
          projects: archivedProjects.length,
          tasks: archivedTasks.length,
        },
        revenue: {
          paid: invoices.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0),
          pending: invoices.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount, 0),
        },
      },
      subscription,
      clients,
      projects,
      tasks,
    },
  });
}
