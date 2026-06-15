import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

type DashboardData = Awaited<ReturnType<typeof api.getDashboard>>;

function percent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function OverviewPage() {
  const { session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof api.getActivity>>>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!session?.token) {
      setData(null);
      setActivity([]);
      setError("Sign in on the Auth page to load workspace data.");
      return;
    }

    setError("");
    Promise.all([api.getDashboard(session.token), api.getActivity(session.token)])
      .then(([dashboardData, activityData]) => {
        setData(dashboardData);
        setActivity(activityData.slice(0, 4));
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Could not load dashboard"),
      );
  }, [session]);

  const metrics = data
    ? [
        { label: "Workspace", value: data.organization.name, detail: `${data.organization.plan} plan` },
        { label: "Team Members", value: String(data.summary.members), detail: "Active tenant memberships" },
        { label: "Projects", value: String(data.summary.projects), detail: `${data.summary.activeProjects} active` },
        { label: "Tasks", value: String(data.summary.tasks), detail: `${data.summary.clients} active clients connected` },
      ]
    : [
        { label: "Workspace", value: "...", detail: "Loading tenant data" },
        { label: "Team Members", value: "...", detail: "Loading tenant data" },
        { label: "Projects", value: "...", detail: "Loading tenant data" },
        { label: "Tasks", value: "...", detail: "Loading tenant data" },
      ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Operating system for modern B2B teams</h2>
          <p className="muted">
            Live workspace analytics, delivery health, and archived recovery controls are now flowing from authenticated API data.
          </p>
        </div>
      </header>

      {error ? <StatusPanel title="Workspace status" tone="danger">{error}</StatusPanel> : null}

      <div className="stats-grid">
        {metrics.map((metric) => (
          <SectionCard key={metric.label} title={metric.value} description={metric.label}>
            <p className="stat-detail">{metric.detail}</p>
          </SectionCard>
        ))}
      </div>

      {data ? (
        <>
          <div className="two-column-grid">
            <SectionCard
              title="Delivery analytics"
              description="Quick charts make execution health readable without leaving the overview."
            >
              <div className="chart-stack">
                {Object.entries(data.analytics.projectStatusCounts).map(([label, value]) => (
                  <div key={label} className="chart-row">
                    <div className="chart-row-label">
                      <span>{label.replace("_", " ")}</span>
                      <strong>{value}</strong>
                    </div>
                    <div className="chart-track">
                      <div
                        className="chart-fill chart-fill-projects"
                        style={{ width: `${percent(value, data.summary.projects || 1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Workflow distribution"
              description="Task throughput and queue balance across the workspace."
            >
              <div className="chart-stack">
                {Object.entries(data.analytics.taskStatusCounts).map(([label, value]) => (
                  <div key={label} className="chart-row">
                    <div className="chart-row-label">
                      <span>{label.replace("_", " ")}</span>
                      <strong>{value}</strong>
                    </div>
                    <div className="chart-track">
                      <div
                        className="chart-fill chart-fill-tasks"
                        style={{ width: `${percent(value, data.summary.tasks || 1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="stats-grid">
            <SectionCard title={`₹${data.analytics.revenue.paid.toLocaleString()}`} description="Paid revenue">
              <p className="stat-detail">Captured invoice value across this workspace</p>
            </SectionCard>
            <SectionCard title={`₹${data.analytics.revenue.pending.toLocaleString()}`} description="Pending revenue">
              <p className="stat-detail">Open invoice value still in the pipeline</p>
            </SectionCard>
            <SectionCard title={String(data.analytics.archived.clients)} description="Archived clients">
              <p className="stat-detail">Recoverable customer records</p>
            </SectionCard>
            <SectionCard title={String(data.analytics.archived.projects + data.analytics.archived.tasks)} description="Archived delivery items">
              <p className="stat-detail">Projects and tasks available for restore</p>
            </SectionCard>
          </div>

          <div className="two-column-grid">
            <SectionCard
              title="Operational posture"
              description="What is now in place for a stronger production-grade admin platform."
            >
              <ul className="list">
                <li>Route-level permission checks across workspace, members, billing, clients, projects, and tasks</li>
                <li>Mongo-backed soft delete and restore controls for core customer delivery records</li>
                <li>Refresh-token sessions with HTTP-only cookies and rotating secure access flows</li>
                <li>Workspace onboarding that creates the first real tenant instead of relying on demo setup</li>
              </ul>
            </SectionCard>

            <SectionCard
              title="Recent workspace activity"
              description="A short change feed keeps operators aware of account, delivery, and recovery actions."
            >
              <div className="activity-feed">
                {activity.map((item) => (
                  <div className="activity-item" key={item.id}>
                    <strong>{item.actorName}</strong>
                    <span>{item.action}</span>
                    <small>{item.entityName}</small>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Current projects"
            description="Live data coming from the dashboard endpoint with real workspace state."
          >
            <div className="table-like-list">
              {data.projects.map((project) => (
                <div className="row-card" key={project.id}>
                  <strong>{project.name}</strong>
                  <span>{project.status} workflow</span>
                  <small>Health: {project.health}</small>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Upcoming tasks"
            description="Due-date visibility for immediate execution planning."
          >
            <div className="table-like-list">
              {data.tasks.map((task) => (
                <div className="row-card" key={task.id}>
                  <strong>{task.title}</strong>
                  <span>{task.status}</span>
                  <small>Due {new Date(task.dueDate).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
