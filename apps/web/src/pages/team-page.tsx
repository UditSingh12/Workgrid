import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function TeamPage() {
  const { session } = useSession();
  const [members, setMembers] = useState<Awaited<ReturnType<typeof api.getMembers>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setMembers([]);
      return;
    }

    api
      .getMembers(session.token)
      .then(setMembers)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load members"));
  }, [session]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Team</p>
          <h2>Members, roles, and workspace access</h2>
        </div>
      </header>

      <SectionCard
        title="RBAC roadmap"
        description="This page now loads authenticated team membership data and permission sets."
      >
        {!session ? (
          <StatusPanel title="Authentication required" tone="danger">
            Sign in on the Auth page to load workspace members.
          </StatusPanel>
        ) : (
          <div className="table-like-list">
            {members.map((member) => (
              <div className="row-card" key={member.id}>
                <strong>{member.name}</strong>
                <span>{member.email}</span>
                <span>
                  {member.title} · {member.role}
                </span>
                <span>{member.permissions.slice(0, 3).join(", ")}</span>
              </div>
            ))}
          </div>
        )}

        {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
      </SectionCard>
    </div>
  );
}
