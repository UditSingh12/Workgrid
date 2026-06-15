import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function WorkspacePage() {
  const { session } = useSession();
  const [workspace, setWorkspace] = useState<Awaited<ReturnType<typeof api.getWorkspace>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setWorkspace(null);
      return;
    }

    api
      .getWorkspace(session.token)
      .then(setWorkspace)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load workspace"));
  }, [session]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Tenant profile and platform settings</h2>
        </div>
      </header>

      <SectionCard
        title="Organization settings"
        description="This page now loads authenticated tenant settings and subscription context."
      >
        {!session ? (
          <StatusPanel title="Authentication required" tone="danger">
            Sign in on the Auth page to load workspace settings.
          </StatusPanel>
        ) : workspace ? (
          <div className="two-column-grid">
            <ul className="list">
              <li>Name: {workspace.organization.name}</li>
              <li>Slug: {workspace.organization.slug}</li>
              <li>Industry: {workspace.organization.industry}</li>
              <li>Timezone: {workspace.organization.timezone}</li>
              <li>Currency: {workspace.organization.currency}</li>
            </ul>
            <ul className="list">
              <li>Plan: {workspace.subscription.plan}</li>
              <li>Seats: {workspace.subscription.seats}</li>
              <li>Status: {workspace.subscription.status}</li>
              <li>Audit logs: {workspace.security.auditLogsEnabled ? "Enabled" : "Disabled"}</li>
              <li>2FA enforced: {workspace.security.twoFactorEnforced ? "Yes" : "No"}</li>
            </ul>
          </div>
        ) : (
          <p className="muted">Loading workspace...</p>
        )}

        {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
      </SectionCard>
    </div>
  );
}
