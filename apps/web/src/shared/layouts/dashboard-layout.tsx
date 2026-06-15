import { NavLink, Outlet } from "react-router-dom";

import { useSession } from "../session";

const navigation = [
  { to: "/", label: "Overview", end: true },
  { to: "/auth", label: "Auth" },
  { to: "/workspace", label: "Workspace" },
  { to: "/team", label: "Team" },
  { to: "/clients", label: "Clients" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" },
  { to: "/billing", label: "Billing" },
  { to: "/activity", label: "Activity" },
];

export function DashboardLayout() {
  const { session, signOut } = useSession();

  return (
    <div className="shell">
      <div className="shell-glow shell-glow-one" />
      <div className="shell-glow shell-glow-two" />

      <aside className="sidebar">
        <div>
          <p className="eyebrow">Multi-tenant SaaS</p>
          <h1>SaaS Admin</h1>
          <p className="muted">Business operations platform for teams, clients, billing, and reporting.</p>
          {session ? (
            <div className="sidebar-session">
              <strong>{session.user.name}</strong>
              <span>{session.organization.name}</span>
              <span>
                {session.membership.role} | {session.organization.plan}
              </span>
              <button className="ghost-button" type="button" onClick={() => void signOut()}>
                Log out
              </button>
            </div>
          ) : (
            <div className="sidebar-session">
              <strong>Guest mode</strong>
              <span>Open the Auth page to sign in.</span>
            </div>
          )}
        </div>

        <nav className="nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <div className="content-frame">
          <div className="content-topbar">
            <div>
              <p className="eyebrow">Workspace Console</p>
              <h2 className="content-title">Operations cockpit for tenant teams</h2>
            </div>
            <div className="topbar-chip">
              <span className="status-dot" />
              {session ? "Secure session active" : "Sign in to unlock workspace data"}
            </div>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
