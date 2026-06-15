import {
  archiveProjectRecord,
  createActivityLog,
  createProjectRecord,
  db,
  restoreProjectRecord,
  updateProjectRecord,
} from "../../data/mock-db.js";
import { HttpError } from "../../lib/http-error.js";
import type { AuthenticatedRequestContext } from "../../shared/types.js";
import { createProjectSchema } from "./projects.schemas.js";
import { updateProjectSchema } from "./projects.update.schemas.js";

export function listProjects(auth: AuthenticatedRequestContext) {
  return db.projects
    .filter((project) => project.organizationId === auth.organization.id && !project.deletedAt)
    .map((project) => ({
      ...project,
      clientName: db.clients.find((client) => client.id === project.clientId)?.name ?? "Unknown client",
    }));
}

export function listArchivedProjects(auth: AuthenticatedRequestContext) {
  return db.projects
    .filter((project) => project.organizationId === auth.organization.id && Boolean(project.deletedAt))
    .map((project) => ({
      ...project,
      clientName: db.clients.find((client) => client.id === project.clientId)?.name ?? "Unknown client",
    }));
}

export function createProject(auth: AuthenticatedRequestContext, input: unknown) {
  const payload = createProjectSchema.parse(input);

  const client = db.clients.find(
    (clientItem) =>
      clientItem.id === payload.clientId && clientItem.organizationId === auth.organization.id,
  );

  if (!client) {
    throw new HttpError(404, "Client not found for this workspace");
  }

  const project = createProjectRecord({
    organizationId: auth.organization.id,
    clientId: payload.clientId,
    name: payload.name,
    status: payload.status,
    health: payload.health,
    ownerId: auth.user.id,
  });

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Created project",
    entityType: "project",
    entityName: project.name,
  });

  return project;
}

export function archiveProject(auth: AuthenticatedRequestContext, projectId: string) {
  const existingProject = db.projects.find(
    (project) => project.id === projectId && project.organizationId === auth.organization.id && !project.deletedAt,
  );
  if (!existingProject) {
    throw new HttpError(404, "Project not found for this workspace");
  }

  const project = archiveProjectRecord(projectId);
  if (!project) {
    throw new HttpError(404, "Project not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Archived project",
    entityType: "project",
    entityName: project.name,
  });

  return project;
}

export function restoreProject(auth: AuthenticatedRequestContext, projectId: string) {
  const existingProject = db.projects.find(
    (project) => project.id === projectId && project.organizationId === auth.organization.id && project.deletedAt,
  );
  if (!existingProject) {
    throw new HttpError(404, "Archived project not found for this workspace");
  }

  const project = restoreProjectRecord(projectId);
  if (!project) {
    throw new HttpError(404, "Archived project not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Restored project",
    entityType: "project",
    entityName: project.name,
  });

  return project;
}

export function updateProject(auth: AuthenticatedRequestContext, projectId: string, input: unknown) {
  const payload = updateProjectSchema.parse(input);

  const existingProject = db.projects.find(
    (project) => project.id === projectId && project.organizationId === auth.organization.id,
  );

  if (!existingProject) {
    throw new HttpError(404, "Project not found for this workspace");
  }

  if (payload.clientId) {
    const client = db.clients.find(
      (clientItem) =>
        clientItem.id === payload.clientId && clientItem.organizationId === auth.organization.id,
    );

    if (!client) {
      throw new HttpError(404, "Client not found for this workspace");
    }
  }

  const project = updateProjectRecord(projectId, payload);
  if (!project) {
    throw new HttpError(404, "Project not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Updated project",
    entityType: "project",
    entityName: project.name,
  });

  return project;
}
