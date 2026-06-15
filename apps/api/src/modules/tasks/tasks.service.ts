import { nanoid } from "nanoid";

import { createActivityLog, db } from "../../data/mock-db.js";
import { persistTask } from "../../data/database.js";
import { HttpError } from "../../lib/http-error.js";
import type { AuthenticatedRequestContext, Task } from "../../shared/types.js";
import { createTaskSchema, updateTaskSchema } from "./tasks.schemas.js";

export function listTasks(auth: AuthenticatedRequestContext) {
  return db.tasks
    .filter((task) => task.organizationId === auth.organization.id && !task.deletedAt)
    .map((task) => ({
      ...task,
      projectName: db.projects.find((project) => project.id === task.projectId)?.name ?? "Unknown project",
    }));
}

export function listArchivedTasks(auth: AuthenticatedRequestContext) {
  return db.tasks
    .filter((task) => task.organizationId === auth.organization.id && Boolean(task.deletedAt))
    .map((task) => ({
      ...task,
      projectName: db.projects.find((project) => project.id === task.projectId)?.name ?? "Unknown project",
    }));
}

export function createTask(auth: AuthenticatedRequestContext, input: unknown) {
  const payload = createTaskSchema.parse(input);

  const project = db.projects.find(
    (projectItem) =>
      projectItem.id === payload.projectId && projectItem.organizationId === auth.organization.id,
  );

  if (!project) {
    throw new HttpError(404, "Project not found for this workspace");
  }

  const task: Task = {
    id: nanoid(),
    organizationId: auth.organization.id,
    projectId: payload.projectId,
    title: payload.title,
    status: payload.status,
    assigneeId: auth.user.id,
    dueDate: payload.dueDate,
  };

  db.tasks.push(task);
  persistTask(task);
  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Created task",
    entityType: "task",
    entityName: task.title,
  });

  return task;
}

export function updateTask(auth: AuthenticatedRequestContext, taskId: string, input: unknown) {
  const payload = updateTaskSchema.parse(input);

  const task = db.tasks.find(
    (taskItem) => taskItem.id === taskId && taskItem.organizationId === auth.organization.id,
  );

  if (!task) {
    throw new HttpError(404, "Task not found for this workspace");
  }

  Object.assign(task, payload);
  persistTask(task);
  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Updated task",
    entityType: "task",
    entityName: task.title,
  });

  return task;
}

export function archiveTask(auth: AuthenticatedRequestContext, taskId: string) {
  const task = db.tasks.find(
    (taskItem) => taskItem.id === taskId && taskItem.organizationId === auth.organization.id && !taskItem.deletedAt,
  );

  if (!task) {
    throw new HttpError(404, "Task not found for this workspace");
  }

  task.deletedAt = new Date().toISOString();
  persistTask(task);
  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Archived task",
    entityType: "task",
    entityName: task.title,
  });

  return task;
}

export function restoreTask(auth: AuthenticatedRequestContext, taskId: string) {
  const task = db.tasks.find(
    (taskItem) => taskItem.id === taskId && taskItem.organizationId === auth.organization.id && taskItem.deletedAt,
  );

  if (!task) {
    throw new HttpError(404, "Archived task not found for this workspace");
  }

  delete task.deletedAt;
  persistTask(task);
  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Restored task",
    entityType: "task",
    entityName: task.title,
  });

  return task;
}
