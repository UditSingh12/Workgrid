import type { Request, Response } from "express";

import {
  archiveClient,
  createClient,
  listArchivedClients,
  listClients,
  restoreClient,
  updateClient,
} from "./clients.service.js";

export function listClientsController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listClients(request.auth!),
  });
}

export function listArchivedClientsController(request: Request, response: Response) {
  response.status(200).json({
    success: true,
    data: listArchivedClients(request.auth!),
  });
}

export function createClientController(request: Request, response: Response) {
  response.status(201).json({
    success: true,
    message: "Client created successfully",
    data: createClient(request.auth!, request.body),
  });
}

export function updateClientController(request: Request, response: Response) {
  const clientId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

  response.status(200).json({
    success: true,
    message: "Client updated successfully",
    data: updateClient(request.auth!, clientId, request.body),
  });
}

export function archiveClientController(request: Request, response: Response) {
  const clientId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Client archived successfully",
    data: archiveClient(request.auth!, clientId),
  });
}

export function restoreClientController(request: Request, response: Response) {
  const clientId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  response.status(200).json({
    success: true,
    message: "Client restored successfully",
    data: restoreClient(request.auth!, clientId),
  });
}
