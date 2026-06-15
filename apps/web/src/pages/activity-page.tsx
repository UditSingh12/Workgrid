import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function ActivityPage() {
  const { session } = useSession();
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof api.getActivity>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setActivity([]);
      return;
    }

    api
      .getActivity(session.token)
      .then(setActivity)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load activity"));
  }, [session]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h2>Workspace activity feed and lightweight audit trail</h2>
        </div>
      </header>

      <SectionCard
        title="Recent actions"
        description="This timeline helps the SaaS platform feel operational and transparent."
      >
        {!session ? (
          <StatusPanel title="Authentication required" tone="danger">
            Sign in on the Auth page to load workspace activity.
          </StatusPanel>
        ) : (
          <div className="table-like-list">
            {activity.map((item) => (
              <div className="row-card" key={item.id}>
                <strong>
                  {item.actorName} · {item.action}
                </strong>
                <span>
                  {item.entityType} · {item.entityName}
                </span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
      </SectionCard>
    </div>
  );
}
