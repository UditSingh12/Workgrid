import {
  archiveClientRecord,
  createActivityLog,
  createClientRecord,
  db,
  restoreClientRecord,
  updateClientRecord,
} from "../../data/mock-db.js";
import { HttpError } from "../../lib/http-error.js";
import type { AuthenticatedRequestContext } from "../../shared/types.js";
import { createClientSchema } from "./clients.schemas.js";
import { updateClientSchema } from "./clients.update.schemas.js";

export function listClients(auth: AuthenticatedRequestContext) {
  return db.clients.filter((client) => client.organizationId === auth.organization.id && !client.deletedAt);
}

export function listArchivedClients(auth: AuthenticatedRequestContext) {
  return db.clients.filter((client) => client.organizationId === auth.organization.id && Boolean(client.deletedAt));
}

export function createClient(auth: AuthenticatedRequestContext, input: unknown) {
  const payload = createClientSchema.parse(input);

  const client = createClientRecord({
    organizationId: auth.organization.id,
    name: payload.name,
    status: payload.status,
    accountManager: payload.accountManager,
  });

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Created client",
    entityType: "client",
    entityName: client.name,
  });

  return client;
}

export function archiveClient(auth: AuthenticatedRequestContext, clientId: string) {
  const existingClient = db.clients.find(
    (client) => client.id === clientId && client.organizationId === auth.organization.id && !client.deletedAt,
  );

  if (!existingClient) {
    throw new HttpError(404, "Client not found for this workspace");
  }

  const client = archiveClientRecord(clientId);
  if (!client) {
    throw new HttpError(404, "Client not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Archived client",
    entityType: "client",
    entityName: client.name,
  });

  return client;
}

export function restoreClient(auth: AuthenticatedRequestContext, clientId: string) {
  const existingClient = db.clients.find(
    (client) => client.id === clientId && client.organizationId === auth.organization.id && client.deletedAt,
  );

  if (!existingClient) {
    throw new HttpError(404, "Archived client not found for this workspace");
  }

  const client = restoreClientRecord(clientId);
  if (!client) {
    throw new HttpError(404, "Archived client not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Restored client",
    entityType: "client",
    entityName: client.name,
  });

  return client;
}

export function updateClient(auth: AuthenticatedRequestContext, clientId: string, input: unknown) {
  const payload = updateClientSchema.parse(input);

  const existingClient = db.clients.find(
    (client) => client.id === clientId && client.organizationId === auth.organization.id,
  );

  if (!existingClient) {
    throw new HttpError(404, "Client not found for this workspace");
  }

  const client = updateClientRecord(clientId, payload);
  if (!client) {
    throw new HttpError(404, "Client not found for this workspace");
  }

  createActivityLog({
    organizationId: auth.organization.id,
    actorName: auth.user.name,
    action: "Updated client",
    entityType: "client",
    entityName: client.name,
  });

  return client;
}
