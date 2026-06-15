import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { signAccessToken } from "../src/lib/auth-token.js";
import { db } from "../src/data/mock-db.js";
import { resetDb } from "./helpers/reset-db.js";

function seedWorkspace(role: "owner" | "viewer" = "owner") {
  const organization = {
    id: "org-1",
    name: "Northstar Ops",
    slug: "northstar-ops",
    plan: "growth" as const,
    industry: "Logistics",
    timezone: "Asia/Kolkata",
    currency: "INR",
    createdAt: new Date().toISOString(),
  };

  const user = {
    id: "user-1",
    name: "Udit Singh",
    email: "udit@example.com",
    title: "Founder",
    password: "hashed-password",
    createdAt: new Date().toISOString(),
  };

  const membership = {
    id: "membership-1",
    userId: user.id,
    organizationId: organization.id,
    role,
    permissions:
      role === "owner"
        ? ([
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
          ] as const)
        : (["workspace:view", "clients:view", "projects:view"] as const),
    status: "active" as const,
  };

  db.organizations.push(organization);
  db.users.push(user);
  db.memberships.push(membership);

  return {
    token: signAccessToken({
      userId: user.id,
      organizationId: organization.id,
      membershipId: membership.id,
    }),
    organization,
  };
}

describe("clients routes", () => {
  beforeEach(() => {
    resetDb();
  });

  it("filters clients to the authenticated workspace and excludes archived records", async () => {
    const { token, organization } = seedWorkspace("owner");

    db.clients.push(
      {
        id: "client-1",
        organizationId: organization.id,
        name: "BluePeak Logistics",
        status: "active",
        accountManager: "Udit Singh",
      },
      {
        id: "client-2",
        organizationId: organization.id,
        name: "Archived Client",
        status: "lead",
        accountManager: "Udit Singh",
        deletedAt: new Date().toISOString(),
      },
      {
        id: "client-3",
        organizationId: "org-2",
        name: "Other Workspace Client",
        status: "active",
        accountManager: "Another User",
      },
    );

    const response = await request(app).get("/api/clients").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("BluePeak Logistics");
  });

  it("blocks client creation for members without create permissions", async () => {
    const { token } = seedWorkspace("viewer");

    const response = await request(app).post("/api/clients").set("Authorization", `Bearer ${token}`).send({
      name: "Restricted Client",
      status: "lead",
      accountManager: "Viewer User",
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/permission/i);
  });
});
