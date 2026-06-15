import type { Request, Response } from "express";

import {
  archiveProject,
  createProject,
  listArchivedProjects,
  listProjects,
  restoreProject,
  updateProject,
} from "./projects.service.js";

export function listProjectsController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listProjects(request.auth!),
  });
}

export function listArchivedProjectsController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listArchivedProjects(request.auth!),
  });
}

export function createProjectController(request: Request, response: Response) {
  response.status(201).json({
    success: true,
    message: "Project created successfully",
    data: createProject(request.auth!, request.body),
  });
}

export function updateProjectController(request: Request, response: Response) {
  const projectId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

  response.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: updateProject(request.auth!, projectId, request.body),
  });
}

export function archiveProjectController(request: Request, response: Response) {
  const projectId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Project archived successfully",
    data: archiveProject(request.auth!, projectId),
  });
}

export function restoreProjectController(request: Request, response: Response) {
  const projectId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Project restored successfully",
    data: restoreProject(request.auth!, projectId),
  });
}
