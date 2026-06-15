import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SessionProvider, useSession } from "../shared/session";
import type { SessionData } from "../shared/types";

const refreshSession = vi.fn();
const logout = vi.fn();

vi.mock("../lib/api", () => ({
  api: {
    refreshSession: () => refreshSession(),
    logout: () => logout(),
  },
}));

function SessionProbe() {
  const { restoring, session } = useSession();

  return (
    <div>
      <span>{restoring ? "restoring" : "ready"}</span>
      <span>{session ? session.user.name : "signed-out"}</span>
    </div>
  );
}

const fakeSession: SessionData = {
  token: "token-123",
  user: {
    id: "user-1",
    name: "Udit Singh",
    email: "udit@example.com",
    title: "Founder",
  },
  organization: {
    id: "org-1",
    name: "Northstar Ops",
    plan: "growth",
    industry: "Logistics",
    timezone: "Asia/Kolkata",
    currency: "INR",
  },
  membership: {
    role: "owner",
  },
};

describe("SessionProvider", () => {
  beforeEach(() => {
    refreshSession.mockReset();
    logout.mockReset();
  });

  it("restores the current session from refresh cookies on mount", async () => {
    refreshSession.mockResolvedValue(fakeSession);

    render(
      <SessionProvider>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(screen.getByText("restoring")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
      expect(screen.getByText("Udit Singh")).toBeInTheDocument();
    });
  });

  it("falls back to signed-out state when refresh fails", async () => {
    refreshSession.mockRejectedValue(new Error("No session"));

    render(
      <SessionProvider>
        <SessionProbe />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
      expect(screen.getByText("signed-out")).toBeInTheDocument();
    });
  });
});
