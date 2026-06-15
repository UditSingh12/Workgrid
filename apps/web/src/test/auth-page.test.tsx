import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthPage } from "../pages/auth-page";
import type { SessionData } from "../shared/types";

vi.mock("../shared/session", () => ({
  useSession: () => ({
    restoring: false,
    session: null,
    setSession: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("../lib/api", () => ({
  api: {
    getDemoAccess: vi.fn().mockResolvedValue({
      enabled: false,
      workspaceName: null,
      email: null,
      password: null,
    }),
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe("AuthPage", () => {
  it("shows onboarding-first guidance instead of demo credentials", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/create the first real workspace/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/register once to create your organization/i)).toBeInTheDocument();
    expect(screen.queryByText(/demo credentials/i)).not.toBeInTheDocument();
  });

  it("switches to the register flow and shows workspace creation fields", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/founder name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create workspace/i })).toBeInTheDocument();
  });
});
