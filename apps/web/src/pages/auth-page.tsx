import { useEffect, useState } from "react";

import { api, type DemoAccessPayload } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

type Mode = "login" | "register";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  title: string;
  organizationName: string;
  industry: string;
  timezone: string;
  currency: string;
  role: "owner" | "admin" | "manager" | "viewer";
  plan: "starter" | "growth" | "enterprise";
};

const initialRegisterState: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  title: "",
  organizationName: "",
  industry: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  role: "manager",
  plan: "growth",
};

export function AuthPage() {
  const { restoring, session, setSession } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [demoAccess, setDemoAccess] = useState<DemoAccessPayload | null>(null);

  useEffect(() => {
    api.getDemoAccess().then(setDemoAccess).catch(() => setDemoAccess(null));
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.login(loginForm);
      setSession(result);
      setMessage(`Welcome back ${result.user.name}. Workspace: ${result.organization.name} (${result.membership.role})`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.register(registerForm);
      setSession(result);
      setMessage(`Workspace ${result.organization.name} created for ${result.user.name}. Plan: ${result.organization.plan}`);
      setMode("login");
      setLoginForm({ email: registerForm.email, password: registerForm.password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Authentication</p>
          <h2>Owner login and tenant onboarding</h2>
          <p className="muted">Create the first real workspace, then sign back in with your own secured account.</p>
        </div>
      </header>

      {restoring ? (
        <StatusPanel title="Restoring session">
          Checking for a secure refresh session cookie and restoring workspace access.
        </StatusPanel>
      ) : null}

      {session ? (
        <StatusPanel title="Active session" tone="success">
          Logged in as {session.user.name} in {session.organization.name}. You can now use the
          Clients, Projects, Tasks, Billing, and Activity pages with live authenticated requests.
        </StatusPanel>
      ) : null}

      <div className="two-column-grid">
        <SectionCard
          title={mode === "login" ? "Sign in to workspace" : "Create a new workspace"}
          description="This flow now supports onboarding-first setup without any required demo tenant."
        >
          <div className="segmented-control">
            <button
              type="button"
              className={mode === "login" ? "segment active" : "segment"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "register" ? "segment active" : "segment"}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <form className="form-grid" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                />
              </label>
              <button className="primary-button" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form className="form-grid" onSubmit={handleRegister}>
              <label>
                Founder name
                <input
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                />
              </label>
              <label>
                Work email
                <input
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                />
              </label>
              <label>
                Job title
                <input
                  value={registerForm.title}
                  onChange={(event) => setRegisterForm({ ...registerForm, title: event.target.value })}
                />
              </label>
              <label>
                Organization name
                <input
                  value={registerForm.organizationName}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, organizationName: event.target.value })
                  }
                />
              </label>
              <label>
                Industry
                <input
                  value={registerForm.industry}
                  onChange={(event) => setRegisterForm({ ...registerForm, industry: event.target.value })}
                />
              </label>
              <label>
                Timezone
                <input
                  value={registerForm.timezone}
                  onChange={(event) => setRegisterForm({ ...registerForm, timezone: event.target.value })}
                />
              </label>
              <label>
                Currency
                <input
                  value={registerForm.currency}
                  onChange={(event) => setRegisterForm({ ...registerForm, currency: event.target.value })}
                />
              </label>
              <label>
                Plan
                <select
                  value={registerForm.plan}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      plan: event.target.value as "starter" | "growth" | "enterprise",
                    })
                  }
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
              <label>
                Initial role
                <select
                  value={registerForm.role}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      role: event.target.value as "owner" | "admin" | "manager" | "viewer",
                    })
                  }
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Teammate</option>
                </select>
              </label>
              <button className="primary-button" disabled={loading} type="submit">
                {loading ? "Creating..." : "Create workspace"}
              </button>
            </form>
          )}
        </SectionCard>

        <SectionCard
          title="Onboarding guidance"
          description="The platform is now designed to create the first real workspace instead of relying on seeded demo data."
        >
          <ul className="list">
            <li>Register once to create your organization, initial membership, and subscription record.</li>
            <li>Choose the first role carefully so the new workspace starts with the right level of access.</li>
            <li>Each workspace stays isolated through membership-aware API access and scoped permissions.</li>
            <li>If you want a completely clean local start, clear old demo Mongo records from earlier builds.</li>
          </ul>

          {demoAccess?.enabled ? (
            <div className="demo-card">
              <strong>Public demo mode is enabled</strong>
              <p>
                Workspace: {demoAccess.workspaceName}
                <br />
                Email: {demoAccess.email}
                <br />
                Password: {demoAccess.password}
              </p>
              <button
                className="inline-button inline-button-success"
                type="button"
                onClick={() =>
                  setLoginForm({
                    email: demoAccess.email ?? "",
                    password: demoAccess.password ?? "",
                  })
                }
              >
                Use demo credentials
              </button>
            </div>
          ) : null}

          {message ? <StatusPanel title="Success" tone="success">{message}</StatusPanel> : null}
          {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
        </SectionCard>
      </div>
    </div>
  );
}
