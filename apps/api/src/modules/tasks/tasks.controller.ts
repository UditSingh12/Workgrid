import type { Request, Response } from "express";

import {
  archiveTask,
  createTask,
  listArchivedTasks,
  listTasks,
  restoreTask,
  updateTask,
} from "./tasks.service.js";

export function listTasksController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listTasks(request.auth!),
  });
}

export function listArchivedTasksController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listArchivedTasks(request.auth!),
  });
}

export function createTaskController(request: Request, response: Response) {
  response.status(201).json({
    success: true,
    message: "Task created successfully",
    data: createTask(request.auth!, request.body),
  });
}

export function updateTaskController(request: Request, response: Response) {
  const taskId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

  response.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: updateTask(request.auth!, taskId, request.body),
  });
}

export function archiveTaskController(request: Request, response: Response) {
  const taskId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Task archived successfully",
    data: archiveTask(request.auth!, taskId),
  });
}

export function restoreTaskController(request: Request, response: Response) {
  const taskId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Task restored successfully",
    data: restoreTask(request.auth!, taskId),
  });
}
