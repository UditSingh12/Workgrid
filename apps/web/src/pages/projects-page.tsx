import { useEffect, useState } from "react";

import { api, type ProjectRecord } from "../lib/api";
import { useSession } from "../shared/session";
import { SectionCard } from "../shared/components/section-card";
import { StatusPanel } from "../shared/components/status-panel";

export function ProjectsPage() {
  const { session } = useSession();
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ProjectRecord[]>([]);
  const [form, setForm] = useState({
    name: "",
    clientId: "",
    status: "planned" as "planned" | "active" | "review" | "completed",
    health: "good" as "good" | "risk",
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProjects(token: string) {
    const [clientList, projectList, archivedProjectList] = await Promise.all([
      api.getClients(token),
      api.getProjects(token),
      api.getArchivedProjects(token),
    ]);

    setClients(clientList.map((client) => ({ id: client.id, name: client.name })));
    setProjects(projectList);
    setArchivedProjects(archivedProjectList);
    if (clientList[0]) {
      setForm((current) => ({ ...current, clientId: current.clientId || clientList[0].id }));
    }
  }

  useEffect(() => {
    if (!session?.token) {
      setProjects([]);
      setArchivedProjects([]);
      setClients([]);
      return;
    }

    loadProjects(session.token)
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load projects"));
  }, [session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.token) {
      setError("Please sign in first.");
      return;
    }

    setError("");
    if (editingProjectId) {
      const updatedProject = await api.updateProject(session.token, editingProjectId, form).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not update project");
        return null;
      });

      if (!updatedProject) {
        return;
      }

      const clientName = clients.find((client) => client.id === updatedProject.clientId)?.name ?? "Unknown client";
      setProjects((current) =>
        current.map((project) => (project.id === updatedProject.id ? { ...updatedProject, clientName } : project)),
      );
      setMessage(`Project ${updatedProject.name} updated.`);
      setEditingProjectId(null);
    } else {
      const createdProject = await api.createProject(session.token, form).catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not create project");
        return null;
      });

      if (!createdProject) {
        return;
      }

      const clientName = clients.find((client) => client.id === createdProject.clientId)?.name ?? "Unknown client";
      setProjects((current) => [...current, { ...createdProject, clientName }]);
      setMessage(`Project ${createdProject.name} created.`);
    }

    setForm((current) => ({ ...current, name: "", status: "planned", health: "good" }));
  }

  async function handleArchive(projectId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const archivedProject = await api.archiveProject(session.token, projectId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not archive project");
      return null;
    });

    if (!archivedProject) {
      return;
    }

    const clientName = clients.find((client) => client.id === archivedProject.clientId)?.name ?? "Unknown client";
    setProjects((current) => current.filter((project) => project.id !== projectId));
    setArchivedProjects((current) => [{ ...archivedProject, clientName }, ...current]);
    setMessage(`Project ${archivedProject.name} archived.`);
  }

  async function handleRestore(projectId: string) {
    if (!session?.token) {
      return;
    }

    setError("");
    setMessage("");

    const restoredProject = await api.restoreProject(session.token, projectId).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Could not restore project");
      return null;
    });

    if (!restoredProject) {
      return;
    }

    const clientName = clients.find((client) => client.id === restoredProject.clientId)?.name ?? "Unknown client";
    setArchivedProjects((current) => current.filter((project) => project.id !== projectId));
    setProjects((current) => [{ ...restoredProject, clientName }, ...current]);
    setMessage(`Project ${restoredProject.name} restored.`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h2>Execution workspace for delivery teams</h2>
        </div>
      </header>

      <div className="two-column-grid">
        <SectionCard
          title="Project lifecycle"
          description="Manage delivery work with protected create, update, archive, and restore flows."
        >
          {!session ? (
            <StatusPanel title="Authentication required" tone="danger">
              Sign in on the Auth page to manage workspace projects.
            </StatusPanel>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Project name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                Client
                <select
                  value={form.clientId}
                  onChange={(event) => setForm({ ...form, clientId: event.target.value })}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as "planned" | "active" | "review" | "completed",
                    })
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Health
                <select
                  value={form.health}
                  onChange={(event) => setForm({ ...form, health: event.target.value as "good" | "risk" })}
                >
                  <option value="good">Good</option>
                  <option value="risk">Risk</option>
                </select>
              </label>
              <button className="primary-button" type="submit">
                {editingProjectId ? "Update project" : "Create project"}
              </button>
            </form>
          )}
        </SectionCard>

        <SectionCard
          title="Current projects"
          description="Live project data includes client context and delivery health."
        >
          <div className="table-like-list">
            {projects.map((project) => (
              <div className="entity-card" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <p>{project.clientName}</p>
                  <small>
                    {project.status} workflow · health {project.health}
                  </small>
                </div>
                <div className="entity-actions">
                  <button
                    className="inline-button"
                    type="button"
                    onClick={() => {
                      setEditingProjectId(project.id);
                      setForm({
                        name: project.name,
                        clientId: project.clientId,
                        status: project.status as "planned" | "active" | "review" | "completed",
                        health: project.health as "good" | "risk",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="inline-button inline-button-danger" type="button" onClick={() => handleArchive(project.id)}>
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Archived projects"
        description="Closed or removed projects stay recoverable for audit history and reactivation."
      >
        {archivedProjects.length === 0 ? (
          <p className="muted">No archived projects yet.</p>
        ) : (
          <div className="table-like-list">
            {archivedProjects.map((project) => (
              <div className="entity-card archived" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <p>{project.clientName}</p>
                  <small>{project.status} workflow archived</small>
                </div>
                <div className="entity-actions">
                  <button className="inline-button inline-button-success" type="button" onClick={() => handleRestore(project.id)}>
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {message ? <StatusPanel title="Saved" tone="success">{message}</StatusPanel> : null}
      {error ? <StatusPanel title="Error" tone="danger">{error}</StatusPanel> : null}
    </div>
  );
}
